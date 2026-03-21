import { supabaseAdmin } from './weather';
import { getClimaActual } from './weather';

interface PricingContext {
    barberia_id: string;
    lat: number;
    lng: number;
    tipo_servicio: 'sucursal' | 'domicilio';
    fecha: string; // 'YYYY-MM-DD'
    hora: number;  // 0-23
}

/**
 * Calcula el multiplicador de precio dinámico.
 * Cap máximo: 1.5x
 */
export async function calcularMultiplicador(context: PricingContext): Promise<number> {
    let multiplicador = 1.0;

    try {
        // 1. CARGAR CONFIGURACIONES (CMS)
        // Podríamos consultar la tabla `configuraciones` para ver si `pricing_dinamico` está activo.
        const { data: configPricing } = await supabaseAdmin
            .from('configuraciones')
            .select('valor')
            .eq('clave', 'pricing_dinamico_activo')
            .single();

        if (configPricing && configPricing.valor === 'false') {
            return 1.0; // Desactivado por CMS
        }

        // 2. FACTOR DEMANDA (Metricas_Demanda)
        const { data: demanda } = await supabaseAdmin
            .from('metricas_demanda')
            .select('total_reservas')
            .eq('barberia_id', context.barberia_id)
            .eq('fecha', context.fecha)
            .eq('hora', context.hora)
            .single();

        if (demanda && demanda.total_reservas > 3) { // Umbral de ejemplo
            console.log('📈 Demanda alta detectada. Aplicando multiplicador.');
            multiplicador += 0.20; // +20%
        }

        // 3. FACTOR CLIMA (Solo para Domicilio)
        if (context.tipo_servicio === 'domicilio') {
            const { data: configClima } = await supabaseAdmin
                .from('configuraciones')
                .select('valor')
                .eq('clave', 'clima_activo')
                .single();

            if (!configClima || configClima.valor === 'true') {
                const weathercode = await getClimaActual(context.lat, context.lng);

                if (weathercode !== null) {
                    // Códigos Open-Meteo: 51-57 (Llovizna), 61-67 (Lluvia), 80-82 (Chubascos), 95-99 (Tormentas)
                    if (weathercode >= 51 && weathercode <= 67) {
                        console.log('☔ Lluvia moderada detectada. +15% para domicilio.');
                        multiplicador += 0.15;
                    } else if (weathercode >= 80 || weathercode >= 95) {
                        console.log('⛈️ Tormenta o lluvia fuerte. +30% para domicilio.');
                        multiplicador += 0.30;
                    }
                }
            }
        }

        // 4. CAP MÁXIMO (No exceder 1.5x)
        const { data: configMax } = await supabaseAdmin
            .from('configuraciones')
            .select('valor')
            .eq('clave', 'max_multiplicador')
            .single();
        
        const capMax = configMax ? parseFloat(configMax.valor) : 1.5;
        
        if (multiplicador > capMax) {
            console.log(`🔒 Multiplicador topado por CAP: ${capMax}`);
            multiplicador = capMax;
        }

        return Math.round(multiplicador * 100) / 100; // Redondear a 2 decimales

    } catch (error) {
        console.error('❌ Error en calcularMultiplicador:', error);
        return 1.0; // Fallback neutro
    }
}
