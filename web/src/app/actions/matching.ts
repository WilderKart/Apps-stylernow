'use server';

import { emparejarBarbero } from '@/lib/matching';
import { supabaseAdmin } from '@/lib/weather';

interface MatchingParams {
    cliente_id: string;
    lat: number;
    lng: number;
    servicio_id: string;
}

/**
 * Server Action para buscar barberos cercanos mediante scoring inteligente.
 */
export async function buscarBarberosMatching(params: MatchingParams) {
    try {
        // 1. Validar Riesgo del usuario (Capa Zero Trust)
        const { data: usuario } = await supabaseAdmin
            .from('usuarios')
            .select('riesgo_score, nivel')
            .eq('id', params.cliente_id)
            .single();

        if (usuario && usuario.riesgo_score > 8) { // Ejemplo de Bloqueo
            console.log(`⚠️ Usuario ${params.cliente_id} bloqueado por Scoring de Riesgo Alto.`);
            return {
                success: false,
                error: 'Tu cuenta requiere verificación de identidad para solicitar domicilios.'
            };
        }

        // 2. Ejecutar Algoritmo de Matching
        const candidatos = await emparejarBarbero({
            cliente_lat: params.lat,
            cliente_lng: params.lng,
            servicio_id: params.servicio_id
        });

        if (candidatos.length === 0) {
            return {
                success: true,
                candidatos: [],
                message: 'No hay barberos disponibles en este momento.'
            };
        }

        // 3. Registrar en Auditoría
        await supabaseAdmin.from('audit_eventos').insert({
            tipo_evento: 'matching_ejecutado',
            payload: {
                cliente_id: params.cliente_id,
                candidatos_encontrados: candidatos.length,
                mejor_candidato: candidatos[0]?.barbero_id
            }
        });

        // 4. Devolver candidatos formateados
        return {
            success: true,
            candidatos: candidatos.slice(0, 5) // Devolver top 5 opciones
        };

    } catch (error: any) {
        console.error('❌ Error en buscarBarberosMatching:', error);
        return {
            success: false,
            error: error.message || 'Error interno al procesar matching.'
        };
    }
}
