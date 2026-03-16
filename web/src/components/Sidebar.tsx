'use client';
import Link from 'next/link';
import { Home, CalendarDays, Users, Megaphone, Settings, UserCircle, X } from 'lucide-react';

export function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (isOpen: boolean) => void }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen?.(false)} 
        />
      )}
      
      <aside className={`w-64 h-[100dvh] border-r border-gray-100 bg-white flex flex-col fixed left-0 top-0 pt-6 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-6 mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tighter text-[#1A1A1A]">StylerNow</h2>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-widest">Master Panel</p>
          </div>
          {/* Close button inside sidebar for mobile */}
          <button className="md:hidden text-zinc-500 hover:text-black" onClick={() => setIsOpen?.(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
          <Link 
            href="/dashboard" 
            onClick={() => setIsOpen?.(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 hover:text-black transition-colors"
          >
            <Home className="w-4 h-4" /> Resumen
          </Link>
          <Link 
            href="/dashboard/agenda" 
            onClick={() => setIsOpen?.(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 hover:text-black transition-colors"
          >
            <CalendarDays className="w-4 h-4" /> Agenda
          </Link>
          <Link 
            href="/dashboard/equipo" 
            onClick={() => setIsOpen?.(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 hover:text-black transition-colors"
          >
            <Users className="w-4 h-4" /> Equipo
          </Link>
          <Link 
            href="#" 
            onClick={() => setIsOpen?.(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-50 text-black transition-colors border border-gray-100"
          >
            <Megaphone className="w-4 h-4 text-green-500" /> Promociones
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link 
            href="/dashboard/configuracion" 
            onClick={() => setIsOpen?.(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 hover:text-black transition-colors"
          >
            <Settings className="w-4 h-4" /> Configuración
          </Link>
          <button 
            onClick={() => setIsOpen?.(false)}
            className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors mt-2"
          >
            <UserCircle className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
