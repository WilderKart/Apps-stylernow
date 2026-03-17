'use client';
import React, { useState, useTransition } from 'react';
import { login, signup } from './actions';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = async (formData: FormData, actionFunc: typeof login) => {
    setError(null);
    startTransition(async () => {
      const result = await actionFunc(formData);
      if (result?.error) {
         // Si el usuario no existe y trató de loguear, o si la constraseña es incorrecta
         if (result.error.includes('Invalid login credentials')) {
            setError('Credenciales incorrectas.');
         } else if (result.error.includes('User already registered')) {
            setError('El usuario ya existe, intenta iniciar sesión.');
         } else {
            setError(result.error);
         }
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-black/5 border border-zinc-100">
      <div className="text-center mb-8 flex flex-col items-center">
        <Logo markOnly={true} className="w-12 h-12 mb-2" />
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tighter">StylerNow</h1>
        <p className="text-sm text-zinc-500 mt-2 font-medium">Ingresa a tu cuenta o regístrate</p>
      </div>

      <form className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5" htmlFor="email">Correo electrónico</label>
          <input 
            id="email"
            name="email"
            type="email" 
            placeholder="tumail@ejemplo.com" 
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            required
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5" htmlFor="password">Contraseña</label>
          <input 
            id="password"
            name="password"
            type="password" 
            placeholder="••••••••" 
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            required
            disabled={isPending}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <button 
            type="submit" 
            formAction={(formData) => handleAction(formData, login)}
            className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-lg font-bold text-sm tracking-wide hover:bg-black transition-colors focus:outline-none focus:ring-4 focus:ring-zinc-200 disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
          
          <button 
            type="submit" 
            formAction={(formData) => handleAction(formData, signup)}
            className="w-full bg-white text-[#1A1A1A] py-3.5 rounded-lg font-bold text-sm tracking-wide border border-zinc-200 hover:bg-zinc-50 transition-colors focus:outline-none focus:ring-4 focus:ring-zinc-200 disabled:opacity-50"
            disabled={isPending}
          >
            Registrarse
          </button>
        </div>
      </form>
    </div>
  );
}
