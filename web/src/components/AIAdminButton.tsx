'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Download } from 'lucide-react'
import { analyzeGlobalBusiness } from '@/app/actions/ai-consultant'
import ReactMarkdown from 'react-markdown'

export default function AIAdminButton({ adminData }: { adminData: any }) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    setOpen(true)
    const result = await analyzeGlobalBusiness(adminData)
    if (result.error) {
      setReport(`**Error:** ${result.error}`)
    } else {
      setReport(result.report || 'Sin diagnóstico')
    }
    setLoading(false)
  }

  const handleDownload = () => {
    if (!report) return
    const element = document.createElement("a");
    const file = new Blob([report], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "Reporte_Admin_SaaS_Growth.md";
    document.body.appendChild(element);
    element.click();
  }

  return (
    <>
      <button 
        onClick={handleAnalyze}
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg transition-transform active:scale-95"
      >
        <Sparkles className="w-5 h-5" />
        Analizar SaaS con IA
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Consultor B2B SaaS StylerNow</h2>
                  <p className="text-sm text-emerald-600 font-medium">Análisis de Adquisición y Retención</p>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-white rounded-full p-2"
              >✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gray-50/30 prose prose-emerald max-w-none">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-emerald-600">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-lg font-medium animate-pulse">Analizando tus métricas globales y estructurando un plan de crecimiento...</p>
                </div>
              ) : (
                <div className="text-gray-800 leading-relaxed space-y-4">
                  <ReactMarkdown>{report || ''}</ReactMarkdown>
                </div>
              )}
            </div>

            {!loading && report && (
               <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Reporte
                  </button>
                  <button 
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800"
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
