// run: node scripts/apply-migration.mjs
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://povaaoywqsfapxatnleu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmFhb3l3cXNmYXB4YXRubGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4ODQ5MCwiZXhwIjoyMDg5MjY0NDkwfQ.gKNRsO-JZQAmOH4KpUbTOOb6m39tQxw38yYUoDoa4f4'
)

async function run() {
  const statements = [
    // schedules table
    `CREATE TABLE IF NOT EXISTS public.schedules (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
      staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
      day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      open_time TIME NOT NULL DEFAULT '09:00',
      close_time TIME NOT NULL DEFAULT '18:00',
      is_open BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(tenant_id, staff_id, day_of_week)
    )`,
    // time_blocks table
    `CREATE TABLE IF NOT EXISTS public.time_blocks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
      staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'Bloqueo',
      start_at TIMESTAMP WITH TIME ZONE NOT NULL,
      end_at TIMESTAMP WITH TIME ZONE NOT NULL,
      reason TEXT,
      is_holiday BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`,
    // colombia_holidays table
    `CREATE TABLE IF NOT EXISTS public.colombia_holidays (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      name TEXT NOT NULL
    )`,
    // holidays data 2025-2026
    `INSERT INTO public.colombia_holidays (date, name) VALUES
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
    ON CONFLICT (date) DO NOTHING`,
    // Appointments extra columns  
    `ALTER TABLE public.appointments
      ADD COLUMN IF NOT EXISTS service_id UUID,
      ADD COLUMN IF NOT EXISTS tenant_id UUID,
      ADD COLUMN IF NOT EXISTS staff_id UUID,
      ADD COLUMN IF NOT EXISTS client_id UUID,
      ADD COLUMN IF NOT EXISTS client_name TEXT,
      ADD COLUMN IF NOT EXISTS client_phone TEXT,
      ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS end_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
      ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'app',
      ADD COLUMN IF NOT EXISTS cancelled_reason TEXT,
      ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    // Ensure status column exists with correct values
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='status') THEN
        ALTER TABLE public.appointments ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
      END IF;
    END $$`,
    // RLS schedules
    `ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='schedules' AND policyname='Public reads schedules') THEN
        EXECUTE 'CREATE POLICY "Public reads schedules" ON public.schedules FOR SELECT USING (true)';
      END IF;
    END $$`,
    // RLS time_blocks
    `ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_blocks' AND policyname='Public reads time blocks') THEN
        EXECUTE 'CREATE POLICY "Public reads time blocks" ON public.time_blocks FOR SELECT USING (true)';
      END IF;
    END $$`,
    // RLS holidays
    `ALTER TABLE public.colombia_holidays ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='colombia_holidays' AND policyname='Public reads holidays') THEN
        EXECUTE 'CREATE POLICY "Public reads holidays" ON public.colombia_holidays FOR SELECT USING (true)';
      END IF;
    END $$`,
    // RLS appointments  
    `ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='appointments' AND policyname='Anyone books appointment') THEN
        EXECUTE 'CREATE POLICY "Anyone books appointment" ON public.appointments FOR INSERT WITH CHECK (true)';
      END IF;
    END $$`,
    // indexes
    `CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON public.appointments(tenant_id, start_at)`,
    `CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_id, start_at)`,
    `CREATE INDEX IF NOT EXISTS idx_schedules_tenant ON public.schedules(tenant_id, day_of_week)`,
  ]

  for (const sql of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: 'rpc not available' }))
    // Fallback: use raw query via REST
    const res = await fetch(`https://povaaoywqsfapxatnleu.supabase.co/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmFhb3l3cXNmYXB4YXRubGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4ODQ5MCwiZXhwIjoyMDg5MjY0NDkwfQ.gKNRsO-JZQAmOH4KpUbTOOb6m39tQxw38yYUoDoa4f4',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmFhb3l3cXNmYXB4YXRubGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4ODQ5MCwiZXhwIjoyMDg5MjY0NDkwfQ.gKNRsO-JZQAmOH4KpUbTOOb6m39tQxw38yYUoDoa4f4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql })
    })
    const text = await res.text().catch(() => '')
    console.log(`SQL [${sql.slice(0,50)}...]: ${res.ok ? '✅' : '❌'} ${text.slice(0,100)}`)
  }
  console.log('Migration script complete')
}

run().catch(console.error)
