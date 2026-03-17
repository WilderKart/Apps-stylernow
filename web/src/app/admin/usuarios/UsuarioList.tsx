'use client';

import React, { useState, useTransition } from 'react';
import { KeyRound, Trash2, ShieldCheck, User } from 'lucide-react';
import { resetUserPasswordAction, deleteUserAction } from '@/app/admin/admin-actions';

interface Usuario {
  id: string;
  auth_id: string;
  nombre: string;
  email: string;
  role: string;
  creado_en: string;
}

export default function UsuarioList({ initialUsuarios }: { initialUsuarios: Usuario[] }) {
  const [list, setList] = useState(initialUsuarios);
  const [isPending, startTransition] = useTransition();

  const handleResetPassword = async (authId: string) => {
    if (!authId) return alert("El usuario no tiene un ID de Autenticación vinculado.");
    
    if (confirm("¿Estás seguro de que deseas reiniciar la contraseña? Se generará una temporal.")) {
      startTransition(async () => {
        const { success, tempPassword, error } = await resetUserPasswordAction(authId);
        if (error) {
           alert(`Error: ${error}`);
        } else {
           alert(`✅ Contraseña restablecida con éxito.\nNueva clave: ${tempPassword}\nCopia esta clave para el usuario.`);
        }
      });
    }
  };

  const handleDelete = async (authId: string) => {
    if (!authId) return alert("El usuario no tiene un ID de Autenticación.");

    if (confirm("⚠️ ¿ESTÁS SEGURO? Esta acción es IRREVERSIBLE y eliminará al usuario tanto de la base de datos como de Supabase Auth.")) {
      startTransition(async () => {
        const { success, error } = await deleteUserAction(authId);
        if (error) {
           alert(`Error: ${error}`);
        } else {
           alert("✅ Usuario eliminado con éxito.");
           setList(prev => prev.filter(u => u.auth_id !== authId));
        }
      });
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm min-w-[800px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Nombre / Email</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Rol</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Creado</th>
            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {list.map((u) => (
            <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-[#101010]">{u.nombre}</p>
                <p className="text-xs text-zinc-400">{u.email}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                  u.role === 'admin' 
                    ? 'bg-red-50 text-red-600 border-red-200' 
                    : u.role === 'master' 
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}>
                  {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {u.role?.toUpperCase() || 'CLIENTE'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs text-zinc-500">{new Date(u.creado_en).toLocaleDateString()}</span>
              </td>
              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                <button 
                  onClick={() => handleResetPassword(u.auth_id)}
                  disabled={isPending}
                  className="p-2 rounded-xl bg-[#101010] text-green-400 border border-zinc-800 hover:bg-zinc-900 transition-all flex items-center gap-1 text-xs font-bold"
                  title="Reiniciar Contraseña"
                >
                  <KeyRound className="w-4 h-4" /> Reset
                </button>
                {u.role !== 'admin' && (
                  <button 
                    onClick={() => handleDelete(u.auth_id)}
                    disabled={isPending}
                    className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1 text-xs font-bold"
                    title="Eliminar Cuenta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">
                 No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
