'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Play } from 'lucide-react'
import { executePromotionAction } from '@/app/dashboard/actions/promotion-actions'
import { useRouter } from 'next/navigation'

interface Props {
  tenantId: string
  logId: string
  promoParams: {
    title: string
    type: string
    value: number
    schedule: string
    target: string
  }
  disabled?: boolean
}

export default function ExecutePromoButton({ tenantId, logId, promoParams, disabled }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await executePromotionAction({
        tenantId,
        logId,
        ...promoParams
      })

      if (res.error) {
         setError(res.error)
      } else {
         setSuccess(true)
         router.refresh()
      }
    } catch (err: any) {
      setError('Excepción de red al ejecutar.')
    } finally {
      setLoading(false)
    }
  }

  if (success || disabled) {
    return (
      <button disabled className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 font-semibold py-2 rounded-xl border border-emerald-500/30">
        <CheckCircle className="w-4 h-4" /> Activada en DB
      </button>
    )
  }

  return (
    <div className="mt-4">
      <button 
        onClick={handleExecute}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl border border-indigo-400 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        Auto-Ejecutar Promoción
      </button>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  )
}
