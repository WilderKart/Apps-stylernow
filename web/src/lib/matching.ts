import { supabaseAdmin } from './weather';

interface MatchContext {
    cliente_lat: number;
    cliente_lng: number;
    servicio_id: string;
    zona_riesgo_nivel?: number; // 1, 2, 3
}

interface BarberoScore {
    barbero_id: string;
    nombre: string;
    score: number;
    distancia_km: number;
    tiempo_espera_min: number;
    riesgo_score: number;
}

/**
 * Calcula la distancia Haversine en KM entre dos puntos
 */
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * Motor de Matching para Domicilios.
 * Prioriza: Distancia (40%), Tiempo (30%), Riesgo (30%).
 */
export async function emparejarBarbero(context: MatchContext): Promise<BarberoScore[]> {
    try {
        // 1. Obtener Barberos Activos y Disponibles
        // Asumiendo tabla 'usuarios' con 'rol' = 'barbero' y 'esta_activo' / 'disponible'
        const { data: barberos, error } = await supabaseAdmin
            .from('usuarios')
            .select('id, nombre, lat, lng, rating, riesgo_score_interno')
            .eq('rol', 'barbero')
            .eq('esta_activo', true)
            .eq('esta_disponible', true);

        if (error || !barberos) {
            console.error('Error al cargar barberos:', error);
            return [];
        }

        const scores: BarberoScore[] = barberos.map(barbero => {
            const latBarbero = parseFloat(barbero.lat || '0');
            const lngBarbero = parseFloat(barbero.lng || '0');

            // A) Distancia (40%) - Aprox 10km max
            const distancia = calcularDistancia(context.cliente_lat, context.cliente_lng, latBarbero, lngBarbero);
            const scoreDistancia = Math.max(0, 40 - (distancia * 4)); // -4pts por KM

            // B) Tiempo Espera (30%) - Simulación o Carga actual de reservas
            // Por ahora simularemos 15-30min
            const tiempoEspera = Math.floor(Math.random() * 20) + 10; 
            const scoreTiempo = Math.max(0, 30 - (tiempoEspera * 0.5));

            // C) Riesgo (30%)
            const riesgoScoreInterno = barbero.riesgo_score_interno || 0;
            const scoreRiesgo = Math.max(0, 30 - (riesgoScoreInterno * 3)); // Castigo por riesgo alto

            // D) Rating Bonus (-20% / 20pts)
            const rating = barbero.rating || 4.0;
            const scoreRating = rating * 4; // 5 * 4 = 20 pts

            const totalScore = scoreDistancia + scoreTiempo + scoreRiesgo + scoreRating;

            return {
                barbero_id: barbero.id,
                nombre: barbero.nombre,
                score: Math.round(totalScore * 100) / 100,
                distancia_km: Math.round(distancia * 100) / 100,
                tiempo_espera_min: tiempoEspera,
                riesgo_score: riesgoScoreInterno
            };
        });

        // Ordenar por mayor Score
        return scores.sort((a, b) => b.score - a.score);

    } catch (error) {
        console.error('❌ Error en emparejarBarbero:', error);
        return [];
    }
}
