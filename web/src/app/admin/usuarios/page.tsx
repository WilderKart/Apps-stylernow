import React from 'react';
import { createClient } from '@/utils/supabase/server';
import UsuarioList from './UsuarioList';

export const dynamic = 'force-dynamic'

export default async function AdminUsuarios() {
  const supabase = await createClient()

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('*')
    .order('creado_en', { ascending: false })

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-8 text-[#1A1A1A]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Gestión de Usuarios / Clientes</h1>
          <p className="text-sm text-zinc-500 font-medium">
            Resetea contraseñas, gestiona roles y elimina cuentas bajo cumplimiento Zero Trust.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <UsuarioList initialUsuarios={usuarios || []} />
      </div>
    </div>
  );
}
