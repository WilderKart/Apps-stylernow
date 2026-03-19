'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import TenantDetailsModal from './TenantDetailsModal'

interface Props {
  recentTenants: any[]
}

export default function AdminTenantList({ recentTenants }: Props) {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)

  return (
    <>
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
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1.5 ">
                        <span className={`w-2 h-2 rounded-full ${b.activa ? 'bg-green-500' : 'bg-yellow-500'}`}></span> 
                        {b.activa ? 'Aprobada (Activa)' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedTenantId(b.id)}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 mb-0 ml-auto"
                      >
                        Auditar <Eye className="w-4 h-4" />
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

      {selectedTenantId && (
        <TenantDetailsModal 
          tenantId={selectedTenantId} 
          onClose={() => setSelectedTenantId(null)} 
        />
      )}
    </>
  )
}
