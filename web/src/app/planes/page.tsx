import { Zap, Crown, Star, CheckCircle } from 'lucide-react';

const PLANS = [
  {
    id: 'ESSENTIAL',
    name: 'Essential',
    price: 79900,
    icon: Zap,
    color: 'bg-zinc-100',
    iconColor: 'text-zinc-600',
    features: ['Hasta 3 barberos', 'Agenda digital', 'Email & Push notifs', 'App móvil', '1 sede'],
  },
  {
    id: 'STUDIO',
    name: 'Studio',
    price: 129900,
    icon: Star,
    color: 'bg-zinc-900',
    iconColor: 'text-white',
    badge: 'Más popular',
    features: ['Todo en Essential', 'Comisiones', 'Promociones', 'Inventario', 'Estadísticas'],
    isHighlight: true,
  },
  {
    id: 'PRESTIGE',
    name: 'Prestige',
    price: 199900,
    icon: Crown,
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
    features: ['Todo en Studio', 'Multi sede', 'IA Marketing', 'Marketplace', 'Stats avanzadas'],
  },
];

export default function PlanesPage() {
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10 max-w-lg">
        <h1 className="text-4xl font-extrabold text-black tracking-tight mb-3">Elige tu plan</h1>
        <p className="text-zinc-500 text-base">
          Sin contratos. Sin tarifa de instalación. Cancela cuando quieras.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all ${plan.isHighlight ? 'border-black shadow-xl shadow-black/10 scale-[1.02]' : 'border-zinc-200'}`}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className={`w-10 h-10 ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${plan.iconColor}`} />
              </div>
              <h2 className="text-lg font-extrabold text-black mb-1">{plan.name}</h2>
              <p className="text-3xl font-black text-black mb-1">
                ${plan.price.toLocaleString('es-CO')}
                <span className="text-sm font-normal text-zinc-400">/mes</span>
              </p>
              <p className="text-xs text-zinc-400 mb-4">COP · Facturación mensual</p>
              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                plan.isHighlight ? 'bg-black text-white hover:bg-zinc-800' : 'bg-zinc-100 text-black hover:bg-zinc-200'
              }`}>
                Elegir {plan.name}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-400 mt-8 text-center">
        Los pagos se procesan con Mercado Pago. Al contratar, aceptas nuestros Términos y Condiciones.
      </p>
    </div>
  );
}
