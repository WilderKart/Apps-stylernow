'use client';
import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-zinc-50 font-sans text-gray-900 overflow-hidden">
      
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col w-full h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0">
           <div className="flex items-center gap-3">
             <button 
               className="p-2 -ml-2 mr-2 md:hidden hover:bg-zinc-100 rounded-lg transition-colors"
               onClick={() => setIsSidebarOpen(true)}
             >
               <Menu className="w-5 h-5 text-black" />
             </button>
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse hidden md:block"></span>
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest hidden md:block">Todos los sistemas operativos</p>
           </div>
           
           <div className="flex items-center gap-4">
             <p className="text-xs font-mono text-zinc-500 hidden md:block">v1.0.0-rc.1</p>
             <button className="text-xs md:text-sm font-bold text-red-500 hover:text-red-600 transition-colors">Alertas del Sistema</button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
