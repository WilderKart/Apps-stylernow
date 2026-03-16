'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Appointment } from '@/types/agenda'

export function useAgendaRealtime(tenantId: string, from: string, to: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select(`*, service:services(name, category), staff:staff(first_name, last_name)`)
      .eq('tenant_id', tenantId)
      .gte('start_at', from)
      .lte('start_at', to)
      .order('start_at', { ascending: true })

    setAppointments((data ?? []) as Appointment[])
    setLoading(false)
  }, [tenantId, from, to])

  useEffect(() => {
    loadAppointments()

    // Realtime subscription
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    channelRef.current = supabase
      .channel(`agenda-${tenantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAppointments(prev => [...prev, payload.new as Appointment].sort((a, b) =>
              new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
            ))
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new as Appointment } : a))
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(a => a.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [tenantId, from, to, loadAppointments])

  return { appointments, loading, reload: loadAppointments }
}
