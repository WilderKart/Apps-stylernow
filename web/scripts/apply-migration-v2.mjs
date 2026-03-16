// apply-migration-v2.mjs – uses Supabase REST API to run raw SQL
// node scripts/apply-migration-v2.mjs

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmFhb3l3cXNmYXB4YXRubGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4ODQ5MCwiZXhwIjoyMDg5MjY0NDkwfQ.gKNRsO-JZQAmOH4KpUbTOOb6m39tQxw38yYUoDoa4f4'
const SUPABASE_URL = 'https://povaaoywqsfapxatnleu.supabase.co'
const DB_URL = `${SUPABASE_URL}/rest/v1/`

async function sql(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_raw`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  })
  const text = await res.text()
  if (!res.ok && !text.includes('already exists') && !text.includes('duplicate')) {
    // try alternative endpoint
    return { error: text }
  }
  return { ok: true }
}

// Use Supabase management API (pg endpoint)
const PROJECT_ID = 'povaaoywqsfapxatnleu'

async function runSQL(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  })
  const text = await res.text()
  return { ok: res.ok, text }
}

const migrations = [
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
  `CREATE TABLE IF NOT EXISTS public.colombia_holidays (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name TEXT NOT NULL
  )`,
  `INSERT INTO public.colombia_holidays (date, name) VALUES
    ('2025-01-01','Año Nuevo'),('2025-01-06','Reyes Magos'),('2025-03-24','San José'),
    ('2025-04-17','Jueves Santo'),('2025-04-18','Viernes Santo'),('2025-05-01','Día del Trabajo'),
    ('2025-07-20','Día de la Independencia'),('2025-08-07','Batalla de Boyacá'),
    ('2025-10-13','Día de la Raza'),('2025-11-17','Independencia de Cartagena'),
    ('2025-12-08','Inmaculada Concepción'),('2025-12-25','Navidad'),
    ('2026-01-01','Año Nuevo'),('2026-04-02','Jueves Santo'),('2026-04-03','Viernes Santo'),
    ('2026-05-01','Día del Trabajo'),('2026-07-20','Día de la Independencia'),
    ('2026-08-07','Batalla de Boyacá'),('2026-12-08','Inmaculada Concepción'),('2026-12-25','Navidad')
  ON CONFLICT (date) DO NOTHING`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_id UUID`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS tenant_id UUID`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS staff_id UUID`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_id UUID`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_name TEXT`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_phone TEXT`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS end_at TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS price NUMERIC(10,2)`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes TEXT`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'app'`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS cancelled_reason TEXT`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()`,
  `ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.colombia_holidays ENABLE ROW LEVEL SECURITY`,
]

async function run() {
  console.log('Applying migrations...')
  for (const m of migrations) {
    const { ok, text } = await runSQL(m)
    const preview = m.slice(0, 60).replace(/\s+/g, ' ')
    console.log(`${ok ? '✅' : '⚠️'} [${preview}...] ${ok ? '' : text?.slice(0,120)}`)
  }

  // Try add RLS policies
  const policies = [
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='colombia_holidays' AND policyname='Public reads holidays') THEN CREATE POLICY "Public reads holidays" ON public.colombia_holidays FOR SELECT USING (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='schedules' AND policyname='Public reads schedules') THEN CREATE POLICY "Public reads schedules" ON public.schedules FOR SELECT USING (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_blocks' AND policyname='Public reads time blocks') THEN CREATE POLICY "Public reads time blocks" ON public.time_blocks FOR SELECT USING (true); END IF; END $$`,
  ]
  for (const p of policies) {
    const { ok, text } = await runSQL(p)
    console.log(`${ok ? '✅' : '⚠️'} Policy: ${ok ? 'OK' : text?.slice(0,100)}`)
  }
  console.log('Done!')
}

run().catch(console.error)
