import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { CreditCard, Award, Zap, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptions() {
  const supabase = await createClient();

  // Obtener barberías con planes reales
  const { data: barberias } = await supabase.from('barberias').select('plan');
  
  const totalBarberias = barberias?.length || 0;
  const studioCount = barberias?.filter(b => b.plan === 'studio').length || 0;
  const prestigeCount = barberias?.filter(b => b.plan === 'prestige').length || 0;
  const basicCount = totalBarberias - studioCount - prestigeCount;

  // Precios mensuales supuestos para MRR (simulado)
  const priceStudio = 15; // USD
  const pricePrestige = 29; // USD
  const mrr = (studioCount * priceStudio) + (prestigeCount * pricePrestige);

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-8 text-[#1A1A1A]">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black">Suscripciones y Planes</h1>
        <p className="text-sm text-zinc-500 font-medium tracking-wide mt-1">
          Análisis de planes activos y rendimiento financiero del modelo SaaS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden shadow-sm">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">MRR Total Estimado</p>
          <h2 className="text-3xl font-black text-[#101010] mb-2">${mrr.toLocaleString()} USD</h2>
          <p className="text-sm font-bold text-green-500">Recurrente Mensual</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Plan Free / Basic</p>
          <h2 className="text-2xl font-black text-[#101010]">{basicCount}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Award className="w-3 h-3 text-blue-500" /> Plan Studio</p>
          <h2 className="text-2xl font-black text-[#101010]">{studioCount}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center border-l-4 border-l-green-500">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Award className="w-3 h-3 text-green-500" /> Plan Prestige</p>
          <h2 className="text-2xl font-black text-[#101010]">{prestigeCount}</h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#101010]" /> Historial de Transacciones (Simulado)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-4 py-3 text-xs font-bold text-zinc-400">Fecha</th>
                <th className="px-4 py-3 text-xs font-bold text-zinc-400">Monto</th>
                <th className="px-4 py-3 text-xs font-bold text-zinc-400">Método</th>
                <th className="px-4 py-3 text-xs font-bold text-zinc-400">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              <tr className="hover:bg-zinc-50">
                <td className="px-4 py-3 text-xs text-zinc-600">Hoy</td>
                <td className="px-4 py-3 text-sm font-bold">$15.00 USD</td>
                <td className="px-4 py-3 text-xs">MercadoPago</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">Completado</span></td>
              </tr>
              <tr className="hover:bg-zinc-50">
                <td className="px-4 py-3 text-xs text-zinc-600">Ayer</td>
                <td className="px-4 py-3 text-sm font-bold">$29.00 USD</td>
                <td className="px-4 py-3 text-xs">Tarjeta de Crédito</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">Completado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
