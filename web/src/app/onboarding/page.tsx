import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'
import type { ServiceCatalog } from '@/types'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/ingresar')

  // Check if already has a tenant (skip onboarding)
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id, status')
    .eq('owner_id', user.id)
    .single()

  if (existingTenant) {
     const status = existingTenant.status || 'pending_review';
     if (status === 'approved') {
        redirect('/dashboard');
     } else {
        redirect('/onboarding/status');
     }
  }



  // Fetch service catalog
  const { data: catalog } = await supabase
    .from('service_catalog')
    .select('*')
    .order('category')
    .order('name')

  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex flex-col items-center justify-start pt-10 pb-20 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-4 py-2 mb-4 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-zinc-600">Prueba gratuita — 7 días sin tarjeta</span>
        </div>
        <h1 className="text-3xl font-extrabold text-black tracking-tight">Configura tu barbería</h1>
        <p className="text-zinc-500 text-sm mt-2">Solo toma 3 minutos y quedas listo para recibir clientes.</p>
      </div>

      <OnboardingClient serviceCatalog={(catalog || []) as ServiceCatalog[]} />
    </div>
  )
}
