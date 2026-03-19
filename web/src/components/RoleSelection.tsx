'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Building2, Scissors } from 'lucide-react';
import Logo from '@/components/Logo';

export default function RoleSelection() {
  const roles = [
    {
      title: 'Soy cliente',
      description: 'Reserva tu cita en barberías profesionales cerca de ti.',
      buttonText: 'Entrar como cliente',
      href: '/auth/login?role=client',
      icon: <User className="w-8 h-8 text-black" />,
      style: 'bg-white text-zinc-900 border-zinc-200'
    },
    {
      title: 'Tengo una barbería',
      description: 'Registra tu barbería y prueba StylerNow gratis por 7 días.',
      buttonText: 'Registrar mi barbería',
      href: '/auth/register?role=shop_owner',
      icon: <Building2 className="w-8 h-8 text-white" />,
      style: 'bg-[#0E0E0F] text-white border-zinc-800/40'
    },
    {
      title: 'Soy barbero',
      description: 'Accede a tu agenda, clientes y comisiones.',
      buttonText: 'Entrar como barbero',
      href: '/auth/login?role=barber',
      icon: <Scissors className="w-8 h-8 text-black" />,
      style: 'bg-white text-zinc-900 border-zinc-200'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-96 h-96 bg-black rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D0FF14] rounded-full filter blur-3xl animate-pulse"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10 z-10"
      >
        <Logo markOnly={true} className="w-12 h-12 mb-3" />
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A]">¿Quién eres?</h1>
        <p className="text-zinc-500 text-sm font-medium tracking-wide mt-1">Selecciona cómo quieres usar StylerNow.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
        {roles.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-2xl p-6 flex flex-col justify-between h-[250px] shadow-xl shadow-black/5 hover:shadow-2xl hover:translate-y-[-4px] transition-all cursor-pointer group ${item.style}`}
          >
            <div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 border ${item.title === 'Tengo una barbería' ? 'bg-[#1e1e1f] border-zinc-700' : 'bg-zinc-50 border-zinc-100'}`}>
                {item.icon}
              </div>
              <h2 className="text-xl font-black mb-1">{item.title}</h2>
              <p className={`text-sm ${item.title === 'Tengo una barbería' ? 'text-zinc-400' : 'text-zinc-500'} font-medium`}>
                {item.description}
              </p>
            </div>

            <Link href={item.href} className="w-full">
              <button className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all text-center ${item.title === 'Tengo una barbería' ? 'bg-[#D0FF14] text-black hover:bg-[#bce612]' : 'bg-[#1A1A1A] text-white hover:bg-black'}`}>
                {item.buttonText}
              </button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Discret Admin Link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center z-10"
      >
        <Link href="/auth/admin" className="text-xs font-bold text-zinc-400 hover:text-black transition-colors">
          Acceso administrativo
        </Link>
      </motion.div>
    </div>
  );
}
