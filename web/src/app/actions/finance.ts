import { supabaseAdmin } from '@/lib/weather';

/**
 * Server Action para reconciliar pagos pendientes cruzando con Mercado Pago.
 * Cron o Admin triggerable.
 */
export async function reconciliarPagosAction() {
    'use server';

    try {
        console.log('🔄 Iniciando Reconciliación de Pagos...');

        // 1. Obtener Transacciones Pendientes de las últimas 24 Horas en Ledger
        const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data: transacciones, error } = await supabaseAdmin
            .from('transacciones_financieras')
            .select('id, referencia_externa, reserva_id, usuario_id, barberia_id, tipo, monto')
            .eq('estado', 'pendiente')
            .gt('creado_en', hace24Horas);

        if (error || !transacciones) {
            console.log('No hay transacciones pendientes para reconciliar.');
            return { success: true, corregidos: 0 };
        }

        let corregidos = 0;
        const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';

        for (const trx of transacciones) {
            if (!trx.referencia_externa) continue;

            const paymentId = trx.referencia_externa;

            // 2. Consultar Mercado Pago
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${mpAccessToken}` }
            });

            if (!mpResponse.ok) {
                console.warn(`⚠️ No se pudo consultar pago ${paymentId} en MP durante reconciliación.`);
                continue;
            }

            const paymentData = await mpResponse.json();

            if (paymentData.status === 'approved') {
                console.log(`💡 Corrigiendo pago desfasado ${paymentId}. Estado en MP: approved.`);

                const idempotencyKey = `mp_rec_${paymentId}`;

                const { data: success, error: rpcError } = await supabaseAdmin
                    .rpc('procesar_pago_webhook', {
                        p_payment_id: paymentId,
                        p_monto: Number(paymentData.transaction_amount),
                        p_reserva_id: trx.reserva_id,
                        p_idempotency_key: idempotencyKey,
                        p_usuario_id: trx.usuario_id,
                        p_barberia_id: trx.barberia_id,
                        p_tipo: trx.tipo
                    });

                if (success) {
                    corregidos++;
                } else {
                    console.error(`❌ Falló RPC en reconciliación para ${paymentId}:`, rpcError);
                }
            }
        }

        // 3. Registrar Evento de Auditoría
        await supabaseAdmin.from('audit_eventos').insert({
            tipo_evento: 'reconciliacion_financiera_ejecutada',
            payload: {
                transacciones_pendientes_revisadas: transacciones.length,
                correciones_aplicadas: corregidos
            }
        });

        console.log(`✅ Reconciliación finalizada. Corregidos: ${corregidos}`);
        return { success: true, corregidos };

    } catch (error: any) {
        console.error('❌ Error en reconciliarPagosAction:', error);
        return { success: false, error: error.message };
    }
}
