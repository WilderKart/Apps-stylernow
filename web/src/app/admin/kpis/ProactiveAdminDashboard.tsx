'use client'

import { useState, useEffect } from 'react'
import { getProactiveAdminInsights } from '../actions/proactive-ai-admin'
import { Activity, AlertTriangle, Presentation, Sparkles, TrendingUp, Download } from 'lucide-react'
import AIAdminButton from '@/components/AIAdminButton'

export default function ProactiveAdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    async function load() {
      const res = await getProactiveAdminInsights()
      if (res.error) {
        setError(res.error)
      } else {
        setData(res.data)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="bg-white/50 backdrop-blur border border-blue-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] mb-8 animate-pulse">
        <Sparkles className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Cargando Estrategia B2B Global...</h3>
        <p className="text-gray-500 mt-2">Analizando funnels de adopción y retención de tenants a nivel mundial.</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-3xl p-8 mb-8 text-red-600">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <h3 className="text-lg font-bold">Error Generativo B2B</h3>
        <p>{error}</p>
      </div>
    )
  }

  const { score, summary, insights, promotions } = data;

  return (
    <div className="space-y-8 mb-12">
      {/* HEADER B2B SAAS */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Activity className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 text-blue-300" />
              SaaS Growth Director (Proactivo)
            </div>
            <h2 className="text-3xl font-extrabold mb-2">{summary}</h2>
            <p className="text-indigo-200">Revisión profunda del modelo de adquisición y retención (MRR).</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur min-w-[180px]">
            <span className="text-indigo-200 text-sm font-semibold mb-1 uppercase tracking-wider">Health Score Global</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-6xl font-black ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {score}
              </span>
              <span className="text-xl text-indigo-400 font-medium">/100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* INSIGHTS B2B */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><AlertTriangle className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-gray-900">Cuellos de Botella (SaaS)</h3>
          </div>
          <div className="space-y-4">
            {insights?.slice(0, 3).map((ins: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-200 transition-colors">
                <p className="font-bold text-gray-900 mb-1">{ins.title}</p>
                <p className="text-sm text-gray-600 mb-3"><span className="font-semibold text-gray-800">Causa Raíz:</span> {ins.cause} <br/> <span className="font-semibold text-gray-800">Impacto MRR:</span> <span className="text-red-600 font-medium">{ins.impact}</span></p>
                <div className="flex flex-wrap gap-2">
                  {ins.actions?.map((act: string, i: number) => (
                    <button key={i} className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-indigo-700 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 font-bold transition-colors">
                      🛠 {act}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!insights || insights.length === 0 && <p className="text-gray-500 italic p-4">La IA no detectó riesgos en el Churn global.</p>}
          </div>
        </div>

        {/* ESTRATEGIAS DE ACTIVACIÓN B2B */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-24 h-24 text-blue-600" /></div>
           <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><TrendingUp className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-gray-900">Campañas de Activación IA</h3>
          </div>
          <div className="space-y-4 relative z-10">
             {promotions?.slice(0, 2).map((promo: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-blue-900">{promo.title}</p>
                  <span className="px-2 py-1 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider rounded-md">Estrategia</span>
                </div>
                <p className="text-sm text-blue-800 mb-3"><span className="font-bold">Target:</span> {promo.target} <br/> <span className="font-bold">Retorno MRR Estimado:</span> {promo.expectedReturn}</p>
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Desplegar Campaña Global
                </button>
              </div>
            ))}
             {!promotions || promotions.length === 0 && <p className="text-gray-500 italic p-4">No hay campañas urgentes recomendadas hoy.</p>}
          </div>
        </div>

      </div>

      <div className="flex items-center justify-center py-6 border-b border-gray-100">
         <div className="flex flex-col items-center">
             <AIAdminButton adminData={{}} />
             <p className="text-xs text-gray-400 mt-2">Profundizar en análisis de IA a Texto Largo (Chat IA)</p>
         </div>
      </div>
    </div>
  )
}
