import React from 'react';
import Link from 'next/link';
import { CalendarClock, DollarSign, User } from 'lucide-react';

export default function BarberoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="flex flex-col h-[100dvh] bg-zinc-50 font-sans text-[#1A1A1A] max-w-md mx-auto relative shadow-2xl overflow-hidden sm:border-x sm:border-gray-200"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      
      <main className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
        {children}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-zinc-800 flex items-center justify-around h-16 px-4 z-[60]"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <Link 
          href="/barbero" 
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-zinc-400 hover:text-white transition-colors"
        >
          <CalendarClock className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Agenda</span>
        </Link>
        <Link 
          href="/barbero/comisiones" 
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-zinc-400 hover:text-white transition-colors"
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Comisiones</span>
        </Link>
        <Link 
          href="/barbero/perfil" 
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-zinc-400 hover:text-white transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
