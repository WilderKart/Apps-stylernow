import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Crear cliente de servicio para operaciones en Backend protegidas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Obtiene el clima actual desde Open-Meteo con caching de 10 minutos.
 */
export async function getClimaActual(lat: number, lng: number): Promise<number | null> {
    try {
        // 1. Buscar en Caché
        // Aproximar a 2 decimales para agrupar ubicaciones cercanas
        const approxLat = Math.round(lat * 100) / 100;
        const approxLng = Math.round(lng * 100) / 100;

        const { data: cache, error } = await supabaseAdmin
            .from('cache_clima')
            .select('weathercode, obtenido_en')
            .filter('lat', 'eq', approxLat)
            .filter('lng', 'eq', approxLng)
            .order('obtenido_en', { ascending: false })
            .limit(1)
            .single();

        if (cache && cache.obtenido_en) {
            const cacheTime = new Date(cache.obtenido_en).getTime();
            const now = Date.now();
            const diffMin = (now - cacheTime) / 1000 / 60;

            if (diffMin < 10) {
                console.log('✅ Clima obtenido de Caché');
                return cache.weathercode;
            }
        }

        // 2. Fetch de API Externa (Open-Meteo)
        console.log('🌐 Obteniendo clima desde Open-Meteo...');
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
        );

        if (!response.ok) {
            throw new Error('Error al consultar Open-Meteo');
        }

        const resData = await response.json();
        const weathercode = resData.current_weather?.weathercode;

        if (weathercode !== undefined) {
            // 3. Guardar en Caché (Background)
            supabaseAdmin.from('cache_clima').insert({
                lat: approxLat,
                lng: approxLng,
                weathercode: weathercode
            }).then(() => console.log('💾 Clima guardado en caché.')).catch(console.error);

            return weathercode;
        }

        return null;

    } catch (error) {
        console.error('❌ Error en getClimaActual:', error);
        return null; // Fallback neutro
    }
}
