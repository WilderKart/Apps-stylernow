'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock, User,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, MoreHorizontal
} from 'lucide-react'
import { useAgendaRealtime } from '@/hooks/useAgendaRealtime'
import { updateAppointmentStatusAction, createWalkInAction } from './actions'
import type { CalendarView, Appointment, AppointmentStatus, ColombiaHoliday } from '@/types/agenda'

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:     { label: 'Pendiente',     color: 'text-amber-700',   bg: 'bg-amber-100',  icon: AlertCircle },
  confirmed:   { label: 'Confirmada',    color: 'text-blue-700',    bg: 'bg-blue-100',   icon: CheckCircle },
  in_progress: { label: 'En progreso',   color: 'text-indigo-700',  bg: 'bg-indigo-100', icon: RefreshCw },
  completed:   { label: 'Completada',    color: 'text-green-700',   bg: 'bg-green-100',  icon: CheckCircle },
  cancelled:   { label: 'Cancelada',     color: 'text-red-700',     bg: 'bg-red-100',    icon: XCircle },
  no_show:     { label: 'No asistió',    color: 'text-zinc-500',    bg: 'bg-zinc-100',   icon: XCircle },
}

// ── Helpers ──────────────────────────────────────────────────────
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am – 8pm

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}
function sameDay(a: Date, b: Date) {
  return isoDate(a) === isoDate(b)
}
function timeStr(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  )
}

// ── Appointment Card ─────────────────────────────────────────────
function AppCard({ apt, onStatusChange, compact = false }: { apt: Appointment; onStatusChange: (id: string, s: AppointmentStatus) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[apt.status]

  return (
    <div className={`relative ${cfg.bg} border border-${cfg.color.split('-')[1]}-200 rounded-lg overflow-hidden cursor-pointer group transition-all hover:shadow-sm`}
      onClick={() => setOpen(v => !v)}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bg.replace('bg-', 'bg-').replace('-100', '-400')}`} />
      <div className="pl-3 pr-2 py-1.5">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-[11px] font-bold truncate ${cfg.color}`}>{timeStr(apt.start_at)}</span>
          {!compact && <StatusBadge status={apt.status} />}
        </div>
        <p className={`text-xs font-semibold text-zinc-800 truncate ${compact ? 'text-[10px]' : ''}`}>
          {apt.client_name || 'Cliente'}
        </p>
        {!compact && apt.service && (
          <p className="text-[10px] text-zinc-500 truncate">{(apt.service as any).name}</p>
        )}
      </div>

      {/* Expanded Actions */}
      {open && (
        <div className="border-t border-zinc-200 bg-white px-3 py-2 flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
          {(['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as AppointmentStatus[]).map(s => s !== apt.status && (
            <button key={s} onClick={() => { onStatusChange(apt.id, s); setOpen(false) }}
              className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} hover:opacity-80`}>
              → {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Day View ─────────────────────────────────────────────────────
function DayView({ date, appointments, onStatusChange }: { date: Date; appointments: Appointment[]; onStatusChange: (id: string, s: AppointmentStatus) => void }) {
  const dayApts = appointments.filter(a => sameDay(new Date(a.start_at), date))

  return (
    <div className="flex flex-col divide-y divide-zinc-100 overflow-auto max-h-[70vh]">
      {HOURS.map(h => {
        const hourApts = dayApts.filter(a => new Date(a.start_at).getHours() === h)
        return (
          <div key={h} className="flex min-h-[60px]">
            <div className="w-14 flex-shrink-0 pt-2 text-right pr-3 text-xs text-zinc-400 font-medium select-none">
              {h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`}
            </div>
            <div className="flex-1 border-l border-zinc-100 pl-2 py-1 flex flex-col gap-1">
              {hourApts.map(apt => <AppCard key={apt.id} apt={apt} onStatusChange={onStatusChange} />)}
            </div>
          </div>
        )
      })}
      {dayApts.length === 0 && (
        <div className="text-center py-12 text-zinc-400 text-sm">Sin reservas para este día</div>
      )}
    </div>
  )
}

