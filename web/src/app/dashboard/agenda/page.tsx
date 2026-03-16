import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AgendaClient from './AgendaClient'
import type { ColombiaHoliday } from '@/types/agenda'

export const dynamic = 'force-dynamic'

export default async function AgendaDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/ingresar')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/onboarding')

  const year = new Date().getFullYear()
  let holidays: { date: string; name: string }[] = []
  try {
    const { data } = await supabase
      .from('colombia_holidays')
      .select('date, name')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year + 1}-12-31`)
      .order('date')
    holidays = (data ?? []) as { date: string; name: string }[]
  } catch (_) { /* table may not exist yet — non-blocking */ }


  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto px-2 sm:px-0 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A]">Agenda</h1>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Vistas Día · Semana · Mes con festivos de Colombia 🇨🇴 — Actualización en tiempo real
        </p>
      </div>
      <div className="flex-1">
        <AgendaClient
          tenantId={tenant.id}
          holidays={(holidays ?? []) as ColombiaHoliday[]}
        />
      </div>
    </div>
  )
}
