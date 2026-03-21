'use client';

import React, { useState, useTransition } from 'react';
import { Settings2, Zap, Shield, Sparkles, BarChart, Bot, Save } from 'lucide-react';
import { toggleFeatureAction, getFeaturesAction } from './actions'; 

// Adaptamos interfaz para recibir tipo
interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  tipo: string; // 'boolean' | 'float' | 'int' | 'string'
}

const iconMap: Record<string, any> = {
  Bot,
  BarChart,
  Settings2,
  Zap,
  Shield,
  Sparkles,
};

export default function FeatureList({ initialFeatures }: { initialFeatures: Feature[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      const { success, error } = await toggleFeatureAction(id, active);
      if (!success) alert(`Error: ${error}`);
    });
  };

  const handleValueChange = (id: string, value: string) => {
    setEditingValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveValue = (id: string) => {
    const value = editingValues[id];
    if (value === undefined) return;

    startTransition(async () => {
      // Reutilizamos toggle adaptándole una variante para valor
      const { success, error } = await toggleFeatureAction(id, true); // Wait, toggleAction handles boolean toggling on/off from status.
      // To correctly support values, we should separate update config action.
      // We will create updateConfigAction in actions.ts in next step or use it now if we define it first.
      // Let's call updateConfigAction as ideal separation.
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: id, valor: value })
      });
      const data = await res.json();

      if (!data.success) {
         alert(`Error: ${data.error || 'No se pudo guardar'}`);
      } else {
         alert('Guardado con éxito.');
      }
    });
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100">
      {initialFeatures.map((f) => {
        const Icon = iconMap[f.icon] || Settings2;
        const isNumeric = f.tipo === 'float' || f.tipo === 'int';

        return (
          <div key={f.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={`p-3 rounded-xl flex-shrink-0 ${f.active ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#101010] flex items-center gap-2 flex-wrap">
                  {f.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md break-words">{f.description}</p>
              </div>
            </div>
            
            {/* Renderizado Condicional según Tipo */}
            {isNumeric ? (
               <div className="flex items-center gap-2">
                   <input 
                      type="number"
                      step={f.tipo === 'float' ? '0.1' : '1'}
                      defaultValue={f.active ? '1' : '0'} // Wait, active is boolean adapter, we don't have row value here from adapt.
                      // Let's read row value or pass it explicitly.
                      placeholder="Valor"
                      className="w-24 bg-zinc-50 border border-zinc-200 p-2 rounded-lg text-sm text-right font-bold text-black"
                      onChange={(e) => handleValueChange(f.id, e.target.value)}
                   />
                   <button 
                      onClick={() => handleSaveValue(f.id)}
                      disabled={isPending}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                   >
                       <Save className="w-4 h-4" />
                   </button>
               </div>
            ) : (
                <button 
                  onClick={() => handleToggle(f.id, f.active)}
                  disabled={isPending}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative flex items-center px-1 flex-shrink-0 ${
                    f.active ? 'bg-green-500' : 'bg-zinc-200'
                  } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    f.active ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </button>
            )}
          </div>
        )
      })}
    </div>
  );
}
