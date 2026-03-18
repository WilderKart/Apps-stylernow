'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor llena todos los campos.');
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message === 'Invalid login credentials' ? 'Credenciales incorrectas.' : authError.message);
        return;
      }

      if (authData?.user) {
        // Zero Trust: Validar rol 'admin' de inmediato
        const { data: userData } = await supabase
          .from('usuarios')
          .select('role')
          .eq('auth_id', authData.user.id)
          .single();

        if (userData?.role !== 'admin') {
          setError('Acceso denegado. No tienes permisos de administrador.');
          await supabase.auth.signOut(); // Desloguear si no es admin
          return;
        }

        router.push('/admin');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#09090A] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute bottom-1/2 right-1/2 w-96 h-96 bg-[#D0FF14] rounded-full filter blur-3xl animate-pulse"></div>
      </div>

      <div className="w-full max-w-md bg-[#141415] border border-zinc-900 p-8 rounded-2xl shadow-2xl z-10">
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo markOnly={true} className="w-12 h-12 mb-3" />
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-[#D0FF14]" />
            <h1 className="text-xl font-black text-white uppercase tracking-wider">Acceso Administrativo</h1>
          </div>
          <p className="text-zinc-500 text-xs font-bold">
            Consola central de StylerNow.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm font-medium border border-red-500/20">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Corporativo</label>
            <input 
              type="email" 
              placeholder="admin@stylernow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0E0E0F] rounded-xl border border-zinc-800 text-white text-sm font-medium focus:outline-none focus:border-[#D0FF14] transition-all"
              disabled={isPending}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Contraseña de Control</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0E0E0F] rounded-xl border border-zinc-800 text-white text-sm font-medium focus:outline-none focus:border-[#D0FF14] transition-all pr-12"
                disabled={isPending}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                disabled={isPending}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#D0FF14] text-black py-3.5 rounded-xl font-black text-sm tracking-wide hover:bg-[#bce612] transition-colors focus:outline-none focus:ring-4 focus:ring-[#D0FF14]/20 disabled:opacity-50 mt-2 shadow-xl shadow-[#D0FF14]/5"
            disabled={isPending}
          >
            {isPending ? 'Verificando Nodo...' : 'Ingresar a Consola'}
          </button>
        </form>
      </div>
    </div>
  );
}
