'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Logo from '@/components/Logo';
import { Clock } from 'lucide-react';

export default function OnboardingStatusPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Definir título para SEO dinámico en Cliente (Alternativa a Metadata en 'use client')
    document.title = "Activación de barbería en proceso | StylerNow";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Estamos validando tu información para activar tu cuenta lo antes posible.");
    }

    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         router.push('/auth/login');
         return;
      }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, status')
        .eq('owner_id', user.id)
        .single();

      if (!tenant) {
        router.push('/onboarding');
      } else if (tenant.status === 'approved') {
        router.push('/dashboard');
      } else {
        setLoading(false); // Mantener en esta página si sigue pending
      }
    };

    checkStatus();

    // Polling cada 10 segundos
    const interval = setInterval(async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('status')
            .eq('owner_id', user.id)
            .single();

          if (tenant?.status === 'approved') {
             router.push('/dashboard');
          }
       }
    }, 10000);

    return () => clearInterval(interval);
  }, [supabase, router]);

  if (loading) {
     return (
       <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-zinc-100 flex flex-col items-center">
         <Logo markOnly={true} className="w-16 h-16 mb-6" />
         
         <div className="bg-amber-50 p-4 rounded-full mb-4">
            <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
         </div>

         <h1 className="text-2xl font-black text-[#1A1A1A] mb-2">Tu barbería está en proceso de revisión</h1>
         <p className="text-zinc-500 text-sm font-medium mb-6">
            Estamos validando tu información para activar tu cuenta lo antes posible.
         </p>

         <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-amber-500 h-full w-2/3 rounded-full animate-infinite-loading"></div>
         </div>
         <span className="text-xs font-bold text-zinc-400">Verificando documentación...</span>

         {/* Botón de Verificación Manual (V10.5.7) */}
         <button type="button" onClick={async () => {
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                const { data: tenant } = await supabase
                  .from('tenants')
                  .select('status')
                  .eq('owner_id', user.id)
                  .single();

                if (tenant?.status === 'approved') {
                   router.push('/dashboard');
                }
             }
         }}
            className="mt-6 px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all">
            Verificar estado ahora
         </button>

         <button type="button" onClick={() => router.push('/auth/login')}
            className="mt-4 text-xs font-bold text-zinc-400 hover:text-black transition-colors">
            Cerrar Sesión o Volver
         </button>

      </div>
    </div>
  );
}
