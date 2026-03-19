import React from 'react';
import { createClient } from '@/utils/supabase/server';
import BarberiaList from './BarberiaList';

export const dynamic = 'force-dynamic'

export default async function AdminBarberias() {
  const supabase = await createClient()

  const { data: barberias } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-8 text-[#1A1A1A]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Gestión de Barberías</h1>
          <p className="text-sm text-zinc-500 font-medium">
            Suspende, activa y monitorea el estado de cada tenant en el ecosistema.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <BarberiaList initialBarberias={barberias || []} />
      </div>
    </div>
  );
}
