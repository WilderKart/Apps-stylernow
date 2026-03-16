'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AppointmentStatus } from '@/types/agenda'

// ─── Fetch appointments for a date range ────────────────────────
export async function fetchAppointmentsAction(tenantId: string, from: string, to: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(name, category),
      staff:staff(first_name, last_name)
    `)
    .eq('tenant_id', tenantId)
    .gte('start_at', from)
    .lte('start_at', to)
    .order('start_at', { ascending: true })

  if (error) return { appointments: [], error: error.message }
  return { appointments: data ?? [] }
}

// ─── Create appointment (booking) ────────────────────────────────
export async function createAppointmentAction(payload: {
  tenant_id: string
  staff_id?: string
  service_id?: string
  client_name: string
  client_phone?: string
  start_at: string
  duration_minutes: number
  price?: number
  notes?: string
  source?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Compute end_at
  const start = new Date(payload.start_at)
  const end = new Date(start.getTime() + payload.duration_minutes * 60_000)

  const { data, error } = await supabase.from('appointments').insert({
    ...payload,
    client_id: user?.id ?? null,
    end_at: end.toISOString(),
    status: 'pending',
  }).select().single()

  if (error) return { error: error.message }

  // Notify tenant (insert into notifications table)
  try {
    await supabase.from('notifications').insert({
      tenant_id: payload.tenant_id,
      type: 'new_appointment',
      title: 'Nueva reserva',
      body: `${payload.client_name} reservó para ${new Date(payload.start_at).toLocaleString('es-CO')}`,
      data: { appointment_id: data.id },
      read: false,
    })
  } catch (_) { /* non-blocking */ }


  revalidatePath('/dashboard/agenda')
  return { appointment: data }
}

// ─── Update appointment status ────────────────────────────────────
export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus,
  reason?: string
) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const updates: Record<string, unknown> = { status }
  if (status === 'confirmed') updates.confirmed_at = now
  if (status === 'completed') updates.completed_at = now
  if (status === 'cancelled' && reason) updates.cancelled_reason = reason

  const { error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/agenda')
  return { success: true }
}

// ─── Reschedule (update start_at / end_at) ────────────────────────
export async function rescheduleAppointmentAction(
  appointmentId: string,
  newStartAt: string,
  durationMinutes: number
) {
  const supabase = await createClient()
  const end = new Date(new Date(newStartAt).getTime() + durationMinutes * 60_000)

  const { error } = await supabase.from('appointments').update({
    start_at: newStartAt,
    end_at: end.toISOString(),
  }).eq('id', appointmentId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/agenda')
  return { success: true }
}

// ─── Fetch schedules ──────────────────────────────────────────────
export async function fetchSchedulesAction(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('day_of_week')

  if (error) return { schedules: [] }
  return { schedules: data ?? [] }
}

// ─── Upsert schedule ─────────────────────────────────────────────
export async function upsertScheduleAction(tenantId: string, records: Array<{
  day_of_week: number; open_time: string; close_time: string; is_open: boolean; staff_id?: string
}>) {
  const supabase = await createClient()
  const { error } = await supabase.from('schedules').upsert(
    records.map(r => ({ ...r, tenant_id: tenantId })),
    { onConflict: 'tenant_id,staff_id,day_of_week' }
  )
  if (error) return { error: error.message }
  revalidatePath('/dashboard/configuracion')
  return { success: true }
}

// ─── Fetch Colombia holidays ──────────────────────────────────────
export async function fetchHolidaysAction(year: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('colombia_holidays')
    .select('date, name')
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date')

  return { holidays: (data ?? []) as { date: string; name: string }[] }
}

// ─── Walk-in / admin create (no client auth needed) ───────────────
export async function createWalkInAction(payload: {
  tenant_id: string
  staff_id?: string
  service_id?: string
  client_name: string
  client_phone?: string
  start_at: string
  duration_minutes: number
  price?: number
  notes?: string
}) {
  return createAppointmentAction({ ...payload, source: 'walk_in' })
}
