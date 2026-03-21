'use client'; // NOTA: Las Server actions usan 'use server', pero por convención de archivos en Next.js App Router se ponen en 'use server' si son acciones independientes.
// Corregido: Debe ser 'use server' para ejecutarse en el servidor.
import { supabaseAdmin } from '@/lib/weather';
import { calcularMultiplicador } from '@/lib/pricing';

/**
 * Server Action para crear una reserva con precios dinámicos y candado pesimista.
 */
export async function crearReservaAction(params: {
    usuario_id: string;
    barberia_id: string;
    barbero_id: string;
    servicio_id: string;
    fecha_hora: string; // ISO String
    tipo_servicio: 'sucursal' | 'domicilio';
    monto_base: number;
    lat: number;
    lng: number;
}) {
    'use server';

    try {
        // 1. Obtener Fecha y Hora deterministas
        const fechaObj = new Date(params.fecha_hora);
        const fechaStr = fechaObj.toISOString().split('T')[0];
        const horaInt = fechaObj.getHours();

        // 2. Calcular Multiplicador de Precio Dinámico (Clima + Demanda)
        const multiplicador = await calcularMultiplicador({
            barberia_id: params.barberia_id,
            lat: params.lat,
            lng: params.lng,
            tipo_servicio: params.tipo_servicio,
            fecha: fechaStr,
            hora: horaInt
        });

        const montoTotal = Math.round(params.monto_base * multiplicador);

        // 3. Obtener Configuración de Anticipo (CMS)
        const { data: configAnticipo } = await supabaseAdmin
            .from('configuraciones')
            .select('valor')
            .eq('clave', 'porcentaje_anticipo')
            .single();

        const pctAnticipo = configAnticipo ? parseFloat(configAnticipo.valor) : 0.15;
        const montoAnticipo = Math.round(montoTotal * pctAnticipo);

        // 4. Ejecutar RPC Seguro (Locking Pesimista interno)
        const { data: reservaId, error: rpcError } = await supabaseAdmin
            .rpc('crear_reserva_segura', {
                p_usuario_id: params.usuario_id,
                p_barberia_id: params.barberia_id,
                p_barbero_id: params.barbero_id,
                p_servicio_id: params.servicio_id,
                p_fecha_hora: params.fecha_hora,
                p_monto_total: montoTotal,
                p_tipo_servicio: params.tipo_servicio,
                p_monto_anticipo: montoAnticipo
            });

        if (rpcError) {
            console.error('Error RPC crear_reserva_segura:', rpcError);
            return {
                success: false,
                error: rpcError.message || 'Error al procesar la reserva con bloqueo concurrentemente.'
            };
        }

        // 5. Registrar Evento de Auditoría
        await supabaseAdmin.from('audit_eventos').insert({
            tipo_evento: 'reserva_creada_segura',
            payload: {
                reserva_id: reservaId,
                usuario_id: params.usuario_id,
                monto_total: montoTotal,
                multiplicador: multiplicador
            }
        });

        return {
            success: true,
            reserva_id: reservaId,
            monto_total: montoTotal,
            monto_anticipo: montoAnticipo
        };

    } catch (error: any) {
        console.error('❌ Error en crearReservaAction:', error);
        return {
            success: false,
            error: error.message || 'Error interno del servidor al crear reserva.'
        };
    }
}
