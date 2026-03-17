import React from 'react';
import { Settings2 } from 'lucide-react';
import { getFeaturesAction } from './actions';
import FeatureList from './FeatureList';

export const dynamic = 'force-dynamic';

export default async function AdminFeatures() {
  const features = await getFeaturesAction();

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-8 text-[#1A1A1A]">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <Settings2 className="w-8 h-8 text-[#101010]" /> Activar Funciones (Feature Toggles)
        </h1>
        <p className="text-sm text-zinc-500 font-medium tracking-wide mt-1">
          Habilita o deshabilita módulos del SaaS de forma global para todos los tenants (Datos en Base de Datos).
        </p>
      </div>

      <FeatureList initialFeatures={features} />
    </div>
  );
}
