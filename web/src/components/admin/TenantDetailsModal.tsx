'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, XCircle, TrendingUp, Users, Clock, DollarSign, Activity, AlertTriangle } from 'lucide-react'
import { getTenantModalDetails, finalizeTenantOnboarding } from '@/app/admin/actions/admin-modal-actions'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useRouter } from 'next/navigation'

interface Props {
  tenantId: string
  onClose: () => void
}

export default function TenantDetailsModal({ tenantId, onClose }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const fetchContext = async () => {
      setLoading(true)
      const res = await getTenantModalDetails(tenantId)
      if (mounted && !res.error) {
        setData(res)
      }
      if (mounted) setLoading(false)
    }
    fetchContext()
    
    // Bloquear scroll
    document.body.style.overflow = 'hidden'
    return () => {
      mounted = false
      document.body.style.overflow = 'auto'
    }
  }, [tenantId])

  const handleAction = async (actionType: 'approve' | 'reject') => {
    setActionLoading(true)
    const reason = actionType === 'approve' ? 'Aprobado por Admin B2B' : 'Rechazado por Riesgo'
    const res = await finalizeTenantOnboarding(tenantId, actionType, reason)
    if (!res.error) {
       router.refresh()
       onClose()
    }
    setActionLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#101010] border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[#101010]/95 backdrop-blur-md border-b border-zinc-800 p-6 flex items-start justify-between">
            <div>
               <h2 className="text-2xl font-black text-white flex items-center gap-2">
                 {loading ? 'Cargando Contexto...' : data?.tenant?.nombre}
               </h2>
               {!loading && data && (
                  <p className="text-zinc-400 font-medium mt-1 uppercase tracking-wider text-xs flex items-center gap-2">
                    ID: {tenantId.split('-')[0]} • Creada hace {data.tenant?.daysActive} días
                    {!data.tenant.activa && (
                      <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">PENDING (EN REVISIÓN)</span>
                    )}
                  </p>
               )}
            </div>
            <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-full transition-colors">
              <X className="w-5 h-5"/>
            </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
               <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
               <p>Ingiriendo métricas de negocio...</p>
             </div>
          ) : !data ? (
             <div className="text-center text-zinc-500 py-10 text-lg">Aún no hay datos suficientes de este negocio.</div>
          ) : (
            <div className="space-y-8">
              
              {/* 1. Resumen Inteligente y Botonera (Aprobación) */}
              <div className="flex flex-col md:flex-row gap-6">
                 {/* Estado Recomendado */}
                 <div className={`flex-1 border border-${data.tenant.recommendedStatus.color}-500/30 bg-${data.tenant.recommendedStatus.color}-500/5 rounded-2xl p-6 relative overflow-hidden`}>
                     <div className={`absolute top-0 right-0 w-16 h-16 bg-${data.tenant.recommendedStatus.color}-500 blur-3xl opacity-20`} />
                     <p className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-2">Evaluación del Sistema Experto</p>
                     <p className={`text-2xl font-extrabold text-${data.tenant.recommendedStatus.color}-500 mb-1 flex items-center gap-2`}>
                        {data.tenant.recommendedStatus.code === 'RED' && <AlertTriangle className="w-6 h-6"/>}
                        {data.tenant.recommendedStatus.code === 'GREEN' && <CheckCircle2 className="w-6 h-6"/>}
                        {data.tenant.recommendedStatus.label}
                     </p>
                     <p className="text-sm font-medium text-zinc-400">Basado en volumen financiero y edad de suscripción.</p>
                 </div>

                 {/* Acciones */}
                 {!data.tenant.activa && (
                   <div className="flex-1 flex flex-col justify-center gap-3 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                     <p className="text-xs uppercase tracking-widest font-bold text-zinc-500 text-center">Decisión del Admin</p>
                     <div className="flex gap-4">
                       <button 
                         onClick={() => handleAction('approve')}
                         disabled={actionLoading}
                         className="flex-1 bg-green-500 hover:bg-green-600 text-black font-black py-3 rounded-xl transition-colors disabled:opacity-50"
                       >
                         {actionLoading ? 'Procesando...' : 'Aprobar Barbería'}
                       </button>
                       <button 
                         onClick={() => handleAction('reject')}
                         disabled={actionLoading}
                         className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-black py-3 rounded-xl transition-colors disabled:opacity-50"
                       >
                         Rechazar / Riesgo
                       </button>
                     </div>
                   </div>
                 )}
              </div>

              {/* 2. Grid Rápido (Los 6 Puntos) */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                 <MetricCard icon={<DollarSign/>} title="Ingresos Mensuales" value={`$${data.metrics.income.month.toLocaleString()}`} subtitle={`Ticket Promedio: $${data.metrics.income.avgTicket.toFixed(1)}`} />
                 <MetricCard icon={<Users/>} title="Total Clientes" value={data.metrics.clients.total} subtitle={`Registrados en Supabase`} />
                 <MetricCard icon={<Clock/>} title="Citas Históricas" value={data.metrics.operation.totalBookings} subtitle={`Pico a las ${data.metrics.operation.peakHour}`} />
              </div>

              {/* 3. Rendimiento Financiero Gráfico (Recharts) */}
              <div>
                  <h3 className="text-zinc-300 font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500"/> Trayectoria de 7 días</h3>
                  
                  {data.metrics.income.week === 0 ? (
                    <div className="h-64 border border-zinc-800 rounded-2xl flex items-center justify-center bg-zinc-900/50">
                       <p className="text-zinc-500 italic">No hay registros financieros en esta semana</p>
                    </div>
                  ) : (
                    <div className="h-64 border border-zinc-800 rounded-2xl p-4 bg-zinc-900/50">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.chartData}>
                          <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                          <RechartsTooltip 
                             contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                             itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, title, value, subtitle }: { icon: any, title: string, value: string|number, subtitle: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-colors">
      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-1">{title}</p>
      <h3 className="text-2xl font-black text-white mb-1">{value}</h3>
      <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>
    </div>
  )
}
