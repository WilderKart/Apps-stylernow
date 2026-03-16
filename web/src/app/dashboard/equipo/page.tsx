import React from 'react';
import { UserPlus, Search, Edit3, Trash2, Shield, Scissors } from 'lucide-react';

export default function EquipoDashboard() {
  return (
    <div className="flex flex-col w-full h-full p-8 max-w-7xl mx-auto">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Equipo</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide mt-1">
            Gestiona a tus barberos, roles, horarios y permisos.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition-colors shadow-lg">
            <UserPlus className="w-4 h-4" /> Nuevo Profesional
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o rol..."
              className="w-full bg-white text-sm font-medium pl-9 pr-4 py-2 rounded-lg border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select className="bg-white border border-zinc-200 text-sm font-bold text-black rounded-lg px-3 py-2 outline-none cursor-pointer">
              <option>Todos los Roles</option>
              <option>Master</option>
              <option>Manager</option>
              <option>Barbero (Pro)</option>
              <option>Barbero (Artesano)</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-white">
                <th className="px-6 py-4 text-xs font-extrabold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Profesional</th>
                <th className="px-6 py-4 text-xs font-extrabold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Rol & Nivel</th>
                <th className="px-6 py-4 text-xs font-extrabold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Comisión</th>
                <th className="px-6 py-4 text-xs font-extrabold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Servicios</th>
                <th className="px-6 py-4 text-xs font-extrabold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Estado</th>
                <th className="px-6 py-4 text-xs font-extrabold text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              
              {/* Row 1 */}
              <tr className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-xs text-black">
                      DS
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">David S.</p>
                      <p className="text-xs text-zinc-500">david@stylernow.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-800 text-white shadow-sm">
                    <Shield className="w-3 h-3 text-zinc-300" /> Barbero Pro
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-black border border-zinc-200 rounded px-2 py-1">60% / 40%</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1"><Scissors className="w-3 h-3" /> 12 Especialidades</span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Activo
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-xs text-black">
                      PM
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">Pablo M.</p>
                      <p className="text-xs text-zinc-500">pablo@stylernow.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#b08d57] text-white shadow-sm">
                    <Shield className="w-3 h-3 text-white/50" /> Barbero Artesano
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-black border border-zinc-200 rounded px-2 py-1">50% / 50%</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1"><Scissors className="w-3 h-3" /> 8 Especialidades</span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Activo
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
