import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ShieldAlert, AlertCircle, HelpCircle } from 'lucide-react';

export default async function RejectedPage() {
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
  if (tenant.status === 'pending' || tenant.status === 'PENDING_REVIEW') redirect('/onboarding/status')

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-red-200 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-black text-black mb-2">Solicitud Denegada</h1>
        <p className="text-zinc-600 mb-6 text-sm">
          Lo sentimos, la revisión administrativa (Zero Trust) de la cuenta de <strong className="text-black">{tenant.name}</strong> no fue aprobada por incumplimiento de nuestras políticas o inconsistencia en la información.
        </p>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">Motivos más comunes</p>
              <ul className="text-xs text-red-700 list-disc list-inside mt-1">
                <li>Información de contacto no válida</li>
                <li>Sospecha de actividad fraudulenta</li>
                <li>Identidad no verificable</li>
              </ul>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
            <HelpCircle className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-black">¿Un error?</p>
              <p className="text-xs text-zinc-500">Si crees que esto fue un error, envía un correo a soporte@stylernow.com.</p>
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
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
