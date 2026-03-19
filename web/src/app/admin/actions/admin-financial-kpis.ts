'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Carga el Service Role *sólo si* el usuario autenticado tiene explícitamente el rol de admin.
 * ZERO TRUST: Asegura que ni RLS ni inyecciones de headers puedan saltar esto.
 */
async function getAdminSupabase() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')

  const { data: profile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'founder') {
    throw new Error('Acesso Denegado (Zero Trust). Rol insuficiente.')
  }

  // Si llegamos aquí, el usuario está legítimamente autenticado como Admin global.
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * 🔴 1. KPIs DE NEGOCIO (SAAS / FINANCIEROS)
 * Incluye MRR, ARR, Ingresos, Planes, ARPU, Salud LTV.
 */
export async function getAdminFinancialKPIs() {
  try {
    const adminSupabase = await getAdminSupabase()

    // 1. Obtener todas las barberias/tenants
    const { data: tenants, error: tenantsError } = await adminSupabase
      .from('tenants')
      .select('id, plan, status, created_at')

    if (tenantsError) throw tenantsError

    // 2. Obtener historial de pagos (appointments pagados en todo el sistema)
    // Se extrae service_id para estimar precio
    const { data: appointments, error: appsError } = await adminSupabase
      .from('appointments')
      .select('price, status, services(price)')
      .in('status', ['paid', 'completed'])

    if (appsError) throw appsError

    // --- CÁLCULO DE INGRESOS PLATAFORMA ---
    // En este caso asumimos que MRR es la suma de los planes activos de las barberías.
    // Ej: PRO = 49 USD, ELITE = 99 USD
    let mrr = 0
    let planBreakdown = { free: 0, pro: 0, elite: 0 }
    
    tenants?.forEach(t => {
      if (t.status === 'approved') {
        if (t.plan?.toLowerCase() === 'pro') { mrr += 49; planBreakdown.pro++ }
        else if (t.plan?.toLowerCase() === 'elite') { mrr += 99; planBreakdown.elite++ }
        else { planBreakdown.free++ }
      }
    })

    const arr = mrr * 12

    // Ingresos agregados (Flujo de las barberías en sí, no de SaaS. El SaaS cobra el plan)
    const totalCirculatingVolume = (appointments || []).reduce((acc: number, curr: any) => acc + (curr.price || curr.services?.price || 0), 0)
    
    // ARPU: Average Revenue Per User (Barbería) mensual para la SaaS
    const approvedTenantsCount = tenants?.filter(t => t.status === 'approved').length || 0
    const arpu = approvedTenantsCount > 0 ? (mrr / approvedTenantsCount) : 0

    // Salud LTV (Asumimos vida promedio de 24 meses para el demo)
    const ltv = arpu * 24 // Lifetime value promedio
    const churnedCount = tenants?.filter(t => t.status === 'suspended' || t.status === 'rejected').length || 0
    const churnRate = tenants?.length ? (churnedCount / tenants.length) * 100 : 0

    return {
      success: true,
      data: {
        platformRevenue: {
           mrr,
           arr,
           arpu,
           totalCirculatingVolume, // Cuánto dinero mueven los clientes en la app globalmente
           planBreakdown
        },
        health: {
           ltv,
           churnRate,
           cac: 0,           // Costo adquisición a futura integración Ads API
           ltvCacRatio: 0
        }
      }
    }

  } catch (error: any) {
    console.error("Zero Trust Exception - Admin Financials:", error)
    return { success: false, error: error.message }
  }
}

/**
 * 🔴 2. KPIs DE CRECIMIENTO SAAS (EMBUDOS)
 */
export async function getAdminGrowthKPIs() {
    try {
      const adminSupabase = await getAdminSupabase()
  
      const { data: tenants } = await adminSupabase
        .from('tenants')
        .select('id, status, created_at')
  
      // Ventanas de tiempo
      const now = new Date()
      const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
      const startOfMonth = new Date(now); startOfMonth.setMonth(now.getMonth() - 1);
  
      let newDaily = 0, newWeekly = 0, newMonthly = 0
      
      let funnel = {
        registered: tenants?.length || 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
  
      tenants?.forEach(t => {
        const d = new Date(t.created_at)
        
        // Crecimiento temporal
        if (d.toDateString() === now.toDateString()) newDaily++
        if (d >= startOfWeek) newWeekly++
        if (d >= startOfMonth) newMonthly++
  
        // Funnel
        if (t.status === 'pending') funnel.pending++
        if (t.status === 'approved') funnel.approved++
        if (t.status === 'rejected') funnel.rejected++
      })
  
      // Activation Rate (Aprobados vs Registrados)
      const activationRate = funnel.registered > 0 ? (funnel.approved / funnel.registered) * 100 : 0
  
      return {
        success: true,
        data: {
          growth: { newDaily, newWeekly, newMonthly },
          funnel,
          activationRate,
          avgOnboardingTimeHr: 24, // Dato estático de demostración real hasta implementar trackers exactos en `ai_insight_logs`
        }
      }
  
    } catch (error: any) {
      console.error("Zero Trust Exception - Admin Growth:", error)
      return { success: false, error: error.message }
    }
  }
