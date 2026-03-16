import React from 'react';
import Link from 'next/link';
import { Home, CalendarClock, User } from 'lucide-react';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="flex flex-col h-[100dvh] bg-zinc-50 font-sans text-[#1A1A1A] max-w-md mx-auto relative shadow-2xl overflow-hidden sm:border-x sm:border-gray-200"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      
      {/* Client Application Area */}
      <main className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
        {children}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around h-16 px-4 z-[60]"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <Link 
          href="/cliente" 
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-zinc-500 hover:text-black transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">Explorar</span>
        </Link>
        <Link 
          href="/cliente/reservas" 
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-zinc-500 hover:text-black transition-colors"
        >
          <CalendarClock className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">Citas</span>
        </Link>
        <Link 
          href="/cliente/perfil" 
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-zinc-500 hover:text-black transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
