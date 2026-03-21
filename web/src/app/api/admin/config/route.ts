import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/weather';

/**
 * Endpoint para gestión de Configuraciones (CMS): /api/admin/config
 */

// 1. Obtener todas las configuraciones
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('configuraciones')
            .select('clave, valor, tipo');

        if (error) throw error;

        // Formatear como objeto clave: valor para el frontend
        const configMap: Record<string, any> = {};
        data.forEach(item => {
            configMap[item.clave] = item.tipo === 'float' || item.tipo === 'int' 
                ? Number(item.valor) 
                : item.valor === 'true' ? true : item.valor === 'false' ? false : item.valor;
        });

        return NextResponse.json({ success: true, config: configMap });

    } catch (error: any) {
        console.error('❌ Error en GET /api/admin/config:', error);
        return NextResponse.json({ error: 'Error al cargar configuraciones.' }, { status: 500 });
    }
}

// 2. Actualizar configuración
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clave, valor } = body;

        if (!clave || valor === undefined) {
            return NextResponse.json({ error: 'Clave y valor requeridos.' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('configuraciones')
            .upsert({ clave, valor: String(valor) })
            .eq('clave', clave);

        if (error) throw error;

        // Registrar Evento
        await supabaseAdmin.from('audit_eventos').insert({
            tipo_evento: 'configuracion_actualizada',
            payload: { clave, nuevo_valor: valor }
        });

        return NextResponse.json({ success: true, message: 'Configuración actualizada.' });

    } catch (error: any) {
        console.error('❌ Error en POST /api/admin/config:', error);
        return NextResponse.json({ error: 'Error al actualizar configuración.' }, { status: 500 });
    }
}
