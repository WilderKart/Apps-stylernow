'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, CheckCircle2, XCircle, Check } from 'lucide-react';
import { finalizarRegistroAction } from '../actions';
import AnimatedLoader from '@/components/AnimatedLoader';

const countries = [
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
];

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'client';
  const resume = searchParams.get('resume') === 'true';

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [phone, setPhone] = useState('');

  // Rate Limit / Resend Timer
  const [cooldown, setCooldown] = useState(0);
  const [loadingText, setLoadingText] = useState<string | null>(null);

  // Password Rules
  const [passRules, setPassRules] = useState({
    length: false,
    upper: false,
    lower: false,
    numberOrSymbol: false,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);



  const supabase = createClient();

  // 1. Efecto de Carga: Recuperar de localStorage y Auto-Finalizar
  useEffect(() => {
    const saved = localStorage.getItem('registro_form');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setCountryCode(data.countryCode || '+57');
        setPassword(data.password || ''); // preservamos contraseña para autorellenar
      } catch (e) {
        console.error('Error cargando localStorage', e);
      }
    }

    // Auto-Finalizar si volvemos del email (Hay sesión y credenciales guardadas)
    const checkSessionAndFinalize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email_confirmed_at) {
         // Existe sesión y mail verificado. Proceder a consolidar perfil.
         const savedData = localStorage.getItem('registro_form');
         if (savedData) {
            const data = JSON.parse(savedData);
            startTransition(async () => {
                const res = await finalizarRegistroAction({
                    nombre: data.fullName,
                    email: data.email,
                    celular: `${data.countryCode} ${data.phone}`,
                    contrasena: data.password,
                    role: role === 'shop_owner' ? 'master' : (role === 'barber' ? 'barbero' : 'cliente')
                });

                if (res.success) {
                    localStorage.removeItem('registro_form');
                    setShowSuccessModal(true);
                } else {
                    setError(res.error || 'Fallo al consolidar cuenta.');
                    // Fail-Safe: No limpiamos localStorage. El usuario puede arreglar datos y reintentar.
                }
            });
         } else if (resume) {
             // Si es un huérfano sin localStorage, pedirle que llene el formulario de nuevo en la vista
             setStep('form');
             setError('Completa tus datos para recuperar tu cuenta.');
         }
      } else if (resume && !user) {
          // Intento de resume sin sesión
          router.push('/auth/login');
      }
    };

    checkSessionAndFinalize();
  }, [supabase, router, role, resume, step]);



  // 2. Validación de Contraseña en Tiempo Real
  useEffect(() => {
    setPassRules({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      numberOrSymbol: /[\d!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|`~]/.test(password),
    });
  }, [password]);

  // 3. Temporizador de Cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName || !email || !password || !phone) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (!passRules.length || !passRules.upper || !passRules.lower || !passRules.numberOrSymbol) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
      return;
    }

    startTransition(async () => {
      // Guardar en localStorage (Fail-Safe)
      localStorage.setItem('registro_form', JSON.stringify({
         fullName, email, password, countryCode, phone
      }));

      // Lanzar Registro con Contraseña y MetaData
          const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?type=signup&role=${role}`,
              data: {
                role: role === 'shop_owner' ? 'master' : (role === 'barber' ? 'barbero' : 'cliente'),
                full_name: fullName,
                phone: `${countryCode} ${phone}`
              }
            }
          });



      if (authError) {
        setError(authError.message);
        return;
      }

      setStep('verify');
      setCooldown(60);
    });

  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?type=signup` }
    });

    if (authError) setError(authError.message);
    else setCooldown(60);
  };

  if (step === 'verify') {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-zinc-100 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full border-4 border-semibold border-emerald-500 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-xl font-black text-zinc-900 mb-2">Enlace enviado por correo electrónico</h1>
        <p className="text-zinc-500 text-sm font-medium mb-8">
           Hemos enviado un correo electrónico a <span className="text-black font-bold">{email}</span> con un enlace para que continúes con tu registro.
        </p>

        
        <button type="button" onClick={handleResend} disabled={cooldown > 0}
          className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide disabled:opacity-50 transition-all">
          {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar Correo'}
        </button>
        <Link href={`/auth/login?role=${role}`} className="text-xs font-bold text-zinc-400 hover:text-black mt-4 transition-colors">
          Volver a Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (loadingText) {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-zinc-100 flex flex-col items-center justify-center text-center">
        <AnimatedLoader className="w-24 h-24 mb-4" />
        <h2 className="text-xl font-black text-[#1A1A1A] mb-1">{loadingText}</h2>
        <p className="text-zinc-400 text-xs">No cierres esta ventana, estamos configurando tu cuenta.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-zinc-100 relative">

      <div className="text-center mb-6 flex flex-col items-center">
        <Logo markOnly={true} className="w-12 h-12 mb-2" />
        <h1 className="text-2xl font-black text-[#1A1A1A]">Crear Cuenta</h1>
        <p className="text-zinc-500 text-xs font-semibold">
          {role === 'shop_owner' ? 'Registra tu barbería hoy.' : 'Disfruta la experiencia StylerNow.'}
        </p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-medium border border-green-100">{success}</div>}

        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Nombre Completo</label>
          <input type="text" placeholder="Ej: Juan Pérez" value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-black bg-zinc-50" disabled={isPending} />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Correo Electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-black bg-zinc-50" disabled={isPending} />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Número Móvil</label>
          <div className="flex gap-2">
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
              className="px-3 rounded-xl border border-zinc-200 text-sm font-bold bg-zinc-50 focus:ring-2 focus:ring-black" disabled={isPending}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <input type="tel" placeholder="3000000000" value={phone} 
              onChange={(e) => {
                 const onlyNums = e.target.value.replace(/\D/g, '');
                 if (onlyNums.length <= 14) setPhone(onlyNums);
              }}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-black bg-zinc-50" disabled={isPending} />

          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Contraseña</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-black bg-zinc-50" disabled={isPending} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors" disabled={isPending}>
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Validador de contraseña visual */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 p-2 bg-zinc-50 rounded-lg">
             <div className="flex items-center gap-1.5 text-xs font-semibold">
                {passRules.length ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-zinc-300" />}
                <span className={passRules.length ? "text-green-600" : "text-zinc-400"}>Mín. 8 caracteres</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-semibold">
                {passRules.upper ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-zinc-300" />}
                <span className={passRules.upper ? "text-green-600" : "text-zinc-400"}>1 Mayúscula</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-semibold">
                {passRules.lower ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-zinc-300" />}
                <span className={passRules.lower ? "text-green-600" : "text-zinc-400"}>1 Minúscula</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-semibold">
                {passRules.numberOrSymbol ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-zinc-300" />}
                <span className={passRules.numberOrSymbol ? "text-green-600" : "text-zinc-400"}>1 Número/Símbolo</span>
             </div>
          </div>
        </div>

        <button type="submit" disabled={isPending}
          className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide disabled:opacity-50 mt-2 hover:bg-black transition-colors">
          {isPending ? 'Procesando...' : 'Crear Cuenta'}
        </button>

        <p className="text-center text-xs text-zinc-500 font-medium mt-2">
          ¿Ya tienes cuenta?{' '}
          <Link href={`/auth/login?role=${role}`} className="font-bold text-black hover:underline">Inicia Sesión</Link>
        </p>
      </form>

      {showSuccessModal && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl p-6 text-center z-20 animate-fade-in">
          <div className="w-16 h-16 rounded-full border-4 border-semibold border-emerald-500 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-zinc-900 mb-2">¡Cuenta creada con éxito!</h3>
          <p className="text-zinc-500 text-sm font-medium mb-8">
            Tu cuenta ha sido activada y consolidada.<br />Ya puedes iniciar sesión con tus credenciales.
          </p>
          <button onClick={() => router.push(`/auth/login?role=${role}`)}
            className="w-full bg-[#1A1A1A] hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm transition-colors">
            Aceptar
          </button>
        </div>
      )}

      {isPending && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl p-6 text-center z-30 animate-fade-in">
          <video src="/animaciones/loading.webm" autoPlay loop muted className="w-32 h-32" />
          <h3 className="text-lg font-black text-zinc-900 mt-2">Configurando cuenta...</h3>
          <p className="text-zinc-400 text-xs font-medium">Por favor no cierres la ventana.</p>
        </div>
      )}
    </div>

  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm font-bold text-zinc-500">Cargando...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
