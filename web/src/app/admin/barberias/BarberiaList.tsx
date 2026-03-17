'use client';

import React, { useState, useTransition } from 'react';
import { ToggleLeft, ToggleRight, Eye, RefreshCw } from 'lucide-react';
import { toggleBarberiaStatusAction } from '@/app/admin/admin-actions';

interface Barberia {
  id: string;
  nombre: string;
  plan?: string;
  activa: boolean;
  creado_en: string;
}

export default function BarberiaList({ initialBarberias }: { initialBarberias: Barberia[] }) {
  const [list, setList] = useState(initialBarberias);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Actuación optimista
    setList(prev => prev.map(b => b.id === id ? { ...b, activa: !currentStatus } : b));

    startTransition(async () => {
      const { error } = await toggleBarberiaStatusAction(id, !currentStatus);
      if (error) {
         // Revertir si hay error
         alert(`Error: ${error}`);
         setList(prev => prev.map(b => b.id === id ? { ...b, activa: currentStatus } : b));
      }
    });
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm min-w-[800px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">ID</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Nombre</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Plan Actual</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {list.map((b) => (
            <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-6 py-4">
                <span className="text-xs font-mono text-zinc-500">...{b.id.slice(-6)}</span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-[#101010]">{b.nombre}</p>
                <p className="text-xs text-zinc-400">Creado: {new Date(b.creado_en).toLocaleDateString()}</p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#101010] text-green-400 border border-green-500/30 uppercase tracking-wider">
                  {b.plan?.toUpperCase() || 'FREE'}
                </span>
              </td>
              <td className="px-6 py-4">
                {b.activa ? (
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Activo
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Suspendida
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                <button 
                  onClick={() => handleToggle(b.id, b.activa)}
                  disabled={isPending}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-sm font-bold ${
                    b.activa 
                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                      : 'bg-[#101010] text-green-400 border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  {b.activa ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {b.activa ? 'Suspender' : 'Activar'}
                </button>
                <button className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                 No hay barberías registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
