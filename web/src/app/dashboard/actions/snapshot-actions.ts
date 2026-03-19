'use server'

import { createClient } from '@/utils/supabase/server'
import { aggregateAllMasterKPIs } from './kpi-actions'

/**
 * 1. ZERO TRUST: Ensure caller is Master of this tenant
 * 2. Caching Strategy: Daily Snapshots
 * 3. Fallback: If no previous dates, return empty deltas.
 */
export async function getOrGenerateDailySnapshot(tenantId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .eq('tenant_id', tenantId)
    .single()

  if (!membership || (membership.role !== 'master' && membership.role !== 'admin')) {
    return { error: 'Acceso denegado.' }
  }

  const today = new Date().toISOString().split('T')[0]

  // Check if today's snapshot exists
  const { data: existingSnapshot } = await supabase
    .from('tenant_kpi_snapshots')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('snapshot_date', today)
    .eq('period_type', 'daily')
    .single()

  if (existingSnapshot) {
    return { data: existingSnapshot }
  }

  // Calculate KPIs (heavy)
  const currentKPIs: any = await aggregateAllMasterKPIs(tenantId)

  // Insert Snapshot
  const { data: newSnapshot, error: insertError } = await supabase
    .from('tenant_kpi_snapshots')
    .insert({
      tenant_id: tenantId,
      snapshot_date: today,
      period_type: 'daily',
      income_data: currentKPIs.income,
      clients_data: currentKPIs.clients,
      occupancy_data: currentKPIs.occupancy,
      staff_data: currentKPIs.staff,
      services_data: currentKPIs.services,
      funnel_data: currentKPIs.funnel
    })
    .select()
    .single()

  if (insertError) {
    console.error("Error inserting snapshot:", insertError)
    return { error: 'Error guardando snapshot' }
  }

  return { data: newSnapshot }
}

/**
 * Recupera el Snapshot más próximo a hace 7 y 30 días para comparativas (Deltas).
 */
export async function getHistoricalSnapshots(tenantId: string) {
  const supabase = await createClient()

  // Buscar el de hace ~7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const date7 = sevenDaysAgo.toISOString().split('T')[0];

  const { data: lastWeek } = await supabase
    .from('tenant_kpi_snapshots')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('period_type', 'daily')
    .lte('snapshot_date', date7) // El último menor o igual a hace 7 dias
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const date30 = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: lastMonth } = await supabase
    .from('tenant_kpi_snapshots')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('period_type', 'daily')
    .lte('snapshot_date', date30)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { lastWeek, lastMonth }
}
