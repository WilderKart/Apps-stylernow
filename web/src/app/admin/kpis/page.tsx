import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAdminFinancialKPIs, getAdminGrowthKPIs } from '../actions/admin-financial-kpis'
import { getAdminOperationsGlobalKPIs, getAdminSystemUsageKPIs, getAdminClientsGlobalKPIs } from '../actions/admin-operative-kpis'
import { getAdminMarketGlobalKPIs } from '../actions/admin-market-kpis'
import MetricCard from '@/components/admin/kpis/MetricCard'
import MarketDataPanel from '@/components/admin/kpis/MarketDataPanel'
import { DollarSign, ShieldAlert, BadgePercent, ArrowUpRight, TrendingUp, Users, Presentation, Settings2, Activity, CalendarDays, BarChart2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdminGlobalKPIDashboard() {
  return <AdminGlobalKPIDashboardContent />
}

async function AdminGlobalKPIDashboardContent() {
  const supabase = await createClient()

  // Middleware Security check at Layout level
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase.from('usuarios').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'founder') redirect('/dashboard')

  // Promesa Paralelizada de Alta Densidad
  const [finRes, groRes, opRes, sysRes, cliRes, mktRes] = await Promise.all([
    getAdminFinancialKPIs(),
    getAdminGrowthKPIs(),
    getAdminOperationsGlobalKPIs(),
    getAdminSystemUsageKPIs(),
    getAdminClientsGlobalKPIs(),
    getAdminMarketGlobalKPIs()
  ])

  // Desestructuración defensiva
  const finances = finRes.success ? finRes.data : null
  const growth = groRes.success ? groRes.data : null
  const operations = opRes.success ? opRes.data : null
  const system = sysRes.success ? sysRes.data : null
  const clients = cliRes.success ? cliRes.data : null
  const market = mktRes.success ? mktRes.data : null

  // Empty State master flag (si Active Tenants = 0)
  const isCompletelyEmpty = (system?.activeTenants || 0) === 0

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">
          <ShieldAlert className="w-4 h-4 text-green-500" /> Nivel 5: Zero Trust Analytics
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#101010]">
          SaaS War Room
        </h1>
        <p className="text-zinc-500 font-medium text-lg mt-2 max-w-2xl">
          Visión agregada y absoluta del rendimiento, facturación global y comportamiento del consumidor. Información estrictamente clasificada.
        </p>
      </div>

      {isCompletelyEmpty && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 mb-10 flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">Plataforma en Standby</h3>
            <p className="text-blue-700 max-w-md">No existen barberías aprobadas ni transacciones activas para generar métricas consolidadas. Acompaña a tus primeros clientes a terminar su Onboarding o aprueba sus solicitudes desde el panel de Tenants.</p>
        </div>
      )}

      {/* BLOQUE 1: FINANCIERO (MRR, SALUD, ARPU) */}
      <div className="mb-10">
        <h2 className="text-lg font-black uppercase tracking-widest text-zinc-800 flex items-center gap-2 mb-6">
          <DollarSign className="w-5 h-5" /> 1. Salud Financiera de StylerNow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Monthly Recurring Revenue (MRR)" 
            value={finances?.platformRevenue?.mrr || 0} 
            isCurrency 
            trend={isCompletelyEmpty ? undefined : "+100"} 
            trendLabel="Proyectado"
            isEmpty={isCompletelyEmpty || (finances?.platformRevenue?.mrr === 0)}
            emptyMessage="Esperando Primeros Suscriptores"
            icon={<TrendingUp className="w-16 h-16" />}
          />
          <MetricCard 
            title="ARPU Global" 
            value={finances?.platformRevenue?.arpu || 0} 
            isCurrency 
            subtitle="Ingreso Promedio x Barbería"
            isEmpty={isCompletelyEmpty || (finances?.platformRevenue?.arpu === 0)}
          />
          <MetricCard 
            title="Churn Rate (Cancelaciones)" 
            value={`${finances?.health?.churnRate?.toFixed(1) || 0}%`} 
            isEmpty={isCompletelyEmpty && finances?.health?.churnRate === 0}
            emptyMessage="Sin retiros registrados"
          />
          <MetricCard 
            title="Lifetime Value (LTV)" 
            value={finances?.health?.ltv || 0} 
            isCurrency
            subtitle="Est. 24 meses retención media"
            isEmpty={isCompletelyEmpty}
          />
        </div>
      </div>

      {/* BLOQUE 2: OPERATIVO Y CRECIMIENTO */}
      <div className="mb-10">
        <h2 className="text-lg font-black uppercase tracking-widest text-zinc-800 flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5" /> 2. Tracción y Embudo de Tenants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <MetricCard 
             title="Activación de Cuenta" 
             value={`${Math.round(growth?.activationRate || 0)}%`} 
             subtitle={`${growth?.funnel?.approved || 0} Aprobadas / ${growth?.funnel?.registered || 0} Reg`}
             isEmpty={growth?.funnel?.registered === 0}
             emptyMessage="No hay registros para medir embudo"
           />
           <MetricCard 
             title="Volumen Transaccional" 
             value={finances?.platformRevenue?.totalCirculatingVolume || 0} 
             isCurrency
             subtitle="Flujo procesado internamente"
             icon={<DollarSign className="w-12 h-12 text-zinc-300" />}
             isEmpty={isCompletelyEmpty || (finances?.platformRevenue?.totalCirculatingVolume === 0)}
             emptyMessage="Aún no hay reservas"
           />
           <MetricCard 
             title="Reservas Históricas Totales" 
             value={system?.totalReservations || 0} 
             isEmpty={system?.totalReservations === 0}
             emptyMessage="Sin flujo operativo"
           />
           <MetricCard 
             title="Ocupación Global Promedio" 
             value={`${operations?.operation?.occupancyProxy || 0}%`}
             subtitle="Calculado sobre agendas activas"
             isEmpty={isCompletelyEmpty || (operations?.operation?.totalAppointments === 0)}
             emptyMessage="Agendas sin volumen"
           />
        </div>
      </div>

      {/* BLOQUE 3: ECOSISTEMA CLIENTES (AGREGADO) */}
      <div className="mb-10">
        <h2 className="text-lg font-black uppercase tracking-widest text-zinc-800 flex items-center gap-2 mb-6">
          <Users className="w-5 h-5" /> 3. Base de Usuarios Finales (Ecosistema)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <MetricCard 
             title="Total Clientes Plataforma" 
             value={clients?.totalClients || 0} 
             isEmpty={isCompletelyEmpty || clients?.totalClients === 0}
             emptyMessage="No hay clientes agendados"
             icon={<Users className="w-16 h-16 text-zinc-200" />}
           />
           <MetricCard 
             title="Nuevos vs Recurrentes" 
             value={`${clients?.newVsRecurrent?.new || 0} / ${clients?.newVsRecurrent?.recurrent || 0}`} 
             subtitle="Flujo vitalicio del sistema"
             isEmpty={isCompletelyEmpty || clients?.totalClients === 0}
           />
           <MetricCard 
             title="Tasa Cancelación / No Show" 
             value={`${(operations?.operation?.cancellationRate || 0).toFixed(1)}% / ${(operations?.operation?.noShowRate || 0).toFixed(1)}%`}
             isEmpty={isCompletelyEmpty || operations?.operation?.totalAppointments === 0}
           />
        </div>
      </div>

      {/* BLOQUE 4: STAFF Y SERVICIOS */}
      <div className="mb-12">
        <h2 className="text-lg font-black uppercase tracking-widest text-zinc-800 flex items-center gap-2 mb-6">
          <Presentation className="w-5 h-5" /> 4. Productividad de Barberos y Servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <MetricCard 
             title="Staff (Barberos) Total" 
             value={operations?.staffData?.activeBarbersGlobal || 0} 
             isEmpty={isCompletelyEmpty || operations?.staffData?.activeBarbersGlobal === 0}
             emptyMessage="No hay staff procesando"
           />
           <MetricCard 
             title="Ticket Medio Global" 
             value={operations?.servicesData?.avgGlobalPrice || 0} 
             isCurrency
             isEmpty={isCompletelyEmpty || operations?.servicesData?.avgGlobalPrice === 0}
           />
           <MetricCard 
             title="Servicio Estrella (Global)" 
             value={operations?.servicesData?.topService?.name || '-'} 
             subtitle={`${operations?.servicesData?.topService?.count || 0} veces ejecutado`}
             isEmpty={isCompletelyEmpty || !operations?.servicesData?.topService}
             emptyMessage="Sin top registrado"
           />
           <MetricCard 
             title="Duración Media del Servicio" 
             value={`${Math.round(operations?.servicesData?.avgGlobalDurationMin || 0)} min`} 
             isEmpty={isCompletelyEmpty || operations?.servicesData?.avgGlobalDurationMin === 0}
             emptyMessage="Sin tiempos"
           />
        </div>
      </div>

      {/* BLOQUE 5: MONETIZACIÓN DAAS (ORO) */}
      <div className="mb-10">
        <MarketDataPanel 
          data={market} 
          isEmpty={isCompletelyEmpty || market?.empty || !market?.trends?.topServices?.length} 
        />
      </div>

    </div>
  )
}
