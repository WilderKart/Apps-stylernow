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
 * 🔴 3. KPIs OPERATIVOS (USO DEL SISTEMA)
 * Barberías Activas vs Inactivas, Usuarios (Master) Activos, Reservas totales.
 */
export async function getAdminSystemUsageKPIs() {
  try {
    const adminSupabase = await getAdminSupabase()

    const { data: tenants } = await adminSupabase.from('tenants').select('status')
    const activeTenants = tenants?.filter(t => t.status === 'approved').length || 0
    const inactiveTenants = tenants?.filter(t => t.status !== 'approved').length || 0

    // DAU / MAU de usuarios master (estimación basada en appointments creados reciementemente)
    // En un caso real fintech haríamos un log de acceso session.
    // Usaremos last_sign_in_at real si exisitera en Auth, no podemos acceder Auth Users directo sin admin SDK extenso.
    // Optamos por medir la "Vitalidad" mediante las citas creadas en la app:
    const now = new Date()
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const lastMonth = new Date(now); lastMonth.setMonth(now.getMonth() - 1);

    const { count: dailyEvents } = await adminSupabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())

    const { count: totalReservations } = await adminSupabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })

    return {
      success: true,
      data: {
        activeTenants,
        inactiveTenants,
        dauProxyEvents: dailyEvents || 0, // Citas creadas en últimas 24 hrs
        maurProxyEvents: 0, // Placeholder
        totalReservations: totalReservations || 0
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 🔴 6, 7 y 8. KPIs DE OPERACIÓN, SERVICIOS Y BARBEROS GLOBALES
 */
export async function getAdminOperationsGlobalKPIs() {
  try {
    const adminSupabase = await getAdminSupabase()

    const { data: appointments } = await adminSupabase
      .from('appointments')
      .select('status, service_id, barber_id, price, start_at, services(name, price, duration)')

    if (!appointments) return { success: true, data: { empty: true } }

    // 1. Ocupación y Estructura Status
    let noShows = 0, cancelled = 0, completed = 0, pending = 0
    appointments.forEach((a: any) => {
      if (a.status === 'no_show') noShows++
      else if (a.status === 'cancelled') cancelled++
      else if (a.status === 'completed' || a.status === 'paid') completed++
      else pending++
    })

    const total = appointments.length
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0
    const noShowRate = total > 0 ? (noShows / total) * 100 : 0
    const rawOccupancyRate = 58 // Hardcoded as a global average default proxy

    // 2. Servicios
    const serviceMap: Record<string, { income: number, count: number, name: string, durations: number[] }> = {}
    appointments.forEach((a: any) => {
      if (a.status !== 'completed' && a.status !== 'paid') return
      
      let sId = a.service_id || 'unassigned'
      if (!serviceMap[sId]) {
        serviceMap[sId] = { income: 0, count: 0, name: a.services?.name || 'Varios', durations: [] }
      }
      serviceMap[sId].income += (a.price || a.services?.price || 0)
      serviceMap[sId].count++
      if (a.services?.duration) serviceMap[sId].durations.push(a.services.duration)
    })

    const servicesArray = Object.values(serviceMap).sort((a,b) => b.count - a.count)
    const topService = servicesArray[0] || null
    const bottomService = servicesArray[servicesArray.length - 1] || null

    let gAvgPrice = 0, gAvgDuration = 0, tPrice = 0, tDur = 0, tSrvCount = 0
    servicesArray.forEach(s => {
      tPrice += s.income; 
      tSrvCount += s.count;
      tDur += s.durations.reduce((a,b)=>a+b,0)
    })
    gAvgPrice = tSrvCount > 0 ? tPrice / tSrvCount : 0
    gAvgDuration = servicesArray.reduce((acc,s)=>acc+s.durations.length,0) > 0 ? tDur / servicesArray.reduce((acc,s)=>acc+s.durations.length,0) : 0

    // 3. Barberos (Agregados)
    const barberMap: Record<string, { count: number, income: number }> = {}
    appointments.forEach((a: any) => {
      if (a.status !== 'completed' && a.status !== 'paid') return
      const bId = a.barber_id || 'unassigned'
      if (!barberMap[bId]) barberMap[bId] = { count: 0, income: 0 }
      barberMap[bId].count++
      barberMap[bId].income += (a.price || a.services?.price || 0)
    })

    const barberArray = Object.values(barberMap)
    const activeBarbers = barberArray.length
    const avgServicesPerBarber = activeBarbers > 0 ? barberArray.reduce((acc,b)=>acc+b.count,0) / activeBarbers : 0
    const avgIncomePerBarber = activeBarbers > 0 ? barberArray.reduce((acc,b)=>acc+b.income,0) / activeBarbers : 0

    return {
      success: true,
      data: {
        operation: {
          occupancyProxy: rawOccupancyRate,
          cancellationRate,
          noShowRate,
          totalAppointments: total
        },
        servicesData: {
          topService,
          bottomService,
          avgGlobalPrice: gAvgPrice,
          avgGlobalDurationMin: gAvgDuration
        },
        staffData: {
          activeBarbersGlobal: activeBarbers,
          avgServicesPerBarber,
          avgIncomePerBarber
        }
      }
    }

  } catch (error: any) {
    console.error("Zero Trust Exception - Admin Operations:", error)
    return { success: false, error: error.message }
  }
}

/**
 * 🔴 5. SECRETO CLAVE: CLIENTES GLOBAL (AGREGADOS)
 */
export async function getAdminClientsGlobalKPIs() {
    try {
      const adminSupabase = await getAdminSupabase()
  
      const { data: appointments } = await adminSupabase
        .from('appointments')
        .select('client_name, client_email, client_phone')
  
      if (!appointments) return { success: true, data: { totalClients: 0, newVsRecurrent: { new:0, recurrent:0 }, retention: 0 } }
  
      const clientMap: Record<string, number> = {}
      
      appointments.forEach((a: any) => {
        const key = a.client_email || a.client_phone || a.client_name || 'unknown_walkin'
        clientMap[key] = (clientMap[key] || 0) + 1
      })
  
      const totalUnique = Object.keys(clientMap).length
      const recurrent = Object.values(clientMap).filter(v => v > 1).length
      const newClients = totalUnique - recurrent
      const retentionGlobal = totalUnique > 0 ? (recurrent / totalUnique) * 100 : 0
  
      return {
        success: true,
        data: {
          totalClients: totalUnique,
          newVsRecurrent: { new: newClients, recurrent: recurrent },
          retention: retentionGlobal,
          avgVisitsGlobal: totalUnique > 0 ? appointments.length / totalUnique : 0
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
