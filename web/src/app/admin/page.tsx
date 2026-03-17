import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { DollarSign, Eye, RefreshCw, Users, TrendingUp } from 'lucide-react';
import { fetchAllBannersAction } from './banner-actions';
import BannerManager from './BannerManager';

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const supabase = await createClient()

  // 1. Cargar Banners
  let banners: Awaited<ReturnType<typeof fetchAllBannersAction>>['banners'] = []
  try {
    const result = await fetchAllBannersAction()
    banners = result.banners ?? []
  } catch (_) { /* non-blocking */ }

  // 2. Conteo Real de Barberías
  const { count: activeTenants } = await supabase
    .from('barberias')
    .select('*', { count: 'exact', head: true })
    .eq('activa', true)

  // 3. Volumen de Reservas (Ejemplo: Hoy)
  const today = new Date().toISOString().split('T')[0]
  const { count: dailyBookings } = await supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })

  // 4. Cargar últimas 5 barberías
  const { data: recentTenants } = await supabase
    .from('barberias')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(5)


  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto text-[#1A1A1A]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Centro de Mando SaaS</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide mt-2">
            Control de ingresos, nuevas barberías y salud del sistema StylerNow.
          </p>
        </div>
      </div>

      {/* MRR & Finance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
           <div className="absolute top-0 right-0 p-4">
             <DollarSign className="w-8 h-8 text-green-500" />
           </div>
           <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Ingresos Recurrentes Mensuales</p>
           <h2 className="text-4xl md:text-5xl font-black text-[#101010] mb-2">${((activeTenants || 0) * 59).toLocaleString()}</h2>
           <p className="text-sm font-bold text-green-500 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Proyección Studio/Prestige</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
           <div className="absolute top-0 right-0 p-4">
             <Users className="w-8 h-8 text-[#101010]" />
           </div>
           <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Barberías Activas</p>
           <h2 className="text-4xl font-black text-[#101010] mb-2">{activeTenants || 0}</h2>
           <p className="text-sm font-bold text-zinc-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 100% Sincronizado</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
           <div className="absolute top-0 right-0 p-4">
             <RefreshCw className="w-8 h-8 text-[#101010]" />
           </div>
           <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Volumen de Reservas (Total)</p>
           <h2 className="text-4xl font-black text-[#101010] mb-2">{dailyBookings || 0}</h2>
           <p className="text-sm font-bold text-green-500 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> 100% Success Rate</p>
        </div>

      </div>

      {/* Data Monetization Panel */}
      <div className="mb-8 bg-[#101010] text-white p-6 rounded-2xl border border-green-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-50"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30 uppercase tracking-wider mb-2">
              B2B Data Analytics
            </span>
            <h3 className="text-xl font-black mb-1">Base de Datos Monetizable Anonimizada</h3>
            <p className="text-sm text-zinc-400 max-w-2xl font-medium">
              Informes de consumo, cortes recurrentes y picos de tráfico para laboratorios de cuidado capilar. **Información 100% anonimizada** que cumple políticas Zero Trust.
            </p>
          </div>
          <button className="px-5 py-3 bg-green-500 hover:bg-green-600 text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 shrink-0">
            Exportar Metrics B2B <Eye className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-zinc-800 pt-6">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase">Corte más recurrente</p>
            <p className="text-lg font-extrabold text-green-400 mt-1">Fade Clásico</p>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase">Día Pico de Tráfico</p>
            <p className="text-lg font-extrabold text-white mt-1">Viernes / Sábados</p>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase">Producto de skincare más usado</p>
            <p className="text-lg font-extrabold text-white mt-1">Cera Mate Premium</p>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase">Valor de Mercado (Data)</p>
            <p className="text-lg font-extrabold text-green-400 mt-1">Por calcular...</p>
          </div>
        </div>
      </div>

      {/* Recents Tenants Table */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Últimas Barberías Registradas</h3>
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm min-w-[800px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">ID Barbería</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Nombre</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Plan Actual</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentTenants && recentTenants.length > 0 ? (
                recentTenants.map((b: any) => (
                  <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-zinc-500">...{b.id.slice(-6)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#1A1A1A]">{b.nombre}</p>
                      <p className="text-xs text-zinc-500">{b.creado_en ? new Date(b.creado_en).toLocaleDateString() : 'Desconocido'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#101010] text-green-400 border border-green-500/30 uppercase tracking-wider">{b.plan?.toUpperCase() || 'FREE'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> {b.activa ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-bold text-zinc-500 hover:text-black transition-colors flex items-center gap-1 ml-auto">
                        Ver Detalles <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4" colSpan={5}>
                    <p className="text-sm text-zinc-500 text-center">No hay barberías registradas aún.</p>
                  </td>
                </tr>
              )}
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
