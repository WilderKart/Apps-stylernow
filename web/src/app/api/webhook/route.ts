import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/weather';

/**
 * Webhook de Mercado Pago para procesar pagos aprobados.
 */
export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        console.log(`🔔 Webhook recibido: Topic=${topic}, ID=${id}`);

        // 1. Validar que sea un evento de Pago
        if (topic !== 'payment') {
            return NextResponse.json({ received: true }); // Ignorar otros payloads (merchant_order, etc.)
        }

        if (!id) {
            return NextResponse.json({ error: 'ID faltante' }, { status: 400 });
        }

        // 2. Consultar Pago en Mercado Pago (Capa de Verificación Externa)
        const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';
        
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            headers: {
                Authorization: `Bearer ${mpAccessToken}`
            }
        });

        if (!mpResponse.ok) {
            console.error(`❌ Error al consultar pago ${id} en MP:`, await mpResponse.text());
            return NextResponse.json({ error: 'Error al consultar Mercado Pago' }, { status: 502 });
        }

        const paymentData = await mpResponse.json();

        const status = paymentData.status; // 'approved', 'pending', etc.
        const monto = paymentData.transaction_amount;
        const reservaId = paymentData.external_reference; // Se asume que MP manda el Reserva ID aquí
        const usuarioId = paymentData.metadata?.usuario_id; 
        const barberiaId = paymentData.metadata?.barberia_id; 

        if (status !== 'approved') {
            console.log(`⏳ Pago ${id} con estado ${status}. Ignorando o pendiente.`);
            return NextResponse.json({ received: true });
        }

        if (!reservaId) {
            console.error(`❌ Pago ${id} no tiene external_reference (reservaId).`);
            return NextResponse.json({ error: 'reservaId faltante en external_reference' }, { status: 400 });
        }

        // 3. Procesar Atómicamente en Base de Datos ( Ledger + Reserva )
        const idempotencyKey = `mp_${id}`; // Ej: mp_1234567

        const { data: success, error: rpcError } = await supabaseAdmin
            .rpc('procesar_pago_webhook', {
                p_payment_id: id,
                p_monto: monto,
                p_reserva_id: reservaId,
                p_idempotency_key: idempotencyKey,
                p_usuario_id: usuarioId,
                p_barberia_id: barberiaId,
                p_tipo: 'anticipo' // Por ahora anticipo
            });

        if (rpcError) {
            console.error('❌ Error RPC procesar_pago_webhook:', rpcError);
            
            // Si el error es por idempotencia (ya procesado), responder 200 para que MP no siga reintentando
            if (rpcError.message.includes('Idempotencia')) {
                return NextResponse.json({ success: true, message: 'Pago ya procesado anteriormente.' });
            }

            return NextResponse.json({ error: rpcError.message }, { status: 500 });
        }

        console.log(`✅ Pago ${id} procesado y Reserva ${reservaId} confirmada.`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('❌ Error en Webhook POST:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
