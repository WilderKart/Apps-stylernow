import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Clock, ShieldCheck, Mail } from 'lucide-react';

export default async function StatusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/ingresar')

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) redirect('/onboarding')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, status')
    .eq('id', membership.tenant_id)
    .single()

  if (!tenant) redirect('/onboarding')

  // Redirecciones inquebrantables si el status ya cambió
  if (tenant.status === 'approved' || tenant.status === 'APPROVED') redirect('/dashboard')
  if (tenant.status === 'rejected' || tenant.status === 'REJECTED') redirect('/onboarding/rejected')

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-black text-black mb-2">Cuenta bajo revisión</h1>
        <p className="text-zinc-500 mb-6 text-sm">
          Felicidades, la barbería <strong className="text-black">{tenant.name}</strong> ha completado su registro inicial. 
          Nuestro equipo administrativo está validando la información por motivos de seguridad (Zero Trust).
        </p>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
            <ShieldCheck className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-black">Verificación Legal y T&C</p>
              <p className="text-xs text-zinc-500">Estamos validando tu aceptación de términos y la identidad registrada.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
            <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-black">Notificación Inminente</p>
              <p className="text-xs text-zinc-500">Recibirás un correo electrónico una vez que tu cuenta sea aprobada o rechazada (Máx 24h).</p>
            </div>
          </div>
        </div>

        <button 
          onClick={async () => {
            'use server';
            const { createClient } = await import('@/utils/supabase/server');
            const supabase = await createClient()
            await supabase.auth.signOut();
            redirect('/ingresar')
          }}
          className="mt-8 w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all"
        >
          Cerrar Sesión por ahora
        </button>
      </div>
    </div>
  );
}
