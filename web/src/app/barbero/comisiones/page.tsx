import React from 'react';
import { DollarSign, TrendingUp, Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';

export default function BarberoComisiones() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50 pb-20">
      
      <header className="px-5 pt-8 pb-4 bg-white border-b border-zinc-100 sticky top-0 z-40">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A]">Mis Comisiones</h1>
      </header>

      <div className="p-5 flex flex-col gap-6">
        
        {/* Earnings Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full"></div>
           <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 relative z-10">Generado Hoy</p>
           <h2 className="text-4xl font-extrabold text-black mb-2 relative z-10">$125.000</h2>
           <p className="text-xs font-bold text-green-500 flex items-center justify-center gap-1 relative z-10">
             <TrendingUp className="w-3 h-3" /> +15% vs ayer
           </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <DollarSign className="w-5 h-5 text-zinc-400 mb-2" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Semana Actual</p>
            <p className="text-lg font-extrabold text-black mt-1">$680.000</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <CalendarIcon className="w-5 h-5 text-zinc-400 mb-2" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Servicios Hoy</p>
            <p className="text-lg font-extrabold text-black mt-1">4 completados</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Historial (Hoy)</h3>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
             <div className="flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
               <div>
                 <p className="text-sm font-bold text-black">Corte Clásico</p>
                 <p className="text-xs text-zinc-500 font-medium">14:00 • Efectivo</p>
               </div>
               <div className="text-right">
                 <p className="text-sm font-extrabold text-green-600 flex items-center justify-end gap-1">+$21.000</p>
                 <p className="text-[10px] text-zinc-400 font-bold">Comisión 60%</p>
               </div>
             </div>
             
             <div className="flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
               <div>
                 <p className="text-sm font-bold text-black">Combo Premium</p>
                 <p className="text-xs text-zinc-500 font-medium">11:00 • MercadoPago</p>
               </div>
               <div className="text-right">
                 <p className="text-sm font-extrabold text-green-600 flex items-center justify-end gap-1">+$30.000</p>
                 <p className="text-[10px] text-zinc-400 font-bold">Comisión 60%</p>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
