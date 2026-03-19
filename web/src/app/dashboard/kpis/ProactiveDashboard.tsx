'use client'

import { useState, useEffect } from 'react'
import { getProactiveAIInsights } from '../actions/proactive-ai'
import { Activity, AlertTriangle, ArrowRight, ArrowUpRight, CheckCircle2, CopyPlus, Info, Loader2, Sparkles, TrendingUp, Presentation } from 'lucide-react'

interface ProactiveAIProps {
  tenantId: string
}

export default function ProactiveDashboard({ tenantId }: ProactiveAIProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    async function load() {
      const res = await getProactiveAIInsights(tenantId)
      if (res.error) {
        setError(res.error)
      } else {
        setData(res.data)
      }
      setLoading(false)
    }
    load()
  }, [tenantId])

  if (loading) {
    return (
      <div className="bg-white/50 backdrop-blur border border-emerald-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] mb-8 animate-pulse">
        <Sparkles className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-800">El Asesor IA está evaluando tu barbería...</h3>
        <p className="text-gray-500 mt-2">Calculando deltas de ingresos, ocupación histórica y fechas clave.</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-3xl p-8 mb-8 text-red-600">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <h3 className="text-lg font-bold">Error al generar Insights</h3>
        <p>{error || 'No se pudo contactar con Gemini.'}</p>
      </div>
    )
  }

  const { score, status, summary, insights, opportunities, promotions } = data;

  const getStatusColor = (s: string) => {
    if (s === 'success') return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (s === 'warning') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <div className="space-y-8 mb-12">
      
      {/* 🔝 HEADER: Score de Salud y Status */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Activity className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              IA Growth Engine (Proactivo)
            </div>
            <h2 className="text-3xl font-extrabold mb-2">{summary}</h2>
            <p className="text-gray-300">Análisis basado en tus métricas diarias vs la semana y mes pasado.</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur min-w-[180px]">
            <span className="text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wider">Business Score</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-6xl font-black ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {score}
              </span>
              <span className="text-xl text-gray-500 font-medium">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚨 BLOQUE IA: Alertas y Oportunidades (TOP 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Insights -> Problemas y advertencias */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><AlertTriangle className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-gray-900">Puntos de Fricción</h3>
          </div>
          <div className="space-y-4">
            {insights?.slice(0, 3).map((ins: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-200 transition-colors">
                <p className="font-bold text-gray-900 mb-1">{ins.title}</p>
                <p className="text-sm text-gray-600 mb-3"><span className="font-semibold text-gray-800">Causa:</span> {ins.cause} <br/> <span className="font-semibold text-gray-800">Impacto:</span> <span className="text-red-600 font-medium">{ins.impact}</span></p>
                <div className="flex flex-wrap gap-2">
                  {ins.actions?.map((act: string, i: number) => (
                    <button key={i} className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
                      🚀 {act}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!insights || insights.length === 0 && <p className="text-gray-500 italic p-4">La IA no detectó problemas críticos relevantes hoy.</p>}
          </div>
        </div>

        {/* Oportunidades y Promociones Dinámicas */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-24 h-24 text-emerald-600" /></div>
           <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><TrendingUp className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-gray-900">Promociones IA (Smart)</h3>
          </div>
          <div className="space-y-4 relative z-10">
             {promotions?.slice(0, 2).map((promo: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-emerald-900">{promo.title}</p>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider rounded-md">Recomendado</span>
                </div>
                <p className="text-sm text-emerald-700 mb-3"><span className="font-semibold text-emerald-800">Objetivo:</span> {promo.target} <br/> <span className="font-semibold text-emerald-800">Retorno Esperado:</span> {promo.expectedReturn}</p>
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  <CopyPlus className="w-4 h-4" />
                  Activar Promoción
                </button>
              </div>
            ))}
             {!promotions || promotions.length === 0 && <p className="text-gray-500 italic p-4">No hay sugerencias estacionales para hoy.</p>}
          </div>
        </div>

      </div>

      <div className="flex items-center justify-center py-6 border-b border-gray-100">
         <div className="flex flex-col items-center">
             <p className="text-xs text-gray-400 mt-2">Fin del Reporte Integral B2B</p>
         </div>
      </div>
    </div>
  )
}