// ── Week View ────────────────────────────────────────────────────
function WeekView({ startDate, appointments, onStatusChange }: { startDate: Date; appointments: Appointment[]; onStatusChange: (id: string, s: AppointmentStatus) => void }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate); d.setDate(startDate.getDate() + i); return d
  })

  return (
    <div className="overflow-auto max-h-[70vh]">
      <div className="grid grid-cols-8 min-w-[640px]">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10" />
        {days.map(d => (
          <div key={d.toISOString()} className="sticky top-0 bg-white z-10 text-center py-2 border-b border-zinc-200">
            <p className="text-[10px] text-zinc-400 font-semibold">{DAYS_ES[d.getDay()]}</p>
            <p className={`text-sm font-bold ${sameDay(d, new Date()) ? 'text-black bg-black text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto' : 'text-zinc-700'}`}>{d.getDate()}</p>
          </div>
        ))}

        {/* Grid body */}
        {HOURS.map(h => (
          <>
            <div key={`h-${h}`} className="w-14 text-right pr-2 pt-1 text-[10px] text-zinc-400 border-t border-zinc-100">{h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`}</div>
            {days.map(d => {
              const apts = appointments.filter(a => new Date(a.start_at).getHours() === h && sameDay(new Date(a.start_at), d))
              return (
                <div key={d.toISOString() + h} className="border-t border-l border-zinc-100 min-h-[50px] p-0.5 flex flex-col gap-0.5">
                  {apts.map(a => <AppCard key={a.id} apt={a} onStatusChange={onStatusChange} compact />)}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

// ── Month View ───────────────────────────────────────────────────
function MonthView({ year, month, appointments, holidays, onStatusChange, onDayClick }: {
  year: number; month: number; appointments: Appointment[]; holidays: ColombiaHoliday[]
  onStatusChange: (id: string, s: AppointmentStatus) => void; onDayClick: (d: Date) => void
}) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const holidaySet = new Set(holidays.map(h => h.date))
  const holidayMap = new Map(holidays.map(h => [h.date, h.name]))
  const today = new Date()

  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1))
  ]

  return (
    <div className="overflow-auto">
      <div className="grid grid-cols-7 text-center mb-1">
        {DAYS_ES.map(d => <div key={d} className="text-[10px] font-bold text-zinc-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />
          const ds = isoDate(d)
          const dayApts = appointments.filter(a => isoDate(new Date(a.start_at)) === ds)
          const isToday = sameDay(d, today)
          const isHoliday = holidaySet.has(ds)
          const isSunday = d.getDay() === 0
          return (
            <button key={ds} onClick={() => onDayClick(d)}
              className={`relative text-left rounded-lg p-1 min-h-[70px] border transition-all hover:border-black hover:shadow-sm ${isToday ? 'border-black bg-black/5' : 'border-transparent'} ${isHoliday ? 'bg-red-50' : ''} ${isSunday ? 'opacity-60' : ''}`}>
              <span className={`text-xs font-bold block mb-0.5 ${isToday ? 'text-black bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]' : isHoliday ? 'text-red-600' : 'text-zinc-700'}`}>
                {d.getDate()}
              </span>
              {isHoliday && <span className="text-[8px] text-red-500 font-semibold leading-tight block truncate">{holidayMap.get(ds)}</span>}
              <div className="flex flex-col gap-0.5 mt-0.5">
                {dayApts.slice(0, 3).map(a => (
                  <div key={a.id} className={`text-[9px] font-semibold px-1 rounded truncate ${STATUS_CONFIG[a.status].bg} ${STATUS_CONFIG[a.status].color}`}>
                    {timeStr(a.start_at)} {a.client_name}
                  </div>
                ))}
                {dayApts.length > 3 && <span className="text-[9px] text-zinc-400 px-1">+{dayApts.length - 3} más</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── New Appointment Modal ─────────────────────────────────────────
interface NewAptForm { client_name: string; client_phone: string; date: string; time: string; duration: string; price: string; notes: string }
function NewAppointmentModal({ tenantId, preDate, onClose, onCreated }: { tenantId: string; preDate?: Date; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<NewAptForm>({
    client_name: '', client_phone: '',
    date: preDate ? isoDate(preDate) : isoDate(new Date()),
    time: '09:00', duration: '30', price: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof NewAptForm, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.client_name.trim()) { setError('Ingresa el nombre del cliente.'); return }
    setSaving(true); setError(null)
    const start_at = `${form.date}T${form.time}:00`
    const result = await createWalkInAction({
      tenant_id: tenantId, client_name: form.client_name, client_phone: form.client_phone,
      start_at, duration_minutes: parseInt(form.duration), price: form.price ? parseFloat(form.price) : undefined,
      notes: form.notes
    })
    setSaving(false)
    if (result.error) { setError(result.error); return }
    onCreated(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Nueva reserva</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-black transition-colors"><XCircle className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="text-xs font-semibold text-zinc-600 mb-1 block">Nombre del cliente *</label>
            <input value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Juan Pérez" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" /></div>
          <div className="col-span-2"><label className="text-xs font-semibold text-zinc-600 mb-1 block">Teléfono</label>
            <input value={form.client_phone} onChange={e => set('client_phone', e.target.value)} placeholder="+57 300..." className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" /></div>
          <div><label className="text-xs font-semibold text-zinc-600 mb-1 block">Fecha</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" /></div>
          <div><label className="text-xs font-semibold text-zinc-600 mb-1 block">Hora</label>
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" /></div>
          <div><label className="text-xs font-semibold text-zinc-600 mb-1 block">Duración (min)</label>
            <select value={form.duration} onChange={e => set('duration', e.target.value)} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black">
              {[15,20,30,45,60,90,120].map(m => <option key={m} value={m}>{m} min</option>)}
            </select></div>
          <div><label className="text-xs font-semibold text-zinc-600 mb-1 block">Precio (COP)</label>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="35000" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" /></div>
          <div className="col-span-2"><label className="text-xs font-semibold text-zinc-600 mb-1 block">Notas</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" /></div>
        </div>
        {error && <p className="text-red-600 text-xs">⚠️ {error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-zinc-800 transition-colors">
            {saving ? 'Guardando...' : 'Crear reserva'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Agenda Client ───────────────────────────────────────────
interface AgendaClientProps {
  tenantId: string
  holidays: ColombiaHoliday[]
}

export default function AgendaClient({ tenantId, holidays }: AgendaClientProps) {
  const [view, setView] = useState<CalendarView>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNew, setShowNew] = useState(false)
  const [preDate, setPreDate] = useState<Date | undefined>()

  // Compute date range for current view
  const { from, to } = useMemo(() => {
    const d = currentDate
    if (view === 'day') {
      const s = new Date(d); s.setHours(0,0,0,0)
      const e = new Date(d); e.setHours(23,59,59,999)
      return { from: s.toISOString(), to: e.toISOString() }
    }
    if (view === 'week') {
      const startOfWeek = new Date(d)
      startOfWeek.setDate(d.getDate() - d.getDay())
      startOfWeek.setHours(0,0,0,0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23,59,59,999)
      return { from: startOfWeek.toISOString(), to: endOfWeek.toISOString() }
    }
    // month
    const s = new Date(d.getFullYear(), d.getMonth(), 1)
    const e = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    return { from: s.toISOString(), to: e.toISOString() }
  }, [view, currentDate])

  const { appointments, loading, reload } = useAgendaRealtime(tenantId, from, to)

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await updateAppointmentStatusAction(id, status)
    reload()
  }

  const navigate = (dir: 1 | -1) => {
    setCurrentDate(prev => {
      const d = new Date(prev)
      if (view === 'day') d.setDate(d.getDate() + dir)
      else if (view === 'week') d.setDate(d.getDate() + 7 * dir)
      else d.setMonth(d.getMonth() + dir)
      return d
    })
  }

  const headerLabel = useMemo(() => {
    if (view === 'day') return currentDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (view === 'week') {
      const s = new Date(currentDate); s.setDate(currentDate.getDate() - currentDate.getDay())
      const e = new Date(s); e.setDate(s.getDate() + 6)
      return `${s.getDate()} ${MONTHS_ES[s.getMonth()].slice(0,3)} – ${e.getDate()} ${MONTHS_ES[e.getMonth()].slice(0,3)} ${e.getFullYear()}`
    }
    return `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }, [view, currentDate])

  const todayHoliday = holidays.find(h => h.date === isoDate(new Date()))
  const weekStart = useMemo(() => {
    const s = new Date(currentDate); s.setDate(currentDate.getDate() - currentDate.getDay()); return s
  }, [currentDate])

  return (
    <div className="flex flex-col h-full gap-4 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
            {(['day','week','month'] as CalendarView[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-black'}`}>
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"><ChevronLeft className="w-4 h-4"/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">Hoy</button>
            <button onClick={() => navigate(1)} className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"><ChevronRight className="w-4 h-4"/></button>
          </div>
          <span className="text-sm font-bold text-black capitalize hidden sm:block">{headerLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />}
          <span className="text-xs text-zinc-400 font-medium hidden sm:block">{appointments.length} reservas</span>
          <button onClick={() => { setPreDate(undefined); setShowNew(true) }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors">
            <Plus className="w-4 h-4" /> Nueva reserva
          </button>
        </div>
      </div>

      {/* Holiday banner */}
      {todayHoliday && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-700 font-semibold flex items-center gap-2">
          🇨🇴 Hoy es festivo: <strong>{todayHoliday.name}</strong>
        </div>
      )}

      {/* Calendar views */}
      <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4">
          {view === 'day' && <DayView date={currentDate} appointments={appointments} onStatusChange={handleStatusChange} />}
          {view === 'week' && <WeekView startDate={weekStart} appointments={appointments} onStatusChange={handleStatusChange} />}
          {view === 'month' && (
            <MonthView year={currentDate.getFullYear()} month={currentDate.getMonth()}
              appointments={appointments} holidays={holidays}
              onStatusChange={handleStatusChange}
              onDayClick={d => { setCurrentDate(d); setView('day') }} />
          )}
        </div>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-2 px-1">
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <div key={k} className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.bg} ${v.color}`}>
            <v.icon className="w-3 h-3" /> {v.label}
          </div>
        ))}
      </div>

      {/* New appointment modal */}
      {showNew && (
        <NewAppointmentModal tenantId={tenantId} preDate={preDate} onClose={() => setShowNew(false)} onCreated={reload} />
      )}
    </div>
  )
}
