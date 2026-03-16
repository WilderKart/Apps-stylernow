'use client';
import React, { useState } from 'react';
import ManagerSidebar from '@/components/ManagerSidebar';
import { Menu } from 'lucide-react';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-zinc-50 font-sans text-[#1A1A1A] overflow-hidden">
      
      <ManagerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col w-full h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-4 md:px-8 shrink-0">
           <div className="flex items-center gap-3">
             <button 
               className="p-2 -ml-2 mr-2 md:hidden hover:bg-zinc-100 rounded-lg transition-colors"
               onClick={() => setIsSidebarOpen(true)}
             >
               <Menu className="w-5 h-5 text-black" />
             </button>
             <span className="w-2 h-2 rounded-full bg-green-500 hidden md:block"></span>
             <p className="text-xs font-bold text-black uppercase tracking-widest truncate max-w-[150px] md:max-w-none">Sede Norte <span className="hidden md:inline">- Operación en Curso</span></p>
           </div>
           
           <div className="flex items-center gap-4">
             <button className="text-xs md:text-sm font-bold text-zinc-500 hover:text-black transition-colors">Notificaciones</button>
             <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 shrink-0"></div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
