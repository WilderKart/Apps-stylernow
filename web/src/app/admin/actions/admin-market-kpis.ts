'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Carga el Service Role *sólo si* el usuario autenticado tiene explícitamente el rol de admin.
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

  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * 🔴 11 AL 18. KPIs DE MERCADO ANONIMIZADO (DATA AS A SERVICE / VENDIBLE)
 * Ningún dato personal es retornado en este payload.
 */
export async function getAdminMarketGlobalKPIs() {
    try {
      const adminSupabase = await getAdminSupabase()
  
      // Queremos todo tipo de datos anonimizados basandonos en Citas
      // NO traemos 'client_name', 'client_email', 'client_phone' a la respuesta jamás.
      const { data: appointments } = await adminSupabase
        .from('appointments')
        .select('start_at, price, status, service_id, services(name, price)')
  
      if (!appointments) return { success: true, data: { empty: true } }
  
      // 1. TENDENCIAS DE CONSUMO Y PRODUCTOS
      const serviceMap: Record<string, { count: number, name: string }> = {}
      const timeDist: Record<string, number> = {}       // Horarios más comunes
      const dayDist: Record<string, number> = {}        // Días de mayor demanda
      const monthDist: Record<string, number> = {}      // Estacionalidad
      
      let premiumCount = 0
      let ecoCount = 0
      const UMBRAL_PREMIUM = 30 // USD hardcoded demo proxy para determinar "Premium vs Eco"
  
      appointments.forEach((a: any) => {
        if (a.status !== 'completed' && a.status !== 'paid') return
  
        // 1.1 Servicios
        const sName = a.services?.name || 'Varios'
        if (!serviceMap[sName]) serviceMap[sName] = { count: 0, name: sName }
        serviceMap[sName].count++
  
        // 1.2 Estacionalidad y Comportamiento Horario
        if (a.start_at) {
            const d = new Date(a.start_at)
            const hour = d.getHours()
            const day = d.getDay()
            const month = d.getMonth()
            
            timeDist[hour] = (timeDist[hour] || 0) + 1
            dayDist[day] = (dayDist[day] || 0) + 1
            monthDist[month] = (monthDist[month] || 0) + 1
        }
  
        // 1.3 Sensibilidad al Precio
        const price = a.price || a.services?.price || 0
        if (price >= UMBRAL_PREMIUM) premiumCount++
        else ecoCount++
      })
  
      const trendingServices = Object.values(serviceMap).sort((a,b) => b.count - a.count).slice(0, 10)
      
      const totalPricingDemands = premiumCount + ecoCount
      const premiumRatio = totalPricingDemands > 0 ? (premiumCount / totalPricingDemands) * 100 : 0
      const ecoRatio = totalPricingDemands > 0 ? (ecoCount / totalPricingDemands) * 100 : 0
  
      return {
        success: true,
        data: {
          trends: {
            topServices: trendingServices, // "Oro Puro": Fade, Barba, Skincare
          },
          behavior: {
            popularHours: timeDist,
            popularDays: dayDist,
          },
          seasonality: {
            monthlyActivity: monthDist
          },
          pricingSensitivity: {
            premiumRatio,
            economyRatio: ecoRatio,
            thresholdUsed: UMBRAL_PREMIUM
          }
        }
      }
  
    } catch (error: any) {
      console.error("Zero Trust Exception - Admin Market Data:", error)
      return { success: false, error: error.message }
    }
  }
