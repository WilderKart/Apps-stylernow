import React from 'react';
import { DollarSign, Eye, RefreshCw, Users, TrendingUp } from 'lucide-react';
import { fetchAllBannersAction } from './banner-actions';
import BannerManager from './BannerManager';

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  let banners: Awaited<ReturnType<typeof fetchAllBannersAction>>['banners'] = []
  try {
    const result = await fetchAllBannersAction()
    banners = result.banners ?? []
  } catch (_) { /* non-blocking */ }


  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto text-[#1A1A1A]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">SaaS Command Center</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide mt-2">
            Control de ingresos, nuevas barberías y salud del sistema StylerNow.
          </p>
        </div>
      </div>

      {/* MRR & Finance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden shadow-sm">
           <div className="absolute top-0 right-0 p-4">
             <DollarSign className="w-8 h-8 text-green-500/20" />
           </div>
           <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Monthly Recurring Revenue</p>
           <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] mb-2">$8.450</h2>
           <p className="text-sm font-bold text-green-500 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +12% este mes</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden shadow-sm">
           <div className="absolute top-0 right-0 p-4">
             <Users className="w-8 h-8 text-zinc-300" />
           </div>
           <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Barberías Activas (Tenants)</p>
           <h2 className="text-4xl font-extrabold text-[#1A1A1A] mb-2">142</h2>
           <p className="text-sm font-bold text-zinc-500">12 en plan Trial (14 días)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden shadow-sm">
           <div className="absolute top-0 right-0 p-4">
             <RefreshCw className="w-8 h-8 text-zinc-300" />
           </div>
           <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Volumen Reservas (Diario)</p>
           <h2 className="text-4xl font-extrabold text-[#1A1A1A] mb-2">3k+</h2>
           <p className="text-sm font-bold text-green-500 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> 99.9% Success Rate</p>
        </div>

      </div>

      {/* Recents Tenants Table */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Últimas Barberías Suscritas</h3>
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm min-w-[800px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">ID Barbería</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Nombre</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Plan Actual</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Estado Facturación</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              
              <tr className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-zinc-500">b_01HX..4K</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">The Gentlemen's Club</p>
                  <p className="text-xs text-zinc-500">contacto@gentlemens.com</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#b08d57]/10 text-[#b08d57] border border-[#b08d57]/30 uppercase tracking-wider">PRESTIGE</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Pagado (MercadoPago)</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-bold text-zinc-500 hover:text-black transition-colors flex items-center gap-1 ml-auto">
                    Ver Detalles <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-zinc-500">b_05MX..2P</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">Urban Kings Barber</p>
                  <p className="text-xs text-zinc-500">admin@urbankings.com</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 uppercase tracking-wider">STUDIO</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-yellow-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Trial Activo (3 días restantes)</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-bold text-zinc-500 hover:text-black transition-colors flex items-center gap-1 ml-auto">
                    Ver Detalles <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
      {/* Banner Manager Section */}
      <div className="mt-8 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <BannerManager initialBanners={banners} />
      </div>

    </div>
  );
}
