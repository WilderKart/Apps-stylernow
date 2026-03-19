import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { aggregateAllMasterKPIs } from '../actions/kpi-actions'
import { DollarSign, Users, Scissors, LineChart, PhoneOff, CalendarRange } from 'lucide-react'
import ProactiveDashboard from './ProactiveDashboard'

export const dynamic = 'force-dynamic'

export default async function KPIDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role, tenants(name, status)')
    .eq('user_id', user.id)
    .single()

  if (!membership || (membership.role !== 'master' && membership.role !== 'admin')) {
    redirect('/dashboard') // Fallback a general
  }

  // Cast para manejar el array que devuelve el join a 'tenants' (al usar relacion uno a muchos puede venir en array en TS proxy)
  const tenantData: any = membership.tenants;
  const tenantStatus = Array.isArray(tenantData) ? tenantData[0]?.status : tenantData?.status;
  
  if (tenantStatus !== 'active') {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold bg-yellow-100 p-4 text-yellow-800 rounded-xl">
          Tu barbería debe estar aprobada y activa para ver métricas de negocio.
        </h2>
      </div>
    )
  }

  const kpis: any = await aggregateAllMasterKPIs(membership.tenant_id)

  if (kpis.error) {
     return <div className="p-8 text-red-600">Error cargando métricas: {kpis.error}</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 p-4 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Growth Engine</h1>
          <p className="text-sm text-gray-500 mt-1">
            Revisión integral de {Array.isArray(tenantData) ? tenantData[0]?.name : tenantData?.name}
          </p>
        </div>
      </div>

      {/* 🔴 CAPA 1: IA PROACTIVA (Nuevo) */}
      <ProactiveDashboard tenantId={membership.tenant_id} />

      {/* 🔵 CAPA 2: MÉTRICAS DURAS */}
      <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Métricas Crudas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ECONOMIA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-20 h-20 text-emerald-600" />
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4"><DollarSign className="w-5 h-5 text-emerald-600"/></div>
          <h3 className="text-sm font-bold text-gray-500 tracking-wide uppercase">Ingreso Total Diciembre</h3>
          <p className="text-3xl font-black text-gray-900 mt-2">${kpis.income.totalIncome?.toLocaleString() || 0}</p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm text-gray-500">Ticket Promedio</span>
            <span className="text-sm font-bold text-emerald-600">${kpis.income.averageTicket?.toLocaleString() || 0}</span>
          </div>
        </div>

        {/* CLIENTES */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-20 h-20 text-blue-600" />
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4"><Users className="w-5 h-5 text-blue-600"/></div>
          <h3 className="text-sm font-bold text-gray-500 tracking-wide uppercase">Tasa de Retención</h3>
          <p className="text-3xl font-black text-gray-900 mt-2">{kpis.clients.retentionRate}%</p>
           <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nuevos vs Recurrentes</span>
              <span className="text-sm font-bold text-blue-600">{kpis.clients.newClients} / {kpis.clients.recurringClients}</span>
            </div>
          </div>
        </div>

        {/* SERVICIOS ESTRELLA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Scissors className="w-20 h-20 text-purple-600" />
          </div>
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4"><Scissors className="w-5 h-5 text-purple-600"/></div>
          <h3 className="text-sm font-bold text-gray-500 tracking-wide uppercase">Servicio Más Vendido</h3>
          <p className="text-2xl font-black text-gray-900 mt-2 truncate">{kpis.services.topService?.service_name || 'N/A'}</p>
           <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm text-gray-500">Sesiones (mes)</span>
            <span className="text-sm font-bold text-purple-600">{kpis.services.topService?.total_appointments || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
