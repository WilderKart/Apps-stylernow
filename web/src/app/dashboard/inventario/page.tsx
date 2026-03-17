'use client';

import React from 'react';
import { Package, AlertTriangle, TrendingUp, DollarSign, Plus, ArrowUpDown, MoreHorizontal } from 'lucide-react';

export default function InventarioPage() {
  const stockCritico = [
    { id: 1, item: "Cera Modeladora Matte", categoria: "Fijación", actual: 3, minimo: 10, precio: "$12.00" },
    { id: 2, item: "After Shave Hydra", categoria: "Post-Afeitado", actual: 1, minimo: 5, precio: "$8.50" },
    { id: 3, item: "Cuchillas Derby Premium", categoria: "Insumos", actual: 50, minimo: 200, precio: "$25.00" }
  ];

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto px-4 md:px-0">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Inventario & Caja</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide mt-1">
            Gestiona el stock de productos, insumos y el flujo de caja diario de tu barbería.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 text-black border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all">
            <ArrowUpDown className="w-4 h-4" /> Ajuste Caja
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-bold text-sm shadow-sm hover:bg-zinc-800 transition-all">
            <Plus className="w-4 h-4" /> Registrar Ítem
          </button>
        </div>
      </div>

      {/* Métricas de Inventario y Caja */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Package, label: "Valuación Stock", value: "$4,530", sub: "142 productos en total" },
          { icon: AlertTriangle, label: "Stock Crítico", value: "3", sub: "Requieren reorden urgente", color: "text-red-500" },
          { icon: DollarSign, label: "Caja Hoy", value: "$845.00", sub: "Cierre proyectado" },
          { icon: TrendingUp, label: "Venta Productos", value: "$120.00", sub: "Hoy de productos" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                <item.icon className={`w-5 h-5 ${item.color || 'text-zinc-600'}`} />
              </div>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{item.label}</p>
            <p className="text-3xl font-extrabold text-black mt-1">{item.value}</p>
            <p className="text-xs text-zinc-400 font-medium mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla Stock Crítico */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-red-500" /> Alertas de Abastecimiento
            </h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Ítem</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Categoría</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">En Stock</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {stockCritico.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4"><p className="text-sm font-bold text-black">{row.item}</p></td>
                    <td className="p-4"><p className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full inline-block">{row.categoria}</p></td>
                    <td className="p-4"><p className="text-sm font-extrabold text-red-600">{row.actual}</p></td>
                    <td className="p-4"><p className="text-sm font-bold text-zinc-400">{row.minimo}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen Caja del Día */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" /> Registro de Caja
          </h3>
          <div className="flex-1 flex flex-col gap-4">
            {[
              { label: "Apertura de Caja", value: "$100.00", time: "08:00 AM", type: "neutral" },
              { label: "Pago Corte (Pablo M.)", value: "+$45.00", time: "09:30 AM", type: "in" },
              { label: "Compra Café Insumos", value: "-$12.50", time: "11:00 AM", type: "out" },
              { label: "Pago Corte (Luis R.)", value: "+$50.00", time: "12:15 PM", type: "in" }
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-50 bg-zinc-50/50">
                <div>
                  <p className="text-sm font-bold text-black">{row.label}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">{row.time}</p>
                </div>
                <p className={`text-sm font-extrabold ${row.type === 'in' ? 'text-green-600' : row.type === 'out' ? 'text-red-600' : 'text-black'}`}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-zinc-100 text-black font-bold text-sm rounded-xl border border-zinc-200 hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
             Ver Historial Completo
          </button>
        </div>
      </div>

    </div>
  );
}
