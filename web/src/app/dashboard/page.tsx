import React from 'react';
import { TrendingUp, Users, Calendar, Banknote, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import TrialBanner from '@/components/TrialBanner';
import PremiumGate from '@/components/PremiumGate';
import PromoCarousel from '@/components/PromoCarousel';
import type { Tenant } from '@/types';

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/ingresar')

  // 🛡️ CAPA 1: Cargar Tenant mediante Memberships (Soporte multi-rol)
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  // Si no tiene membresía, enviar a onboarding
  if (!membership) redirect('/onboarding')

  // Cargar tenant desde la relación de membresía
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', membership.tenant_id)
    .single() as { data: Tenant | null }

  if (!tenantData) redirect('/onboarding')
  
  const tenant = tenantData as Tenant

  // Redirecciones inquebrantables por status
  if (tenant.status === ('pending' as any) || tenant.status === 'PENDING_REVIEW') redirect('/onboarding/status')
  if (tenant.status === ('rejected' as any) || tenant.status === 'REJECTED') redirect('/onboarding/rejected')

  // Check trial expiry for FREE plan
  const isOnTrial = tenant.plan === 'FREE'
  const trialEndsAt = new Date(tenant.trial_ends_at)
  const now = new Date()
  const isTrialExpired = isOnTrial && now > trialEndsAt
  if (isTrialExpired) redirect('/trial-expirado')

  const daysLeft = isOnTrial ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0

  // Fetch today's appointments count — wrapped in try/catch so it never blocks the page
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)

  let todayAppointments = 0
  try {
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .gte('start_at', todayStart.toISOString())
      .lte('start_at', todayEnd.toISOString())
    todayAppointments = count ?? 0
  } catch (_) { /* table may not have columns yet — non-blocking */ }

  // Tenant status badge
  const isPendingReview = tenant.status === ('pending' as any) || tenant.status === ('PENDING_REVIEW' as any)

  return (
    <div className="flex flex-col gap-6">
      {/* Pending Review Alert */}
      {isPendingReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-800">Cuenta en revisión</p>
            <p className="text-xs text-blue-600 mt-0.5">El equipo de StylerNow está revisando tu barbería. Recibirás un email de confirmación en menos de 24h.</p>
          </div>
        </div>
      )}

      {/* Trial Banner */}
      {isOnTrial && (
        <TrialBanner
          daysLeft={daysLeft}
          reservationsUsed={tenant.trial_reservations_count}
          clientsUsed={tenant.trial_clients_count}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de control · Plan <span className="font-semibold">{tenant.plan}</span></p>
        </div>
        <button className="mt-4 sm:mt-0 px-4 py-2 bg-[#1A1A1A] text-white text-sm font-medium rounded-lg hover:bg-black transition-all">
          Descargar Reporte
        </button>
      </div>

      {/* Promo Carousel for trial users */}
      {isOnTrial && <PromoCarousel />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-500">Citas Hoy</span>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900">{todayAppointments ?? 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-500">Reservas (Trial)</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-gray-900">{tenant.trial_reservations_count}<span className="text-sm text-gray-400">/30</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-500">Clientes Registrados</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900">{tenant.trial_clients_count}<span className="text-sm text-gray-400">/20</span></h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-500">Ingresos Hoy</span>
            <Banknote className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900">$0</h3>
        </div>
      </div>

      {/* Premium features locked in trial */}
      {isOnTrial && (
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Funciones Premium (requieren plan)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PremiumGate feature="stats_advanced">
              <div className="bg-white p-5 rounded-xl border h-24 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-zinc-200" />
              </div>
            </PremiumGate>
            <PremiumGate feature="commissions">
              <div className="bg-white p-5 rounded-xl border h-24 flex items-center justify-center">
                <Banknote className="w-8 h-8 text-zinc-200" />
              </div>
            </PremiumGate>
            <PremiumGate feature="promotions">
              <div className="bg-white p-5 rounded-xl border h-24 flex items-center justify-center">
                <span className="text-2xl opacity-30">🎉</span>
              </div>
            </PremiumGate>
          </div>
        </div>
      )}

      {/* AI Smart Suggestion */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
          <span className="text-lg">✨</span>
        </div>
        <div>
          <h4 className="text-lg font-bold text-[#1A1A1A]">Sugerencia Inteligente</h4>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Hemos notado que el próximo viernes es "Quincena". Crear un combo especial «Corte + Barba» podría incrementar tus ingresos un 20%.
          </p>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors shadow-sm">
              Revisar Propuesta
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Ignorar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

