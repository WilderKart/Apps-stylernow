'use client';

import React, { useState } from 'react';
import { Search, MapPin, Award, Navigation, Sparkles } from 'lucide-react';
import Image from 'next/image';
import ServiceTypeToggle from '@/components/cliente/ServiceTypeToggle';
import MatchingModal from '@/components/cliente/MatchingModal';

export default function ClienteHome() {
  const [isMatchingOpen, setIsMatchingOpen] = useState(false);

  return (
    <div className="flex flex-col w-full h-full bg-white pb-10">
      
      {/* Custom Header */}
      <header className="px-5 pt-8 pb-4 flex items-center justify-between bg-white sticky top-0 z-40">
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Tu ubicación actual</p>
          <div className="flex items-center gap-1.5 cursor-pointer">
            <h2 className="text-lg font-extrabold text-[#1A1A1A]">Bogotá, Chapinero</h2>
            <MapPin className="w-4 h-4 text-black" />
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shadow-inner">
          <span className="text-sm font-bold">AJ</span>
        </div>
      </header>

      <div className="px-5 py-2">
        {/* Search Bar */}
        <div className="relative w-full mb-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, barbero o especialidad..."
            className="w-full bg-zinc-100 text-sm font-medium pl-10 pr-4 py-3.5 rounded-xl border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 focus:outline-none transition-all"
          />
        </div>

        {/* Toggle Domicilio / Barbería (Fase 6) */}
        <div className="mb-2">
           <ServiceTypeToggle />
        </div>
      </div>

      <div className="px-5 py-4">
        {/* StylerNow Promos Banner */}
        <div className="w-full bg-[#1A1A1A] rounded-2xl p-5 text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-[#D0FF14] text-black rounded text-[10px] font-bold tracking-widest uppercase mb-2">Express</span>
            <h3 className="text-xl font-extrabold mb-1 flex items-center gap-2">
              Emparejar Al Instante <Sparkles className="w-5 h-5 text-[#D0FF14]" />
            </h3>
            <p className="text-sm text-zinc-300 font-medium max-w-[200px] mb-4">¿Sin tiempo? Deja que nuestro algoritmo te asigne el mejor barbero ya.</p>
            <button 
              onClick={() => setIsMatchingOpen(true)}
              className="bg-white text-black text-xs font-black px-4 py-2 rounded-xl hover:bg-[#D0FF14] transition-colors flex items-center gap-1 shadow-md"
            >
               Iniciar Búsqueda
            </button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-[16px] border-white/10"></div>
        </div>
      </div>

      {/* Near Barbers */}
      <div className="px-5 py-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black tracking-tight">Barberías Cerca de Ti</h3>
          <button className="text-sm font-bold text-zinc-400 hover:text-black transition-colors flex items-center gap-1">
            Ver Mapa <Navigation className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          
          {/* Barber Card Mock */}
          <div className="w-full flex flex-col rounded-2xl border border-zinc-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-full h-32 bg-zinc-100 relative">
              <img src="/imagenes/barberias/premium.png" alt="The Gentlemen's Club" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-black flex items-center gap-1 shadow-sm">
                <span>⭐</span> 4.9
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-base font-bold text-black">The Gentlemen's Club</h4>
              <p className="text-xs text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> A 1.2km • Cra 15 #85-20
              </p>
              
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Premium</span>
                <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-600 flex items-center gap-1">
                  <Award className="w-3 h-3" /> 2 Experts
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col rounded-2xl border border-zinc-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-full h-32 bg-zinc-100 relative">
              <img src="/imagenes/barberias/urban.png" alt="Urban Kings Barber" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-black flex items-center gap-1 shadow-sm">
                <span>⭐</span> 4.7
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-base font-bold text-black">Urban Kings Barber</h4>
              <p className="text-xs text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> A 2.5km • Cll 100 #19-45
              </p>
              
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Studio</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Renderizado del Modal de Matching */}
      <MatchingModal 
        isOpen={isMatchingOpen} 
        onClose={() => setIsMatchingOpen(false)} 
        servicioId="demo-servicio-id" 
        clienteId="demo-cliente-id" // En producción se obtiene del Auth/Context
      />

    </div>
  );
}
