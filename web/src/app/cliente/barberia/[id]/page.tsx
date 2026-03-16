import React from 'react';
import { MapPin, Star, Clock, ChevronLeft, Scissors } from 'lucide-react';
import Link from 'next/link';

export default function BarberiaDetalle() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white pb-24">
      
      {/* Visual Header / Cover */}
      <div className="w-full h-64 bg-zinc-200 relative">
        <Link href="/cliente" className="absolute top-6 left-5 z-10 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg cursor-pointer">
          <ChevronLeft className="w-6 h-6 text-black" />
        </Link>
        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 bg-zinc-100">
           <span className="text-sm font-semibold uppercase tracking-widest">Foto Portada de Barbería</span>
        </div>
      </div>

      {/* Basic Info */}
      <div className="px-5 py-6 bg-white rounded-t-3xl -mt-6 relative z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] leading-tight max-w-[70%]">The Gentlemen's Club</h1>
          <div className="flex flex-col items-end">
             <span className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded text-xs font-bold">
               <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 4.9
             </span>
             <span className="text-[10px] text-zinc-400 mt-1 font-semibold underline underline-offset-2">128 reseñas</span>
          </div>
        </div>

        <p className="text-sm text-zinc-500 font-medium flex items-center gap-1.5 mt-2">
          <MapPin className="w-4 h-4 text-black" /> Cra 15 #85-20, Bogotá
        </p>
        <p className="text-sm text-zinc-500 font-medium flex items-center gap-1.5 mt-2">
          <Clock className="w-4 h-4 text-black" /> Abierto Hoy • 09:00 - 20:00
        </p>
      </div>

      {/* Services Section */}
      <div className="px-5 py-4 border-t border-zinc-100">
        <h3 className="text-lg font-bold text-black mb-4">Servicios</h3>
        
        <div className="flex flex-col gap-3">
          {/* Service Item */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 cursor-pointer hover:border-black transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                <Scissors className="w-5 h-5 text-black" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Corte Clásico + Asesoría</h4>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">45 min</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold text-black">$35.000</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1A1A1A] text-white rounded-xl shadow-md cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full"></div>
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-lg">🔥</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Combo Premium (Corte + Barba)</h4>
                <p className="text-xs text-zinc-300 font-medium mt-0.5 line-through decoration-zinc-500 inline-block mr-2">$60.000</p>
                <p className="text-xs text-green-400 font-bold inline-block">1h 15 min</p>
              </div>
            </div>
            <div className="text-right relative z-10">
              <p className="text-sm font-extrabold text-white">$50.000</p>
            </div>
          </div>

        </div>
      </div>

      {/* Barber Selection Team */}
      <div className="px-5 py-4 border-t border-zinc-100">
        <h3 className="text-lg font-bold text-black mb-4">Elige a tu Profesional</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
             <div className="w-16 h-16 rounded-full bg-zinc-200 border-2 border-transparent focus:border-black relative">
               <div className="absolute -bottom-2 -right-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Expert</div>
             </div>
             <p className="text-xs font-bold text-black mt-1">Pablo M.</p>
          </div>

          <div className="flex flex-col items-center gap-2 min-w-[80px]">
             <div className="w-16 h-16 rounded-full bg-zinc-200 border-2 border-black relative p-1">
               <div className="w-full h-full bg-zinc-300 rounded-full"></div>
               <div className="absolute -bottom-2 -right-1 bg-zinc-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Pro</div>
             </div>
             <p className="text-xs font-bold text-black mt-1">David S.</p>
          </div>

          <div className="flex flex-col items-center gap-2 min-w-[80px]">
             <div className="w-16 h-16 rounded-full bg-zinc-200 border-2 border-transparent relative">
               <div className="absolute -bottom-2 -right-1 bg-[#b08d57] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Artesano</div>
             </div>
             <p className="text-xs font-bold text-black mt-1">Luis R.</p>
          </div>

        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-zinc-100 p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg">
          Continuar para Agendar
        </button>
      </div>

    </div>
  );
}
