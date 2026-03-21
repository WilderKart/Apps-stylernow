import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/weather';
import { mpPreference } from '@/lib/mercadopago';

/**
 * Crea una preferencia de pago en Mercado Pago para una reserva específica.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { reserva_id, usuario_id } = body;

        if (!reserva_id || !usuario_id) {
            return NextResponse.json({ error: 'reserva_id o usuario_id faltante' }, { status: 400 });
        }

        // 1. Obtener datos de la Reserva (Capa Zero-Trust Backend)
        const { data: reserva, error: reservaError } = await supabaseAdmin
            .from('reservas')
            .select('monto_anticipo, monto_total, tipo_servicio, barberia_id, estado')
            .eq('id', reserva_id)
            .single();

        if (reservaError || !reserva) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        if (reserva.estado !== 'pendiente') {
            return NextResponse.json({ error: 'La reserva ya no se encuentra pendiente para pago.' }, { status: 400 });
        }

        // 2. Construir la Preferencia de Mercado Pago
        // Se cobra el monto_anticipo calculado por Server Action previo en reserva
        const preferenceResponse = await mpPreference.create({
            body: {
                items: [
                    {
                        id: reserva_id,
                        title: `Reserva Barbería - Anticipo`,
                        unit_price: Number(reserva.monto_anticipo),
                        quantity: 1,
                        currency_id: 'COP'
                    }
                ],
                external_reference: reserva_id,
                metadata: {
                    usuario_id: usuario_id,
                    barberia_id: reserva.barberia_id,
                    monto_total: reserva.monto_total
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cliente/reservas?status=success`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cliente/reservas?status=failure`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cliente/reservas?status=pending`
                },
                auto_return: 'approved',
                notification_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/webhook?topic=payment` // Forzado
            }
        });

        console.log(`💳 Preferencia creada para Reserva ${reserva_id}. ID: ${preferenceResponse.id}`);

        return NextResponse.json({
            success: true,
            init_point: preferenceResponse.init_point, // URL de pasarela
            preference_id: preferenceResponse.id
        });

    } catch (error: any) {
        console.error('❌ Error en Crear Preferencia:', error);
        return NextResponse.json({ error: 'Error interno del servidor al crear preferencia.' }, { status: 500 });
    }
}
