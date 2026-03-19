'use client'

import { useState } from 'react'
import { Sparkles, Loader2, FileText, Download } from 'lucide-react'
import { analyzeBusiness } from '@/app/actions/ai-consultant'
import { KpiData } from '@/app/dashboard/actions/kpi-actions'
import ReactMarkdown from 'react-markdown'

export default function AIBusinessButton({ kpiData }: { kpiData: KpiData }) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    setOpen(true)
    const result = await analyzeBusiness(kpiData)
    if (result.error) {
      setReport(`**Error:** ${result.error}`)
    } else {
      setReport(result.report || 'Sin diagnóstico')
    }
    setLoading(false)
  }

  // Descargar Reporte en .TXT o .MD
  const handleDownload = () => {
    if (!report) return
    const element = document.createElement("a");
    const file = new Blob([report], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "Reporte_Integral_Growth.md";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  return (
    <>
      <button 
        onClick={handleAnalyze}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg transition-transform active:scale-95"
      >
        <Sparkles className="w-5 h-5" />
        Analizar Negocio con IA
      </button>

      {/* Modal Modal del Reporte de IA */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-purple-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-purple-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Consultor IA StylerNow</h2>
                  <p className="text-sm text-purple-600 font-medium">Análisis de Growth Estratégico</p>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-white rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gray-50/30 prose prose-purple max-w-none">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-purple-600">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-lg font-medium animate-pulse">Analizando tus métricas y elaborando diagnóstico...</p>
                </div>
              ) : (
                <div className="text-gray-800 leading-relaxed space-y-4">
                  <ReactMarkdown>{report || ''}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && report && (
               <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Reporte
                  </button>
                  <button 
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Cerrar Asesoramiento
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
