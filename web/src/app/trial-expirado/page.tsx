import { Zap, Crown, Star, CheckCircle, AlertTriangle } from 'lucide-react';

const PLANS = [
  { id: 'ESSENTIAL', name: 'Essential', price: 79900, icon: Zap, features: ['Hasta 3 barberos', 'Agenda digital', 'Email & Push', '1 sede'] },
  { id: 'STUDIO', name: 'Studio', price: 129900, icon: Star, features: ['Todo en Essential', 'Comisiones', 'Promociones', 'Inventario'], isHighlight: true },
  { id: 'PRESTIGE', name: 'Prestige', price: 199900, icon: Crown, features: ['Todo en Studio', 'Multi sede', 'IA Marketing', 'Marketplace'] },
];

export default function TrialExpiredPage() {
  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Alert banner */}
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-10">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-red-900 mb-2">Tu prueba gratuita terminó.</h1>
        <p className="text-red-700 text-sm">Para seguir usando StylerNow elige un plan y continúa sin perder tus datos.</p>
      </div>

      <p className="text-sm font-semibold text-zinc-500 mb-6 uppercase tracking-wide">Elige tu plan para continuar</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className={`rounded-2xl border-2 p-6 flex flex-col bg-white transition-all ${plan.isHighlight ? 'border-black shadow-xl' : 'border-zinc-200'}`}>
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-zinc-700" />
              </div>
              <h2 className="text-lg font-extrabold text-black mb-1">{plan.name}</h2>
              <p className="text-2xl font-black text-black mb-3">
                ${plan.price.toLocaleString('es-CO')}<span className="text-sm font-normal text-zinc-400">/mes</span>
              </p>
              <ul className="flex flex-col gap-2 mb-5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-zinc-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/planes" className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-colors block ${
                plan.isHighlight ? 'bg-black text-white hover:bg-zinc-800' : 'bg-zinc-100 text-black hover:bg-zinc-200'
              }`}>
                Elegir {plan.name}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
