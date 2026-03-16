import React from 'react';

export default function ReservasPage() {
  return (
    <div className="flex flex-col w-full h-full bg-zinc-50 p-5 pt-8">
      <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-6">Mis Citas</h2>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-zinc-200 mb-6">
        <button className="pb-3 border-b-2 border-black font-bold text-sm text-black">
          Próximas
        </button>
        <button className="pb-3 border-b-2 border-transparent font-semibold text-sm text-zinc-400 hover:text-zinc-600">
          Historial
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Next Appt Card */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Mañana, 4:00 PM</p>
              <h4 className="text-lg font-bold text-black">The Gentlemen's Club</h4>
            </div>
            <span className="bg-zinc-100 text-black px-2 py-1 rounded text-xs font-bold">
              Confirmada
            </span>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-50 mb-4 text-sm">
            <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center">
               <span className="text-xs font-bold text-zinc-400">P</span>
            </div>
            <div>
              <p className="font-semibold text-black">Barbero: Pablo M.</p>
              <p className="text-xs text-zinc-500">Corte + Arreglo Barba</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-black text-white text-sm font-bold py-3 rounded-lg hover:bg-zinc-800 transition-colors">
              Ver Código QR
            </button>
            <button className="w-12 h-12 flex items-center justify-center border border-zinc-200 text-zinc-500 rounded-lg hover:bg-zinc-50 transition-colors">
              <span className="font-bold">···</span>
            </button>
          </div>
        </div>

        {/* Empty State Mock */}
        <div className="mt-4 p-8 bg-zinc-100 border border-zinc-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
             <span className="text-xl">📅</span>
          </div>
          <p className="text-zinc-500 font-medium text-sm">No tienes más citas programadas.</p>
          <button className="mt-4 text-xs font-bold uppercase tracking-widest text-black underline underline-offset-4 decoration-zinc-300">
            Explorar Barberías
          </button>
        </div>
      </div>
    </div>
  );
}
