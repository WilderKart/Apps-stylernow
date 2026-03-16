import React from 'react';
import { LogOut, Settings, Award } from 'lucide-react';

export default function BarberoPerfil() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50 pt-8 pb-20">
      <div className="flex flex-col items-center justify-center p-6 bg-white border-b border-zinc-100">
        <div className="w-24 h-24 rounded-full bg-zinc-100 border-4 border-white shadow-sm flex items-center justify-center mb-4 relative">
          <span className="text-3xl font-bold text-zinc-400">DS</span>
        </div>
        <h2 className="text-xl font-extrabold text-[#1A1A1A]">David S.</h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 rounded-md text-xs font-bold bg-zinc-800 text-white shadow-sm">
          <Award className="w-3 h-3 text-zinc-300" /> Barbero Pro
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
          <button className="w-full flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
            <span className="text-sm font-bold text-black">Mi Horario</span>
            <span className="text-zinc-400">›</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-black" />
              <span className="text-sm font-bold text-black">Configuración</span>
            </div>
            <span className="text-zinc-400">›</span>
          </button>
        </div>

        <button className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold text-sm bg-white border border-red-50 rounded-2xl hover:bg-red-50 transition-colors mt-4">
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
