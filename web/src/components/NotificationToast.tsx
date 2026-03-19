'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

interface NotificationToastProps {
  type: 'error' | 'success' | 'info'
  title: string
  message: string
  duration?: number // en ms, default 5000
  onClose: () => void
}

export default function NotificationToast({
  type,
  title,
  message,
  duration = 5000,
  onClose
}: NotificationToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining <= 0) {
        clearInterval(timer)
        onClose()
      }
    }, 10) // fluido
    
    return () => clearInterval(timer)
  }, [duration, onClose])

  const config = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      bar: 'bg-red-500'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      bar: 'bg-green-500'
    },
    info: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <Info className="w-5 h-5 text-amber-500" />,
      bar: 'bg-amber-500' // mostaza/naranja solicitado
    }
  }[type]

  // Para errores, el usuario prefiere color "naranja/mostaza" o "anaranjado"
  const barColor = type === 'error' ? 'bg-amber-500' : config.bar;

  return (
    <div className={`fixed top-4 right-4 z-50 w-full max-w-sm rounded-xl border shadow-lg overflow-hidden transition-all duration-300 transform translate-y-0 ${config.bg} ${config.border}`}>
      {/* Barra de progreso superior */}
      <div className="h-1 bg-zinc-200 w-full absolute top-0 left-0">
        <div 
          className={`h-full ${barColor} transition-all ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 pt-5 flex gap-3 items-start relative">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <p className={`text-sm font-bold ${config.text}`}>{title}</p>
          <p className={`text-xs mt-0.5 opacity-90 ${config.text}`}>{message}</p>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
