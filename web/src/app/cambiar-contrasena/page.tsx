'use client'

import { useState, useTransition } from 'react'
import { setMasterPasswordAction } from '@/app/onboarding/password-actions'
import { Eye, EyeOff, Lock, ShieldCheck, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

function StrengthBar({ password }: { password: string }) {
  const checks = [
    { label: '8+ caracteres', ok: password.length >= 8 },
    { label: 'Mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /[0-9]/.test(password) },
    { label: 'Especial', ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']
  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-zinc-200'}`} />
        ))}
      </div>
      {password && <p className={`text-xs font-bold ${score < 3 ? 'text-red-500' : 'text-green-600'}`}>{labels[score - 1] || ''}</p>}
    </div>
  )
}

export default function CambiarContrasenaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      const result = await setMasterPasswordAction(password, confirm)
      if (result.error) { setError(result.error); return }
      router.push('/dashboard')
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-black">Cambio de contraseña obligatorio</h1>
          <p className="text-zinc-500 text-sm mt-2">El administrador reseteó tu contraseña. Debes crear una nueva para continuar.</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            🔐 Esta contraseña es solo tuya. Ni el administrador ni nadie de StylerNow puede verla una vez guardada.
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nueva contraseña *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && <StrengthBar password={password} />}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Confirmar contraseña *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password" placeholder="Repite la contraseña"
                className={`w-full pl-10 py-3 bg-zinc-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black ${confirm && confirm === password ? 'border-green-300' : confirm ? 'border-red-300' : 'border-zinc-200'}`} />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm font-semibold">⚠️ {error}</p>}

          <button onClick={handleSubmit} disabled={isPending || !isStrong || password !== confirm}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
            {isPending
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
              : <><CheckCircle className="w-4 h-4" /> Guardar nueva contraseña</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
