'use client'

import { useState, useTransition } from 'react'
import { createPasswordSupportTicketAction } from '@/app/onboarding/password-actions'
import { Mail, MessageCircle, ShieldAlert, CheckCircle, ChevronDown } from 'lucide-react'

type ContactMethod = 'email' | 'chat' | null

export default function SoporteContrasenaPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [method, setMethod] = useState<ContactMethod>(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSendTicket = () => {
    if (!email.trim() || !message.trim()) { setError('Completa todos los campos.'); return }
    setError(null)
    startTransition(async () => {
      const result = await createPasswordSupportTicketAction(email, message)
      if (result.error) { setError(result.error); return }
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-black">Ticket enviado ✓</h1>
          <p className="text-zinc-500 text-sm mt-2 mb-6">
            El equipo de soporte de StylerNow recibirá tu solicitud y te contactará en las próximas <strong>2-4 horas</strong> según tu plan.
          </p>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 text-left mb-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">Tiempos de respuesta por plan</p>
            <div className="flex flex-col gap-2">
              {[['Prueba Gratuita', '24-48 horas', 'text-zinc-500'], ['Essential', '8-12 horas', 'text-blue-600'], ['Studio', '2-4 horas', 'text-indigo-600'], ['Prestige', '< 1 hora', 'text-black font-bold']].map(([plan, time, cls]) => (
                <div key={plan as string} className="flex justify-between text-sm">
                  <span className="text-zinc-700">{plan as string}</span>
                  <span className={cls as string}>{time as string}</span>
                </div>
              ))}
            </div>
          </div>
          <a href="/ingresar" className="block text-sm font-semibold text-zinc-500 hover:text-black transition-colors">
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-black">¿Olvidaste tu contraseña?</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">
            Por seguridad, el rol <strong>Master</strong> no permite reset automático. Contacta soporte para que validen tu identidad.
          </p>
        </div>

        {/* Why no self-service */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
          <span className="text-xl">🔐</span>
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>¿Por qué no puedo recuperarla por email?</strong><br />
            Cualquiera que conozca tu correo podría solicitar un reset y acceder a tu barbería. El reset por soporte garantiza que eres tú quien solicita el cambio.
          </div>
        </div>

        {/* Method selector */}
        {!method && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => setMethod('email')}
              className="flex flex-col items-center gap-3 bg-white border-2 border-zinc-200 rounded-2xl p-5 hover:border-black transition-all group">
              <Mail className="w-7 h-7 text-zinc-400 group-hover:text-black transition-colors" />
              <div className="text-center">
                <p className="text-sm font-bold text-black">Enviar email</p>
                <p className="text-xs text-zinc-400">Respuesta en 2-48h</p>
              </div>
            </button>
            <button onClick={() => setMethod('chat')}
              className="flex flex-col items-center gap-3 bg-black border-2 border-black rounded-2xl p-5 hover:bg-zinc-800 transition-all">
              <MessageCircle className="w-7 h-7 text-white" />
              <div className="text-center">
                <p className="text-sm font-bold text-white">Chat en vivo</p>
                <p className="text-xs text-zinc-400">Disponible L-V 8am-6pm</p>
              </div>
            </button>
          </div>
        )}

        {/* Email support form */}
        {method === 'email' && (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-black">Solicitud de reset por email</h2>
              <button onClick={() => setMethod(null)} className="text-xs text-zinc-400 hover:text-zinc-600 underline">Cambiar método</button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Tu correo de registro *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@tubarberia.com"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Cuéntanos más *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Ej: Soy el dueño de BarberKing en Bogotá, olvidé mi contraseña. Mi teléfono de registro es 300..."
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
              <p className="text-xs text-zinc-400 mt-1">Incluye información para verificar tu identidad (nombre de la barbería, teléfono registrado, etc.)</p>
            </div>
            {error && <p className="text-red-600 text-sm">⚠️ {error}</p>}
            <button onClick={handleSendTicket} disabled={isPending}
              className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-zinc-800 transition-colors">
              {isPending ? 'Enviando...' : 'Enviar solicitud de soporte →'}
            </button>
          </div>
        )}

        {/* Chat redirect */}
        {method === 'chat' && (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-black">Chat con soporte</h2>
              <button onClick={() => setMethod(null)} className="text-xs text-zinc-400 hover:text-zinc-600 underline">Cambiar método</button>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 text-center flex flex-col gap-3">
              <MessageCircle className="w-10 h-10 text-black mx-auto" />
              <p className="text-sm text-zinc-600">El chat en vivo está disponible de <strong>Lunes a Viernes, 8am – 6pm</strong> (hora Colombia).</p>
              <a
                href="https://wa.me/573001234567?text=Hola%2C+necesito+ayuda+para+restablecer+mi+contraseña+de+Master+en+StylerNow"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                💬 Abrir WhatsApp de soporte
              </a>
              <p className="text-xs text-zinc-400">Si no hay disponibilidad, deja un mensaje y te responderemos a la brevedad.</p>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <a href="/ingresar" className="text-sm text-zinc-400 hover:text-black transition-colors font-medium">
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  )
}
