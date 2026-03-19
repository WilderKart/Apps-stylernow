const { Client } = require('pg');

const sql = `
-- ==========================================
-- 🛡️ HARDENING ULTIMATE V8 — STYLERNOW
-- ==========================================

--------------------------------------------
-- 📋 1. CARGA DE PERMISOS GLOBALES
--------------------------------------------
INSERT INTO permissions (name) VALUES
  ('bookings.read'),
  ('bookings.create'),
  ('bookings.update'),
  ('bookings.cancel'),
  ('schedules.read'),
  ('schedules.update'),
  ('earnings.read'),
  ('staff.create'),
  ('staff.update'),
  ('staff.delete')
ON CONFLICT (name) DO NOTHING;

-- Asociar a owner y manager
INSERT INTO role_permissions (role, permission)
SELECT 'owner', name FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission)
SELECT 'manager', name FROM permissions
WHERE name IN ('bookings.read', 'bookings.create', 'bookings.update', 'bookings.cancel', 'schedules.read', 'schedules.update', 'earnings.read')
ON CONFLICT DO NOTHING;

--------------------------------------------
-- ⏳ 2. RATE LIMITING (BASE DE DATOS)
--------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ip_address TEXT,
  action_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en Rate Limits (solo lectura de admins)
ALTER TABLE rate_limit_hits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read rate limits" ON rate_limit_hits 
  FOR SELECT TO authenticated USING (auth.uid() IN (SELECT id FROM users WHERE role = 'founder'));

-- Función de Validación de Rate Limit
CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID, p_action TEXT, p_max INT, p_window_seconds INT)
RETURNS VOID AS $$
DECLARE
  v_count INT;
BEGIN
  -- Insertar hit
  INSERT INTO rate_limit_hits (user_id, action_key) VALUES (p_user_id, p_action);

  -- Contar hits en la ventana
  SELECT count(*) INTO v_count 
  FROM rate_limit_hits 
  WHERE user_id = p_user_id 
    AND action_key = p_action 
    AND created_at > (now() - (p_window_seconds || ' seconds')::interval);

  IF v_count > p_max THEN
    RAISE EXCEPTION 'Rate limit exceeded for action [%]. Plase wait.', p_action;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

--------------------------------------------
-- 🧱 3. RLS GLOBAL (CAPA 1, 2, 3)
--------------------------------------------

-- A) APPOINTMENTS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Appointments Select" ON appointments;
CREATE POLICY "Appointments Select" ON appointments FOR SELECT TO authenticated
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (
    SELECT 1 FROM memberships m JOIN role_permissions rp ON rp.role = m.role
    WHERE m.user_id = auth.uid() AND m.tenant_id = appointments.tenant_id AND rp.permission = 'bookings.read'
  )
);

DROP POLICY IF EXISTS "Appointments Insert" ON appointments;
CREATE POLICY "Appointments Insert" ON appointments FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (
    SELECT 1 FROM memberships m JOIN role_permissions rp ON rp.role = m.role
    WHERE m.user_id = auth.uid() AND m.tenant_id = appointments.tenant_id AND rp.permission = 'bookings.create'
  )
);

-- B) SCHEDULES
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Schedules Select" ON schedules;
CREATE POLICY "Schedules Select" ON schedules FOR SELECT TO authenticated
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (
    SELECT 1 FROM memberships m JOIN role_permissions rp ON rp.role = m.role
    WHERE m.user_id = auth.uid() AND m.tenant_id = schedules.tenant_id AND rp.permission = 'schedules.read'
  )
);

DROP POLICY IF EXISTS "Schedules Update" ON schedules;
CREATE POLICY "Schedules Update" ON schedules FOR UPDATE TO authenticated
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (
    SELECT 1 FROM memberships m JOIN role_permissions rp ON rp.role = m.role
    WHERE m.user_id = auth.uid() AND m.tenant_id = schedules.tenant_id AND rp.permission = 'schedules.update'
  )
);

-- C) STAFF
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff Select" ON staff;
CREATE POLICY "Staff Select" ON staff FOR SELECT TO authenticated
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (
    SELECT 1 FROM memberships m JOIN role_permissions rp ON rp.role = m.role
    WHERE m.user_id = auth.uid() AND m.tenant_id = staff.tenant_id AND rp.permission = 'staff.read'
  )
);

DROP POLICY IF EXISTS "Staff Insert" ON staff;
CREATE POLICY "Staff Insert" ON staff FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (
    SELECT 1 FROM memberships m JOIN role_permissions rp ON rp.role = m.role
    WHERE m.user_id = auth.uid() AND m.tenant_id = staff.tenant_id AND rp.permission = 'staff.create'
  )
);

--------------------------------------------
-- 🗄️ 4. STORAGE SECURITY (BLOQUE 8)
--------------------------------------------
-- Aislar acceso en buckets de Supabase para 'archivos'
-- asumiendo buckets standard (storage.objects)

DROP POLICY IF EXISTS "Tenant storage isolation" ON storage.objects;
CREATE POLICY "Tenant storage isolation" ON storage.objects 
FOR ALL TO authenticated
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR (
    -- Validar que la ruta comience con 'tenants/' + tenant_id
    EXISTS (
      SELECT 1 FROM memberships m 
      WHERE m.user_id = auth.uid() 
      AND (storage.objects.name LIKE 'tenants/' || m.tenant_id || '/%')
    )
  )
);

`;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Parche Ultimate Hardening V8 aplicado correctamente en DB.");
  } catch (err) {
    console.error("❌ Error aplicando parche SQL:", err);
  } finally {
    await client.end();
  }
}

main();
