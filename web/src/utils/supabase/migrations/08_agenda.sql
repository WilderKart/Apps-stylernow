-- ═══════════════════════════════════════════════════════════════
-- 08_agenda.sql – Agenda & Reservas completa
-- Run in Supabase SQL Editor if MCP apply_migration fails
-- ═══════════════════════════════════════════════════════════════

-- Schedules: weekly operating hours per barber / per tenant
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '18:00',
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, staff_id, day_of_week)
);

-- Time blocks: vacations, breaks, manual closures
CREATE TABLE IF NOT EXISTS public.time_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Bloqueo',
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  is_holiday BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Colombia public holidays 2025-2026
CREATE TABLE IF NOT EXISTS public.colombia_holidays (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL
);

INSERT INTO public.colombia_holidays (date, name) VALUES
  ('2025-01-01','Año Nuevo'),('2025-01-06','Reyes Magos'),('2025-03-24','San José'),
  ('2025-04-17','Jueves Santo'),('2025-04-18','Viernes Santo'),('2025-05-01','Día del Trabajo'),
  ('2025-06-02','Ascensión del Señor'),('2025-06-23','Corpus Christi'),('2025-06-30','Sagrado Corazón'),
  ('2025-07-04','San Pedro y Pablo'),('2025-07-20','Día de la Independencia'),('2025-08-07','Batalla de Boyacá'),
  ('2025-08-18','Asunción de la Virgen'),('2025-10-13','Día de la Raza'),('2025-11-03','Todos los Santos'),
  ('2025-11-17','Independencia de Cartagena'),('2025-12-08','Inmaculada Concepción'),('2025-12-25','Navidad'),
  ('2026-01-01','Año Nuevo'),('2026-01-12','Reyes Magos'),('2026-03-23','San José'),
  ('2026-04-02','Jueves Santo'),('2026-04-03','Viernes Santo'),('2026-05-01','Día del Trabajo'),
  ('2026-05-18','Ascensión del Señor'),('2026-06-08','Corpus Christi'),('2026-06-15','Sagrado Corazón'),
  ('2026-06-29','San Pedro y Pablo'),('2026-07-20','Día de la Independencia'),('2026-08-07','Batalla de Boyacá'),
  ('2026-08-17','Asunción de la Virgen'),('2026-10-12','Día de la Raza'),('2026-11-02','Todos los Santos'),
  ('2026-11-16','Independencia de Cartagena'),('2026-12-08','Inmaculada Concepción'),('2026-12-25','Navidad')
ON CONFLICT (date) DO NOTHING;

-- Enrich appointments table
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id),
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
  ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id),
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT,
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS end_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled','no_show')),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'app',
  ADD COLUMN IF NOT EXISTS cancelled_reason TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colombia_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads holidays" ON public.colombia_holidays FOR SELECT USING (true);
CREATE POLICY "Public reads schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Master manages schedules" ON public.schedules FOR ALL USING (
  tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
  OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('SUPERADMIN','MANAGER')
);
CREATE POLICY "Public reads time blocks" ON public.time_blocks FOR SELECT USING (true);
CREATE POLICY "Master manages time blocks" ON public.time_blocks FOR ALL USING (
  tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
  OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('SUPERADMIN','MANAGER')
);
CREATE POLICY "Tenant staff sees appointments" ON public.appointments FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.staff WHERE user_id = auth.uid()
    UNION SELECT id FROM public.tenants WHERE owner_id = auth.uid()
  )
  OR client_id = auth.uid()
  OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'SUPERADMIN'
);
CREATE POLICY "Anyone books appointment" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Tenant updates appointment" ON public.appointments FOR UPDATE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.staff WHERE user_id = auth.uid()
    UNION SELECT id FROM public.tenants WHERE owner_id = auth.uid()
  ) OR client_id = auth.uid()
);

-- Trigger + indexes
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON public.appointments(tenant_id, start_at);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_id, start_at);
CREATE INDEX IF NOT EXISTS idx_schedules_tenant ON public.schedules(tenant_id, day_of_week);
