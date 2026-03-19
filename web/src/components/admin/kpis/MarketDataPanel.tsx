'use client'

import React from 'react'
import { Sparkles, TrendingUp, Presentation, Database, ArrowRight } from 'lucide-react'

export interface MarketDataPanelProps {
  data: any
  isEmpty: boolean
}

export default function MarketDataPanel({ data, isEmpty }: MarketDataPanelProps) {
  
  if (isEmpty) {
    return (
      <div className="bg-[#101010] p-8 rounded-3xl border border-yellow-500/20 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
         <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-50"></div>
         <Database className="w-16 h-16 text-yellow-500/30 mb-4" />
         <h3 className="text-xl font-bold text-white mb-2 relative z-10">Data as a Service (Inactiva)</h3>
         <p className="text-zinc-500 text-center text-sm max-w-md relative z-10">
           Aún no hay volumen suficiente de citas o transacciones cruzadas para generar modelos de tendencias anonimizados vendibles.
         </p>
      </div>
    )
  }

  // Desestructuración segura del Market Data payload
  const topServices = data?.trends?.topServices || []
  const premiumRatio = data?.pricingSensitivity?.premiumRatio || 0
  const ecoRatio = data?.pricingSensitivity?.economyRatio || 0

  return (
    <div className="bg-[#101010] p-8 rounded-3xl border border-yellow-500/20 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-50"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 mb-8 border-b border-zinc-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
            <Sparkles className="w-3 h-3" /> Monetización DaaS
          </span>
          <h3 className="text-2xl font-black text-white mb-2">Market Data & Customer Behavior</h3>
          <p className="text-sm text-zinc-400 max-w-2xl font-medium">
            Tendencias agregadas, sensibilidad al precio y estacionalidad **100% anonimizada** lista para exportar a marcas de Grooming y Skincare.
          </p>
        </div>
        <button className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center gap-2 shrink-0">
          Exportar API (B2B) <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        
        {/* TOP TENDENCIAS */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Presentation className="w-4 h-4 text-yellow-500/50" /> Servicios Emergentes
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4">
            {topServices.length > 0 ? (
               topServices.slice(0, 3).map((srv: any, i: number) => (
                 <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                   <span className="text-sm font-bold text-white">{srv.name}</span>
                   <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">{srv.count} x</span>
                 </div>
               ))
            ) : (
               <p className="text-zinc-500 text-xs text-center py-4">Sin datos de tendencias</p>
            )}
          </div>
        </div>

        {/* SENSIBILIDAD AL PRECIO */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-500/50" /> Elasticidad Comercial
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 flex flex-col justify-center gap-4 h-full">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-zinc-300">Target Premium</span>
                <span className="text-yellow-400">{premiumRatio.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${premiumRatio}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-zinc-300">Target Económico</span>
                <span className="text-zinc-500">{ecoRatio.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-600" style={{ width: `${ecoRatio}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* INSIGHTS DE ENGAGEMENT */}
        <div className="flex flex-col gap-3">
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Database className="w-4 h-4 text-yellow-500/50" /> Data Packages
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 h-full flex flex-col justify-center gap-3">
             <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/80">
                <p className="text-xs text-yellow-500 font-bold mb-1">Volumen Agregado</p>
                <p className="text-sm font-medium text-zinc-300">Reporte de Demanda Global disponible.</p>
             </div>
             <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/80 filter grayscale opacity-50">
                <p className="text-xs text-zinc-400 font-bold mb-1">Geolocalización</p>
                <p className="text-xs text-zinc-500">Requiere +1k Barberías</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
