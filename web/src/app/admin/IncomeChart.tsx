'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

export default function IncomeChart({ data }: { data: { name: string; reservas: number; ingresos: number }[] }) {
  const hasData = data.some(d => d.reservas > 0 || d.ingresos > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden flex flex-col h-[320px]"
    >
      <div className="flex flex-col mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D0FF14]/20 text-zinc-800 border border-[#D0FF14]/30 uppercase tracking-wider mb-1 w-fit">
          Rendimiento
        </span>
        <h3 className="text-lg font-black text-[#1A1A1A]">Flujo de Reservas y Ventas</h3>
        <p className="text-xs text-zinc-400 font-medium">Historial de citas agendadas por la red StylerNow.</p>
      </div>

      <div className="flex-1 w-full mt-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#a1a1aa" />
              <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#a1a1aa" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                labelStyle={{ fontWeight: 'bold', fontSize: 12 }} 
              />
              <Bar dataKey="reservas" fill="#18181b" radius={[4, 4, 0, 0]} name="Reservas" />
              <Bar dataKey="ingresos" fill="#D0FF14" radius={[4, 4, 0, 0]} name="Ingresos ($)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
            <svg className="w-12 h-12 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <p className="text-xs font-bold">Sin actividad en los últimos 7 días</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
