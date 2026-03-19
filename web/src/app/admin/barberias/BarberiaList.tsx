'use client';

import React, { useState, useTransition } from 'react';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import { approveTenantAction, rejectTenantAction } from '@/app/admin/admin-actions';

interface Tenant {
  id: string;
  name: string;
  plan?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  email: string | null;
}

export default function BarberiaList({ initialBarberias }: { initialBarberias: Tenant[] }) {
  const [list, setList] = useState(initialBarberias);
  const [isPending, startTransition] = useTransition();

  const handleApprove = async (id: string) => {
    if (!confirm('¿Estás seguro de APROBAR esta barbería? Se le notificará al dueño y podrá empezar a operar.')) return
    
    // Actuación optimista
    setList(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));

    startTransition(async () => {
      const { error } = await approveTenantAction(id);
      if (error) {
         alert(`Error: ${error}`);
         setList(prev => prev.map(b => b.id === id ? { ...b, status: 'pending' } : b));
      }
    });
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Proporciona el motivo del rechazo (se le enviará por correo al dueño):');
    if (!reason?.trim()) return;

    // Actuación optimista
    setList(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b));

    startTransition(async () => {
      const { error } = await rejectTenantAction(id, reason.trim());
      if (error) {
         alert(`Error: ${error}`);
         setList(prev => prev.map(b => b.id === id ? { ...b, status: 'pending' } : b));
      }
    });
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm min-w-[800px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">ID</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Barbería</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Plan</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Auditoría Estado</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Moderación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {list.map((b) => (
            <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-6 py-4">
                <span className="text-xs font-mono text-zinc-500">{b.id.slice(0, 8)}...</span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-[#101010]">{b.name}</p>
                <p className="text-xs text-zinc-400">{b.email || 'Sin correo'}</p>
                <p className="text-xs text-zinc-400 mt-1">Registrado: {new Date(b.created_at).toLocaleDateString()}</p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#101010] text-green-400 border border-green-500/30 uppercase tracking-wider">
                  {b.plan?.toUpperCase() || 'FREE'}
                </span>
              </td>
              <td className="px-6 py-4">
                {b.status === 'pending' && (
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded flex items-center gap-1.5 w-fit">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendiente
                  </span>
                )}
                {b.status === 'approved' && (
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1.5 w-fit">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Aprobada
                  </span>
                )}
                {b.status === 'rejected' && (
                  <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1.5 w-fit">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Rechazada
                  </span>
                )}
                {!b.status && (
                   <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded w-fit">Incompleto</span>
                )}
              </td>
              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                {b.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleApprove(b.id)}
                      disabled={isPending}
                      title="Aprobar Barbería"
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-transparent hover:border-green-200 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleReject(b.id)}
                      disabled={isPending}
                      title="Rechazar Barbería"
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-transparent hover:border-red-200 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg ml-2" title="Ver Detalles">
                  <Eye className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                 No hay franquicias registradas en el sistema.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
