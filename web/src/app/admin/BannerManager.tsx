'use client'

import { useState, useTransition } from 'react'
import type { PromoBanner } from './banner-actions'
import {
  updateBannerAction,
  deleteBannerAction,
  createBannerAction,
  toggleBannerActiveAction,
} from './banner-actions'
import { Plus, Trash2, Eye, EyeOff, Check, Pencil, X, Megaphone } from 'lucide-react'

interface BannerManagerProps {
  initialBanners: PromoBanner[]
}

const EMPTY_BANNER: Omit<PromoBanner, 'id'> = {
  title: '',
  subtitle: '',
  cta_label: 'Ver Plan',
  cta_url: '/planes',
  bg_color: '#1A1A1A',
  text_color: '#FFFFFF',
  is_active: true,
  sort_order: 0,
  target_plan: 'FREE',
}

export default function BannerManager({ initialBanners }: BannerManagerProps) {
  const [banners, setBanners] = useState<PromoBanner[]>(initialBanners)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<PromoBanner>>({})
  const [creating, setCreating] = useState(false)
  const [newBanner, setNewBanner] = useState<Omit<PromoBanner, 'id'>>(EMPTY_BANNER)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const notify = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000) }

  const startEdit = (banner: PromoBanner) => {
    setEditingId(banner.id)
    setEditDraft({ ...banner })
  }

  const cancelEdit = () => { setEditingId(null); setEditDraft({}) }

  const saveEdit = () => {
    if (!editingId) return
    startTransition(async () => {
      const result = await updateBannerAction(editingId, editDraft)
      if (result.error) { setError(result.error); return }
      setBanners(prev => prev.map(b => b.id === editingId ? { ...b, ...editDraft } : b))
      setEditingId(null)
      notify('Banner actualizado ✓')
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este banner?')) return
    startTransition(async () => {
      const result = await deleteBannerAction(id)
      if (result.error) { setError(result.error); return }
      setBanners(prev => prev.filter(b => b.id !== id))
      notify('Banner eliminado')
    })
  }

  const handleToggle = (banner: PromoBanner) => {
    startTransition(async () => {
      const result = await toggleBannerActiveAction(banner.id, !banner.is_active)
      if (result.error) { setError(result.error); return }
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
    })
  }

  const handleCreate = () => {
    if (!newBanner.title.trim()) { setError('El título es obligatorio.'); return }
    startTransition(async () => {
      const result = await createBannerAction({ ...newBanner, sort_order: banners.length + 1 })
      if (result.error) { setError(result.error); return }
      setCreating(false)
      setNewBanner(EMPTY_BANNER)
      notify('Banner creado ✓')
      // Refresh page to see the new ID
      window.location.reload()
    })
  }

  const PLAN_OPTIONS = ['FREE', 'ESSENTIAL', 'STUDIO', 'PRESTIGE']

  const BannerField = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black" />
    </div>
  )

  const BannerForm = ({
    data, onChange
  }: { data: Partial<PromoBanner | Omit<PromoBanner, 'id'>>; onChange: (key: string, val: string | boolean) => void }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <BannerField label="Título *" value={(data as any).title || ''} onChange={v => onChange('title', v)} />
      </div>
      <div className="sm:col-span-2">
        <BannerField label="Subtítulo" value={(data as any).subtitle || ''} onChange={v => onChange('subtitle', v)} />
      </div>
      <BannerField label="Texto del botón (CTA)" value={(data as any).cta_label || ''} onChange={v => onChange('cta_label', v)} />
      <BannerField label="URL del botón" value={(data as any).cta_url || ''} onChange={v => onChange('cta_url', v)} />
      <BannerField label="URL de imagen (opcional)" value={(data as any).image_url || ''} onChange={v => onChange('image_url', v)} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Plan objetivo</label>
        <select value={(data as any).target_plan || 'FREE'} onChange={e => onChange('target_plan', e.target.value)}
          className="px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black">
          {PLAN_OPTIONS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Color fondo</label>
          <div className="flex items-center gap-2">
            <input type="color" value={(data as any).bg_color || '#1A1A1A'} onChange={e => onChange('bg_color', e.target.value)}
              className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer p-0.5" />
            <span className="text-xs text-zinc-500 font-mono">{(data as any).bg_color}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Color texto</label>
          <div className="flex items-center gap-2">
            <input type="color" value={(data as any).text_color || '#FFFFFF'} onChange={e => onChange('text_color', e.target.value)}
              className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer p-0.5" />
            <span className="text-xs text-zinc-500 font-mono">{(data as any).text_color}</span>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="sm:col-span-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">Vista previa</label>
        <div className="rounded-xl p-4" style={{ backgroundColor: (data as any).bg_color || '#1A1A1A', color: (data as any).text_color || '#FFFFFF' }}>
          <p className="font-bold text-sm">{(data as any).title || 'Título del banner'}</p>
          {(data as any).subtitle && <p className="text-xs opacity-70 mt-1">{(data as any).subtitle}</p>}
          <span className="inline-block mt-2 px-3 py-1 text-xs font-bold rounded-lg" style={{ backgroundColor: (data as any).text_color || '#FFF', color: (data as any).bg_color || '#000' }}>
            {(data as any).cta_label || 'Ver Plan'}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-black" />
          <h2 className="text-lg font-extrabold text-black">Banners Promocionales</h2>
          <span className="bg-zinc-100 text-zinc-600 text-xs font-bold px-2 py-0.5 rounded-full">{banners.length}</span>
        </div>
        <button onClick={() => setCreating(true)} disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-40">
          <Plus className="w-4 h-4" /> Nuevo Banner
        </button>
      </div>

      {/* Messages */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm flex items-center justify-between">
        ⚠️ {error} <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
      </div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm">✓ {success}</div>}

      {/* Create Form */}
      {creating && (
        <div className="bg-white border-2 border-black rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-bold text-black">Nuevo Banner</h3>
          <BannerForm data={newBanner} onChange={(k, v) => setNewBanner(prev => ({ ...prev, [k]: v }))} />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={isPending} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-xl">
              {isPending ? 'Creando...' : 'Crear Banner'}
            </button>
            <button onClick={() => { setCreating(false); setNewBanner(EMPTY_BANNER) }} className="px-4 py-2 bg-zinc-100 text-zinc-600 text-sm font-bold rounded-xl">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Banner List */}
      {banners.length === 0 && !creating && (
        <div className="text-center py-12 text-zinc-400 text-sm">No hay banners. Crea el primero.</div>
      )}

      {banners.map(banner => (
        <div key={banner.id} className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${editingId === banner.id ? 'border-black' : 'border-zinc-200'}`}>
          {/* Banner preview row */}
          <div className="flex items-center gap-3 p-4" style={{ borderLeft: `4px solid ${banner.bg_color}` }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-black truncate">{banner.title}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  {banner.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-500">{banner.target_plan}</span>
              </div>
              {banner.subtitle && <p className="text-xs text-zinc-400 truncate">{banner.subtitle}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => handleToggle(banner)} title={banner.is_active ? 'Desactivar' : 'Activar'}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                {banner.is_active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-zinc-400" />}
              </button>
              <button onClick={() => editingId === banner.id ? cancelEdit() : startEdit(banner)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                {editingId === banner.id ? <X className="w-4 h-4 text-zinc-500" /> : <Pencil className="w-4 h-4 text-zinc-500" />}
              </button>
              <button onClick={() => handleDelete(banner.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Edit form */}
          {editingId === banner.id && (
            <div className="border-t border-zinc-100 p-4 flex flex-col gap-4 bg-zinc-50">
              <BannerForm data={editDraft} onChange={(k, v) => setEditDraft(prev => ({ ...prev, [k]: v }))} />
              <div className="flex gap-2">
                <button onClick={saveEdit} disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded-xl">
                  <Check className="w-4 h-4" /> {isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button onClick={cancelEdit} className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium rounded-xl">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
