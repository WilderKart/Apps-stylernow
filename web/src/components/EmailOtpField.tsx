'use client'

import { useState, useTransition } from 'react'
import { sendEmailOtpAction, verifyEmailOtpAction } from '@/app/onboarding/otp-actions'
import { CheckCircle, Mail, Loader2 } from 'lucide-react'

interface EmailOtpFieldProps {
  onVerified: (email: string) => void
  defaultEmail?: string
}

export default function EmailOtpField({ onVerified, defaultEmail = '' }: EmailOtpFieldProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSending, startSend] = useTransition()
  const [isVerifying, startVerify] = useTransition()

  const REASON_MESSAGES: Record<string, string> = {
    wrong_code: 'Código incorrecto. Revisa tu correo.',
    expired: 'El código expiró. Solicita uno nuevo.',
    too_many_attempts: 'Demasiados intentos. Solicita un nuevo código.',
    not_found: 'No hay código activo para este correo.',
  }

  const handleSend = () => {
    if (!email.trim() || !email.includes('@')) { setError('Ingresa un correo válido.'); return }
    setError(null)
    startSend(async () => {
      const result = await sendEmailOtpAction(email)
      if (result.error) { setError(result.error); return }
      setCodeSent(true)
    })
  }

  const handleResend = () => {
    setCode('')
    setCodeSent(false)
    setTimeout(handleSend, 100)
  }

  const handleVerify = () => {
    if (code.length !== 6) { setError('El código debe tener 6 dígitos.'); return }
    setError(null)
    startVerify(async () => {
      const result = await verifyEmailOtpAction(email, code)
      if (!result.valid) {
        setError(REASON_MESSAGES[result.reason || ''] || 'Código inválido.')
        return
      }
      setVerified(true)
      onVerified(email)
    })
  }

  if (verified) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-green-800">Correo verificado ✓</p>
          <p className="text-xs text-green-600">{email}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-sm font-semibold text-zinc-700">
        Correo de contacto de la barbería *
      </label>

      {/* Email input + Send button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setCodeSent(false); setCode('') }}
            disabled={codeSent}
            placeholder="contacto@tubarberia.com"
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60"
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || codeSent}
          className={`px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            codeSent ? 'bg-zinc-100 text-zinc-400 cursor-default' : 'bg-black text-white hover:bg-zinc-800'
          } disabled:opacity-50`}
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : codeSent ? 'Enviado ✓' : 'Verificar'}
        </button>
      </div>

      {/* OTP input */}
      {codeSent && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">📬</span>
            <div>
              <p className="text-sm font-bold text-blue-800">Revisa tu correo</p>
              <p className="text-xs text-blue-600">Hemos enviado un código de 6 dígitos a <strong>{email}</strong>. Expira en 15 min.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="flex-1 px-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-center text-xl font-mono font-black tracking-widest focus:outline-none focus:border-black transition-colors"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || code.length !== 6}
              className="px-5 py-3 bg-black text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-zinc-800 transition-colors"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
            </button>
          </div>

          <button type="button" onClick={handleResend} className="text-xs text-zinc-400 hover:text-zinc-600 text-left underline underline-offset-2">
            ¿No recibiste el código? Reenviar
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}
