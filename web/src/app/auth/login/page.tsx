'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'client';
  const urlError = searchParams.get('error');

  const [error, setError] = useState<string | null>(urlError);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
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
        // 1. Detectar Perfil (Cuentas Huérfanas)
        const { data: userData } = await supabase
          .from('usuarios')
          .select('role')
          .eq('auth_id', authData.user.id)
          .single();

        if (!userData) {
          router.push('/auth/register?resume=true');
          return;
        }

        const realRole = userData.role;

        // 2. Validar Membership (V10.6)
        if (realRole === 'manager') {
           const { data: membership } = await supabase
             .from('memberships')
             .select('tenant_id')
             .eq('user_id', authData.user.id)
             .maybeSingle();

           if (!membership) {
              // Si no tiene membership, se reporta como huérfano
              router.push('/auth/register?resume=true');
              return;
           }
        }

        if (realRole === 'master' || realRole === 'manager') {
           const { data: tenant } = await supabase

             .from('tenants')
             .select('id, status')
             .eq('owner_id', authData.user.id)
             .single();

           if (!tenant) {
              router.push('/onboarding');
           } else {
              const status = tenant.status || 'pending_review';
              if (status === 'approved') router.push('/dashboard');
              else router.push('/onboarding/status');
           }
        } 
        else if (realRole === 'admin') router.push('/admin');
        else if (realRole === 'barbero') router.push('/barbero');
        else router.push('/cliente');
      }

    });
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-black/5 border border-zinc-100">
      <div className="text-center mb-6 flex flex-col items-center">
        <Logo markOnly={true} className="w-12 h-12 mb-2" />
        <h1 className="text-2xl font-black text-[#1A1A1A]">Iniciar Sesión</h1>
        <p className="text-zinc-500 text-xs font-semibold">
          {role === 'barber' ? 'Ingresa a tu agenda profesional.' : 'Gestiona tus citas de forma simple.'}
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">{error}</div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Correo Electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] transition-all bg-zinc-50" disabled={isPending} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Contraseña</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] transition-all bg-zinc-50" disabled={isPending} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors" disabled={isPending}>
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button type="submit"
          className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-black transition-colors focus:outline-none focus:ring-4 focus:ring-zinc-200 disabled:opacity-50 mt-2"
          disabled={isPending}>
          {isPending ? 'Verificando...' : 'Entrar'}
        </button>

        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-zinc-200 w-full" />
          <span className="bg-white px-3 text-xs text-zinc-400 absolute font-bold">O continuar con</span>
        </div>

        <button type="button" onClick={handleGoogleLogin}
          className="w-full bg-white text-[#1A1A1A] py-3.5 rounded-xl font-extrabold text-sm tracking-wide border border-zinc-200 flex items-center justify-center gap-3 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          disabled={isPending}>
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5 flex-shrink-0" />
          Google
        </button>

        <p className="text-center text-xs text-zinc-500 font-medium mt-2">
          ¿No tienes cuenta?{' '}
          <Link href={`/auth/register?role=${role}`} className="font-bold text-black hover:underline">Crear Cuenta</Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center p-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
