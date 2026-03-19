'use server'

import { createClient } from '@/utils/supabase/server'

// 1. Fetcher Global del Modal B2B (Data Analytics + Onboarding)
export async function getTenantModalDetails(tenantId: string) {
  const supabase = await createClient()

  const { data: userAuth } = await supabase.auth.getUser()
  if (!userAuth.user) return { error: 'No autorizado' }

  // Aquí verificamos que sea admin
  const { data: profile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('auth_id', userAuth.user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'founder') {
     return { error: 'Rechazado: Acceso exclusivo para administradores.' }
  }

  // 1. Barbería Core Data
  const { data: tenant } = await supabase
    .from('barberias')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (!tenant) return { error: 'No se encontró la barbería' }

  const today = new Date()
  const createdDate = new Date(tenant.creado_en)
  const daysActive = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))
  
  // 2. Transacciones Financieras y Citas Totales
  const { data: bookings } = await supabase
    .from('reservas')
    .select('precio_total, fecha, estado, cliente_id, service_id, barbero_id')
    .eq('tenant_id', tenantId)
    .neq('estado', 'cancelada')

  const totalBookings = bookings || []
  const currentTotalIncome = totalBookings.reduce((acc, curr) => acc + (curr.precio_total || 0), 0)
  
  const last30 = new Date(today)
  last30.setDate(last30.getDate() - 30)
  const last7 = new Date(today)
  last7.setDate(last7.getDate() - 7)

  const monthBookings = totalBookings.filter(b => new Date(b.fecha) >= last30)
  const weekBookings = totalBookings.filter(b => new Date(b.fecha) >= last7)
  const monthIncome = monthBookings.reduce((acc, curr) => acc + (curr.precio_total || 0), 0)
  const weekIncome = weekBookings.reduce((acc, curr) => acc + (curr.precio_total || 0), 0)
  
  const avgTicket = totalBookings.length > 0 ? (currentTotalIncome / totalBookings.length) : 0

  // 3. Sistema de Recomendación del Admin (Lógica Interna)
  let recommendedStatus = {
    label: 'Apto para Aprobar',
    color: 'emerald',
    code: 'GREEN'
  }

  // Reglas predeterminadas de evaluación B2B
  if (tenant.activa === false) {
     if (daysActive > 10 && currentTotalIncome === 0) {
        recommendedStatus = { label: 'Riesgo Alto: Abandono', color: 'red', code: 'RED' }
     } else if (daysActive <= 3) {
        recommendedStatus = { label: 'Revisar Manualmente (Reciente)', color: 'yellow', code: 'YELLOW' }
     }
  } else {
     recommendedStatus = { label: 'Operación Normal', color: 'blue', code: 'BLUE' }
  }

  // Chart Data Generation (Últimos 7 días)
  const chartData = []
  for (let i = 6; i >= 0; i--) {
     const d = new Date()
     d.setDate(d.getDate() - i)
     const dateStr = d.toISOString().split('T')[0]
     const dBooks = totalBookings.filter(b => b.fecha.startsWith(dateStr))
     const dIncome = dBooks.reduce((acc, curr) => acc + (curr.precio_total || 0), 0)
     chartData.push({
       date: dateStr,
       Ingresos: dIncome,
       Citas: dBooks.length
     })
  }

  return {
    tenant: {
       ...tenant,
       daysActive,
       recommendedStatus
    },
    metrics: {
      income: {
         total: currentTotalIncome,
         month: monthIncome,
         week: weekIncome,
         avgTicket
      },
      clients: {
         total: new Set(totalBookings.map(b => b.cliente_id)).size,
         recurrents: 0 // Mock de cálculo complejo
      },
      operation: {
         totalBookings: totalBookings.length,
         peakHour: '18:00', // Mock B2B
         deadHour: '10:00'
      }
    },
    chartData
  }
}

// 2. Action para Aprobar / Rechazar (Lanzando Log de Auditoría)
export async function finalizeTenantOnboarding(tenantId: string, action: 'approve' | 'reject', reason?: string) {
  const supabase = await createClient()

  // Seguridad
  const { data: userAuth } = await supabase.auth.getUser()
  if (!userAuth.user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('auth_id', userAuth.user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'founder') {
     return { error: 'Intrusión bloqueada' }
  }

  const activate = action === 'approve'

  // Mutación
  const { error: updErr } = await supabase.from('barberias')
     .update({ activa: activate })
     .eq('id', tenantId)

  if (updErr) return { error: 'Fallo al actualizar el Tenant.' }

  // LOGGER DE AUDITORÍA OBLIGATORIO (FINTECH ZERO TRUST)
  await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    action_type: activate ? 'TENANT_APPROVED' : 'TENANT_REJECTED',
    performed_by: userAuth.user.id,
    details: { reason, timestamp: new Date().toISOString() }
  })

  return { success: true }
}
