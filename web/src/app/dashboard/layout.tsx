'use client';
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-zinc-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 md:ml-64 flex flex-col w-full h-full">
        {/* Topbar/Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex flex-row items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              className="p-2 -ml-2 mr-2 md:hidden hover:bg-zinc-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-black" />
            </button>
            <h2 className="text-xs md:text-sm font-semibold text-gray-500 truncate">Master Workspace</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">M</span>
              </div>
              <span className="text-sm font-medium hidden md:block">Master</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
