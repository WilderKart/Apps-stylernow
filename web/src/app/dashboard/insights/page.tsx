import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldAlert, TrendingUp, Cpu, Calendar, Target, PlusCircle } from 'lucide-react'
import ExecutePromoButton from '@/components/ExecutePromoButton'

export const metadata = {
  title: 'Insights Center | StylerNow',
}

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (!membership?.tenant_id) {
    return (
      <div className="p-8 text-center text-white">
        <h2 className="text-xl font-bold">No tienes barberías asignadas.</h2>
      </div>
    )
  }

  const { data: logs } = await supabase
    .from('ai_insight_logs')
    .select('*')
    .eq('tenant_id', membership.tenant_id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-white space-y-8 animate-fade-in">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Insights Center
          </h1>
          <p className="text-gray-400 mt-2">
            Historial inmutable de auditoría y recomendaciones estratégicas de la IA.
          </p>
        </div>
        <Cpu className="w-10 h-10 text-indigo-500/50" />
      </div>

      {!logs || logs.length === 0 ? (
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <Target className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white">No hay Insights Registrados</h3>
          <p className="text-gray-400 max-w-sm mt-2">
            El Motor Inteligente evalúa diariamente tu negocio. Tus registros inmutables aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {logs.map((log) => {
             const output = log.output_ai;
             const dateStr = new Date(log.created_at).toLocaleString('es-ES');
             
             return (
              <div key={log.id} className="bg-neutral-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-6">
                
                {/* Meta Panel */}
                <div className="md:w-1/4 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-4 space-y-4">
                   <div>
                     <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Estado del Insight</span>
                     {log.status === 'pending' && <span className="inline-flex px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">PENDIENTE</span>}
                     {log.status === 'auto-executed' && <span className="inline-flex px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">AUTO-EJECUTADO</span>}
                     {log.status === 'resolved' && <span className="inline-flex px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">RESUELTO</span>}
                   </div>
                   
                   <div>
                     <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Prioridad</span>
                     <span className="text-lg font-bold text-white">{log.priority_score}/100</span>
                   </div>

                   <div>
                     <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Impacto Core</span>
                     <span className="text-sm font-medium text-indigo-400 capitalize">{log.impact_type}</span>
                   </div>

                   <div className="pt-2 text-xs text-gray-500 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {dateStr}
                   </div>
                </div>

                {/* Info Panel */}
                <div className="md:w-3/4 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">{output?.summary || 'Resumen no disponible'}</h4>
                      {log.is_anomaly && (
                        <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20 inline-flex mt-2">
                          <ShieldAlert className="w-4 h-4"/>
                           ¡Anomalía Detectada en Histórico!
                        </div>
                      )}
                    </div>

                    {/* Insights List */}
                    {output?.insights && output.insights.length > 0 && (
                      <div className="bg-black/20 p-4 rounded-xl space-y-3 border border-white/5">
                        <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Hallazgos Estratégicos</h5>
                         {output.insights.map((ins: any, idx: number) => (
                           <div key={idx} className="border-l-2 border-indigo-500 pl-4 py-1">
                             <p className="font-medium text-white text-sm">{ins.title}</p>
                             <p className="text-gray-400 text-xs mt-1">Causa: {ins.cause}</p>
                             <p className="text-indigo-400/80 text-xs mt-1">Impacto: {ins.impact}</p>
                           </div>
                         ))}
                      </div>
                    )}

                    {/* Promotions Suggestions */}
                    {output?.promotions && output.promotions.length > 0 && (
                      <div className="space-y-4">
                         <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Plan de Acción / Promociones Sugeridas</h5>
                         <div className="grid md:grid-cols-2 gap-4">
                            {output.promotions.map((promo: any, idx: number) => (
                              <div key={idx} className="bg-emerald-900/10 border border-emerald-500/30 p-4 rounded-lg flex flex-col justify-between">
                                  <div>
                                    <h6 className="font-semibold text-emerald-400 mb-1">{promo.title}</h6>
                                    <p className="text-xs text-gray-300 mb-2">{promo.type} - Validez: 30 Días</p>
                                    <div className="text-2xl font-bold text-white mb-4">-{promo.value}% OFF</div>
                                  </div>
                                  
                                  <ExecutePromoButton 
                                    tenantId={membership.tenant_id} 
                                    logId={log.id} 
                                    promoParams={{...promo, target: promo.target || 'general'}}
                                    disabled={log.status === 'auto-executed'}
                                  />
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                </div>

              </div>
             )
          })}
        </div>
      )}
    </div>
  )
}
