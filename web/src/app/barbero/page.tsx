import React from 'react';
import { Clock, CheckCircle2, User, PlayCircle } from 'lucide-react';

export default function BarberoHome() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50">
      
      {/* Header */}
      <header className="px-5 pt-8 pb-4 bg-white border-b border-zinc-100 flex items-center justify-between sticky top-0 z-40">
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Jueves, 18 Nov</p>
          <h2 className="text-xl font-extrabold text-[#1A1A1A]">Hola, David</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-100 border-2 border-zinc-800 flex items-center justify-center relative shadow-sm">
          <span className="text-sm font-bold">DS</span>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      </header>

      <div className="p-5 flex flex-col gap-6">
        
        {/* Next Appointment Active State */}
        <div className="bg-[#1A1A1A] p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]"></div>
           <div className="flex items-center gap-2 mb-4 relative z-10">
             <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
             <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">En Curso</p>
           </div>
           
           <h3 className="text-2xl font-extrabold mb-1 relative z-10">Corte + Barba</h3>
           <p className="text-sm text-zinc-400 flex items-center gap-1.5 font-medium relative z-10">
             <User className="w-4 h-4" /> Cliente: Andrés Jiménez
           </p>

           <div className="mt-5 flex gap-2 relative z-10">
             <button className="flex-1 bg-white text-black text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
               <CheckCircle2 className="w-4 h-4" /> Finalizar Servicio
             </button>
           </div>
        </div>

        {/* Schedule List */}
        <div>
          <h3 className="text-lg font-bold text-black mb-4">Próximos Turnos</h3>
          
          <div className="flex flex-col gap-3">
             
             {/* Turn Item */}
             <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
                <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-zinc-100 pr-4">
                  <p className="text-xs font-bold text-zinc-400">PM</p>
                  <p className="text-lg font-extrabold text-black">4:30</p>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-black leading-tight mb-1">Carlos Mendoza</h4>
                  <p className="text-xs text-zinc-500 font-medium">Corte Clásico (45 min)</p>
                </div>
                <button className="w-10 h-10 bg-zinc-100 text-black rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors">
                  <PlayCircle className="w-5 h-5" />
                </button>
             </div>

             <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-300"></div>
                <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-zinc-100 pr-4">
                  <p className="text-xs font-bold text-zinc-400">PM</p>
                  <p className="text-lg font-extrabold text-zinc-400">5:30</p>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-black leading-tight mb-1">Felipe Ruiz</h4>
                  <p className="text-xs text-zinc-500 font-medium">Combo Premium (1h)</p>
                </div>
                <button className="w-10 h-10 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center cursor-not-allowed">
                  <PlayCircle className="w-5 h-5" />
                </button>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
}
