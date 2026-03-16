// Appointment & Agenda types — StylerNow

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  tenant_id: string
  staff_id?: string
  client_id?: string
  service_id?: string
  client_name?: string
  client_phone?: string
  start_at: string // ISO
  end_at: string   // ISO
  duration_minutes: number
  price?: number
  status: AppointmentStatus
  notes?: string
  source?: 'app' | 'walk_in' | 'phone' | 'admin'
  cancelled_reason?: string
  confirmed_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  // joins
  service?: { name: string; category: string }
  staff?: { first_name: string; last_name: string }
}

export interface Schedule {
  id: string
  tenant_id: string
  staff_id?: string
  day_of_week: number // 0 Sun, 1 Mon … 6 Sat
  open_time: string   // 'HH:MM'
  close_time: string  // 'HH:MM'
  is_open: boolean
}

export interface TimeBlock {
  id: string
  tenant_id: string
  staff_id?: string
  title: string
  start_at: string
  end_at: string
  reason?: string
  is_holiday: boolean
}

export interface ColombiaHoliday {
  date: string // 'YYYY-MM-DD'
  name: string
}

export type CalendarView = 'day' | 'week' | 'month'
