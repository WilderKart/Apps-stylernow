import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/weather';

/**
 * Endpoint Dinámico para Reportes Admin: /api/admin/reportes/[tipo]
 * @param tipo: 'financiero' | 'operativo' | 'riesgo'
 * @param modo: 'real' | 'snapshot' (Query Param)
 */
export async function GET(
    request: Request,
    { params }: { params: { tipo: string } }
) {
    try {
        const url = new URL(request.url);
        const modo = url.searchParams.get('modo') || 'snapshot'; // Default snapshot
        const barberiaId = url.searchParams.get('barberia_id'); // Filtro tenant

        const tipo = params.tipo;

        if (!['financiero', 'operativo', 'riesgo'].includes(tipo)) {
            return NextResponse.json({ error: 'Tipo de reporte inválido.' }, { status: 400 });
        }

        if (!['real', 'snapshot'].includes(modo)) {
            return NextResponse.json({ error: 'Modo inválido. Usar real o snapshot.' }, { status: 400 });
        }

        // 1. OBTENER DATOS (SEGÚN MODO)
        let dataResult = null;

        if (modo === 'real') {
            console.log(`📊 Consultando reporte ${tipo} en modo REALTIME...`);
            
            if (tipo === 'financiero') {
                const query = supabaseAdmin
                    .from('transacciones_financieras')
                    .select('monto')
                    .eq('estado', 'aprobado');
                
                if (barberiaId) query.eq('barberia_id', barberiaId);
                
                const { data } = await query;
                const total = data?.reduce((sum, trx) => sum + Number(trx.monto), 0) || 0;
                dataResult = { total_ingresos: total, total_transacciones: data?.length || 0 };

            } else if (tipo === 'operativo') {
                const query = supabaseAdmin
                    .from('reservas')
                    .select('estado');

                if (barberiaId) query.eq('barberia_id', barberiaId);

                const { data } = await query;
                dataResult = {
                    reservas_totales: data?.length || 0,
                    reservas_canceladas: data?.filter(r => r.estado === 'cancelada').length || 0,
                    reservas_confirmadas: data?.filter(r => r.estado === 'confirmada').length || 0,
                };
            }

        } else {
            console.log(`🗄️ Consultando reporte ${tipo} en modo SNAPSHOT...`);
            
            const tableName = `reporte_${tipo}`;
            const query = supabaseAdmin
                .from(tableName)
                .select('*')
                .order('fecha', { ascending: false })
                .limit(30); // Histórico

            if (barberiaId) query.eq('barberia_id', barberiaId);

            const { data } = await query;
            dataResult = data;
        }

        // 2. Registrar Auditoría de Lectura
        await supabaseAdmin.from('audit_eventos').insert({
            tipo_evento: `reporte_consultado_${tipo}`,
            payload: { modo, barberia_id: barberiaId }
        });

        return NextResponse.json({
            success: true,
            modo: modo,
            tipo: tipo,
            data: dataResult
        });

    } catch (error: any) {
        console.error(`❌ Error en Endpoint Reportes ${params.tipo}:`, error);
        return NextResponse.json({ error: 'Error interno del servidor al cargar reporte.' }, { status: 500 });
    }
}
