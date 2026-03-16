'use client';
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Calendar, ClipboardList, X } from 'lucide-react';

export default function ManagerSidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (isOpen: boolean) => void }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen?.(false)} 
        />
      )}
      <aside className={`w-64 bg-white border-r border-zinc-200 flex flex-col h-[100dvh] fixed left-0 top-0 z-50 transition-transform duration-300 shadow-sm ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-zinc-100 flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-extrabold tracking-tighter text-[#1A1A1A]">StylerNow</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#b08d57]">Panel Manager</span>
          </div>
          {/* Close button inside sidebar for mobile */}
          <button className="md:hidden text-zinc-500 hover:text-black" onClick={() => setIsOpen?.(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar">
          <div className="mb-4 mt-2">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Operación Diaria</p>
            <Link onClick={() => setIsOpen?.(false)} href="/manager" className="flex items-center gap-3 px-4 py-2.5 text-black bg-zinc-100 rounded-xl font-bold transition-all">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm">Resumen Hoy</span>
            </Link>
            <Link onClick={() => setIsOpen?.(false)} href="/dashboard/agenda" className="flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-xl font-bold transition-all mt-1">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Agenda General</span>
            </Link>
          </div>

          <div className="mb-4">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Gestión</p>
            <Link onClick={() => setIsOpen?.(false)} href="#" className="flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-xl font-bold transition-all">
              <Users className="w-5 h-5" />
              <span className="text-sm">Staff Activo</span>
            </Link>
            <Link onClick={() => setIsOpen?.(false)} href="#" className="flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-xl font-bold transition-all mt-1">
              <ClipboardList className="w-5 h-5" />
              <span className="text-sm">Inventario & Cajas</span>
            </Link>
          </div>
        </nav>

        {/* User Info Bottom */}
        <div className="p-4 border-t border-zinc-100 mt-auto bg-zinc-50">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-xs shrink-0">MA</div>
            <div className="flex-1 truncate">
              <h3 className="text-sm font-bold text-black truncate">Manager Area</h3>
              <p className="text-[10px] text-zinc-500 font-medium truncate">manager@stylernow.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
