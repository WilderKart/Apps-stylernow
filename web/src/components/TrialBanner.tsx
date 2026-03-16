'use client';

import { AlertTriangle, X, Zap } from 'lucide-react';
import { useState } from 'react';

interface TrialBannerProps {
  daysLeft: number;
  reservationsUsed: number;
  clientsUsed: number;
}

export default function TrialBanner({ daysLeft, reservationsUsed, clientsUsed }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const isUrgent = daysLeft <= 2;
  const reservationsPct = Math.round((reservationsUsed / 30) * 100);
  const clientsPct = Math.round((clientsUsed / 20) * 100);

  return (
    <div className={`rounded-2xl p-4 border mb-4 ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isUrgent ? 'bg-red-100' : 'bg-amber-100'}`}>
            {isUrgent ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Zap className="w-5 h-5 text-amber-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${isUrgent ? 'text-red-800' : 'text-amber-800'}`}>
              {isUrgent ? `⚠️ Tu prueba termina en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}` : `Prueba gratuita — ${daysLeft} días restantes`}
            </p>
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-700">Reservas</span>
                  <span className="font-semibold text-amber-800">{reservationsUsed}/30</span>
                </div>
                <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${reservationsPct}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-700">Clientes</span>
                  <span className="font-semibold text-amber-800">{clientsUsed}/20</span>
                </div>
                <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${clientsPct}%` }} />
                </div>
              </div>
            </div>
            <a href="/planes" className={`inline-block mt-3 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${isUrgent ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>
              Activar Plan →
            </a>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-zinc-400 hover:text-zinc-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
