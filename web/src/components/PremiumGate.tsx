import { Lock } from 'lucide-react';
import { PREMIUM_FEATURES_INFO } from '@/types';

interface PremiumGateProps {
  feature: string;
  children?: React.ReactNode;
}

export default function PremiumGate({ feature, children }: PremiumGateProps) {
  const info = PREMIUM_FEATURES_INFO[feature];

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred content behind */}
      <div className="filter blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-zinc-500" />
        </div>
        <p className="text-sm font-bold text-black mb-1">
          {info?.label || 'Función Premium'} bloqueada
        </p>
        <p className="text-xs text-zinc-500 mb-4">
          Desbloquea <span className="font-semibold text-black">{info?.label}</span> con el plan{' '}
          <span className="inline-block bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">{info?.plan || 'STUDIO'}</span>
        </p>
        <a href="/planes" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors">
          Ver planes →
        </a>
      </div>
    </div>
  );
}
