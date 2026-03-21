'use server';

import { supabaseAdmin } from '@/lib/weather';
import { revalidatePath } from 'next/cache';

const METADATA_CONFIG: Record<string, { description: string, icon: string }> = {
  porcentaje_anticipo: { description: 'Porcentaje de dinero requerido para confirmar una reserva.', icon: 'Zap' },
  porcentaje_comision: { description: 'Comisión que se queda la plataforma por cada servicio.', icon: 'BarChart' },
  clima_activo: { description: 'Activa o desactiva el impacto del clima en el precio dinámico.', icon: 'Sparkles' },
  max_precio: { description: 'Tope máximo de multiplicador permitido (Ej: 1.5 = 150%).', icon: 'Shield' },
  domicilios_activos: { description: 'Habilita reservas para servicios a domicilio.', icon: 'Bot' },
};

/**
 * Carga las configuraciones/flags del CMS
 */
export async function getFeaturesAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from('configuraciones')
      .select('clave, valor, tipo');

    if (error) throw error;

    return data.map((c: any) => {
        const meta = METADATA_CONFIG[c.clave] || { description: 'Configuración del sistema.', icon: 'Settings2' };
        return {
            id: c.clave,
            name: c.clave.replace(/_/g, ' ').toUpperCase(),
            description: meta.description,
            icon: meta.icon,
            active: c.valor === 'true' || c.valor === '1',
            tipo: c.tipo
        };
    }) || [];

  } catch (error) {
    console.error("Error cargando features en configuraciones:", error);
    return [];
  }
}

/**
 * Alternar estado de una flag tipo boolean
 */
export async function toggleFeatureAction(clave: string, currentStatus: boolean) {
  try {
    const nuevoValor = !currentStatus ? 'true' : 'false';

    const { error } = await supabaseAdmin
      .from('configuraciones')
      .upsert({ clave, valor: nuevoValor })
      .eq('clave', clave);

    if (error) throw error;

    // Registrar Evento
    await supabaseAdmin.from('audit_eventos').insert({
        tipo_evento: 'configuracion_toggled',
        payload: { clave, nuevo_valor: nuevoValor }
    });

    revalidatePath('/admin/features');
    return { success: true };

  } catch (error: any) {
    console.error("Error al actualizar feature flag:", error);
    return { success: false, error: error.message };
  }
}
