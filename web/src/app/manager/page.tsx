import React from 'react';
import { Users, AlertTriangle, CalendarCheck, Clock } from 'lucide-react';

export default function ManagerHome() {
  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Resumen de Operación (Hoy)</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide mt-1">
             Monitorea el estado actual de la sede, personal activo y atención al cliente.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Barberos Activos</h3>
            <Users className="w-5 h-5 text-zinc-300" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-black">4</span>
            <span className="text-sm font-bold text-zinc-400 mb-1">/ 5 registrados</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Citas Totales</h3>
            <CalendarCheck className="w-5 h-5 text-zinc-300" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-black">28</span>
            <span className="text-sm font-bold text-zinc-400 mb-1">hoy</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">En Sala de Espera</h3>
            <Clock className="w-5 h-5 text-zinc-300" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-black">2</span>
            <span className="text-sm font-bold text-zinc-400 mb-1">clientes</span>
          </div>
        </div>

        {/* Alert Card */}
        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-yellow-600 uppercase tracking-widest">Alertas</h3>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-sm font-bold text-yellow-800 leading-tight">
            Notificaron 1 retraso de barbero esta mañana.
          </p>
        </div>

      </div>

      {/* Staff Status Grid */}
      <div>
        <h3 className="text-lg font-bold text-black mb-4">Estado del Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-black text-xs border border-zinc-200">DS</div>
                <div>
                  <h4 className="text-sm font-bold text-black">David S.</h4>
                   <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pro</p>
                </div>
             </div>
             <div className="text-right">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Ocupado
                </span>
             </div>
           </div>

           <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-black text-xs border border-zinc-200">PM</div>
                <div>
                  <h4 className="text-sm font-bold text-black">Pablo M.</h4>
                   <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Artesano</p>
                </div>
             </div>
             <div className="text-right">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-100 text-zinc-500 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-zinc-400"></span> Almuerzo
                </span>
             </div>
           </div>

           <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-black text-xs border border-zinc-200">LR</div>
                <div>
                  <h4 className="text-sm font-bold text-black">Luis R.</h4>
                   <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Experto</p>
                </div>
             </div>
             <div className="text-right">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Disponible
                </span>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
