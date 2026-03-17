'use client';

import React, { useTransition } from 'react';
import { Settings2, Zap, Shield, Sparkles, BarChart, Bot } from 'lucide-react';
import { toggleFeatureAction } from './actions';

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
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

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      const { success, error } = await toggleFeatureAction(id, active);
      if (!success) {
        alert(`Error: ${error}`);
      }
    });
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100">
      {initialFeatures.map((f) => {
        const Icon = iconMap[f.icon] || Settings2;
        return (
          <div key={f.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={`p-3 rounded-xl flex-shrink-0 ${f.active ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#101010] flex items-center gap-2 flex-wrap">
                  {f.name}
                  {f.id === 'inventory' && <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md">BETA</span>}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md break-words">{f.description}</p>
              </div>
            </div>
            
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
          </div>
        )
      })}
    </div>
  );
}
