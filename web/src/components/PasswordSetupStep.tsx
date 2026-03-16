'use client'

import { useState, useTransition } from 'react'
import { setMasterPasswordAction } from '@/app/onboarding/password-actions'
import { Eye, EyeOff, Lock, CheckCircle, ShieldCheck, X } from 'lucide-react'

interface PasswordSetupStepProps {
  onSuccess: () => void
}

function StrengthBar({ password }: { password: string }) {
  const checks = [
    { label: '8+ caracteres', ok: password.length >= 8 },
    { label: 'Mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /[0-9]/.test(password) },
    { label: 'Carácter especial', ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-zinc-200'}`} />
        ))}
      </div>
      {password && (
        <p className={`text-xs font-semibold ${score < 3 ? 'text-red-500' : score < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
          {labels[score - 1] || 'Muy débil'}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5 mt-1">
        {checks.map(c => (
          <span key={c.label} className={`flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.ok ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>
            {c.ok ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function PasswordSetupStep({ onSuccess }: PasswordSetupStepProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isStrong = password.length >= 8
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password)

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      const result = await setMasterPasswordAction(password, confirm)
      if (result.error) { setError(result.error); return }
      onSuccess()
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-black">Crea tu contraseña de acceso</h2>
          <p className="text-xs text-zinc-500">Esta contraseña es solo tuya. Nadie más puede verla.</p>
        </div>
      </div>

      {/* Security note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex gap-2">
        <span className="text-lg">🔐</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          Por seguridad, la contraseña del rol <strong>Master</strong> no puede recuperarse por correo electrónico. 
          Si la olvidas, deberás contactar a soporte StylerNow. <strong>Guárdala en un lugar seguro.</strong>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Password field */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Contraseña *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && <StrengthBar password={password} />}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Confirmar contraseña *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              className={`w-full pl-10 pr-10 py-3 bg-zinc-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                confirm && (confirm === password ? 'border-green-300 bg-green-50' : 'border-red-300')
              } ${!confirm ? 'border-zinc-200' : ''}`}
            />
            <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirm && (
            <p className={`text-xs font-semibold mt-1 ${confirm === password ? 'text-green-600' : 'text-red-500'}`}>
              {confirm === password ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <X className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || !isStrong || password !== confirm}
          className="w-full mt-2 bg-black text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
        >
          {isPending
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando contraseña...</>
            : <><CheckCircle className="w-4 h-4" /> Establecer contraseña y continuar →</>
          }
        </button>
      </div>
    </div>
  )
}
