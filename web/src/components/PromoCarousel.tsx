'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, Zap } from 'lucide-react'

interface PromoBanner {
  id: string
  title: string
  subtitle?: string
  cta_label: string
  cta_url: string
  image_url?: string
  bg_color: string
  text_color: string
}

const DEFAULT_BANNERS: PromoBanner[] = [
  {
    id: '1', title: '🚀 Multiplica tus ingresos con Studio',
    subtitle: 'Comisiones automáticas, inventario y estadísticas para crecer.',
    cta_label: 'Activar Studio', cta_url: '/planes',
    bg_color: '#1A1A1A', text_color: '#FFFFFF',
  },
  {
    id: '2', title: '📊 ¿Cuánto gana cada barbero?',
    subtitle: 'Con Studio ves reportes por barbero, día y servicio en tiempo real.',
    cta_label: 'Ver Estadísticas', cta_url: '/planes',
    bg_color: '#111827', text_color: '#FFFFFF',
  },
  {
    id: '3', title: '🎯 Crea promociones que convierten',
    subtitle: 'Quincena, San Valentín, Hot Sale. Impulsa tu barbería con Studio.',
    cta_label: 'Desbloquear Promociones', cta_url: '/planes',
    bg_color: '#0F172A', text_color: '#FFFFFF',
  },
  {
    id: '4', title: '👑 IA de Marketing en PRESTIGE',
    subtitle: 'Genera textos e ideas de campaña con inteligencia artificial.',
    cta_label: 'Conocer Prestige', cta_url: '/planes',
    bg_color: '#1C1917', text_color: '#FFFFFF',
  },
]

interface PromoCarouselProps {
  banners?: PromoBanner[]
  autoPlayMs?: number
}

export default function PromoCarousel({ banners = DEFAULT_BANNERS, autoPlayMs = 5000 }: PromoCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const total = banners.length

  useEffect(() => {
    if (dismissed || isPaused) { if (intervalRef.current) clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % total)
    }, autoPlayMs)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [dismissed, isPaused, total, autoPlayMs])

  if (dismissed || total === 0) return null

  const banner = banners[current]

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-sm mb-4 transition-all duration-500"
      style={{ backgroundColor: banner.bg_color, color: banner.text_color }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background image if present */}
      {banner.image_url && (
        <div className="absolute inset-0">
          <img src={banner.image_url} alt="" className="w-full h-full object-cover opacity-20" />
        </div>
      )}

      <div className="relative z-10 p-5 pr-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-5 h-5" style={{ color: banner.text_color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold leading-tight">{banner.title}</p>
              {banner.subtitle && (
                <p className="text-xs opacity-70 mt-1 leading-relaxed">{banner.subtitle}</p>
              )}
              <a
                href={banner.cta_url}
                className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: banner.text_color, color: banner.bg_color }}
              >
                {banner.cta_label} →
              </a>
            </div>
          </div>
        </div>

        {/* Dots + Navigation */}
        {total > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1.5">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="transition-all rounded-full"
                  style={{ width: i === current ? 20 : 6, height: 6, backgroundColor: i === current ? banner.text_color : `${banner.text_color}40` }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setCurrent(p => (p - 1 + total) % total)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: `${banner.text_color}20` }}>
                <ChevronLeft className="w-4 h-4" style={{ color: banner.text_color }} />
              </button>
              <button onClick={() => setCurrent(p => (p + 1) % total)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: `${banner.text_color}20` }}>
                <ChevronRight className="w-4 h-4" style={{ color: banner.text_color }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Close button */}
      <button onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: `${banner.text_color}20` }}>
        <X className="w-3.5 h-3.5" style={{ color: banner.text_color }} />
      </button>
    </div>
  )
}
