'use client';

import React from 'react';
import { Megaphone, TrendingUp, Users, Ticket, Plus, Award, Zap, Calendar } from 'lucide-react';

export default function PromocionesPage() {
  const promociones = [
    {
      id: 1,
      titulo: "Corte + Barba Martes",
      descuento: "15%",
      redimidos: 45,
      limite: 100,
      estado: "Activa",
      color: "from-blue-500 to-indigo-600",
      fecha: "Expira en 5 días"
    },
    {
      id: 2,
      titulo: "Promo Primeriza",
      descuento: "10% Off",
      redimidos: 120,
      limite: 500,
      estado: "Activa",
      color: "from-emerald-500 to-teal-600",
      fecha: "Siempre activa"
    },
    {
      id: 3,
      titulo: "Happy Hour Capilar",
      descuento: "Lavado gratis",
      redimidos: 12,
      limite: 30,
      estado: "Pausada",
      color: "from-amber-500 to-orange-600",
      fecha: "Pausada ayer"
    }
  ];

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto px-4 md:px-0">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Promociones</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide mt-1">
            Crea campañas de fidelización y descuentos inteligentes para tus clientes.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-bold text-sm shadow-sm hover:bg-zinc-800 transition-all">
          <Plus className="w-4 h-4" /> Crear Campaña
        </button>
      </div>

      {/* Métricas Promocionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Ticket, label: "Totales Creadas", value: "7", sub: "3 activas ahora" },
          { icon: TrendingUp, label: "Redenciones Hoy", value: "14", sub: "+12% vs. ayer", trend: "up" },
          { icon: Users, label: "Nuevos Clientes", value: "32", sub: "Atraídos por promo" },
          { icon: Award, label: "% Éxito", value: "68%", sub: "Tasa de redención" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                <item.icon className="w-5 h-5 text-zinc-600" />
              </div>
              {item.trend === 'up' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ +12%</span>}
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{item.label}</p>
            <p className="text-3xl font-extrabold text-black mt-1">{item.value}</p>
            <p className="text-xs text-zinc-400 font-medium mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Promociones Activas */}
      <div>
        <h3 className="text-lg font-bold text-black mb-4">Campañas Activas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promociones.map((promo) => (
            <div key={promo.id} className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className={`h-28 bg-gradient-to-r ${promo.color} p-6 flex flex-col justify-between relative`}>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">
                  {promo.estado}
                </div>
                <Megaphone className="w-6 h-6 text-white/80" strokeWidth={1} />
                <h4 className="text-lg font-extrabold text-white leading-tight">{promo.titulo}</h4>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-zinc-400">Beneficio:</span>
                  <span className="text-lg font-extrabold text-black">{promo.descuento}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-1">
                    <span>Uso</span>
                    <span>{promo.redimidos} / {promo.limite}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black rounded-full" 
                      style={{ width: `${(promo.redimidos / promo.limite) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {promo.fecha}
                  </div>
                  <button className="text-xs font-bold text-black hover:underline">Ver Detalle</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
