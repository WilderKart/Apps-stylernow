const { Client } = require('pg');

const sql = `
-- ==========================================
-- 🛡️ PARCHE COMPLETO RBAC PROFUNDO V10.1
-- ==========================================

-- 1. APPOINTMENTS / RESERVAS (Permiso: bookings.read / bookings.create)
DROP POLICY IF EXISTS "appointments_select" ON appointments;
CREATE POLICY "appointments_select" ON appointments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = appointments.tenant_id AND rp.permission = 'bookings.read'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

DROP POLICY IF EXISTS "appointments_insert" ON appointments;
CREATE POLICY "appointments_insert" ON appointments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = appointments.tenant_id AND rp.permission = 'bookings.create'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

DROP POLICY IF EXISTS "reservas_select_v7" ON reservas;
CREATE POLICY "reservas_select" ON reservas FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = reservas.barberia_id AND rp.permission = 'bookings.read'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

-- 2. SERVICES / SERVICIOS (Permiso: services.read / services.create)
DROP POLICY IF EXISTS "services_select_v7" ON services;
CREATE POLICY "services_select" ON services FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = services.tenant_id AND rp.permission = 'services.read'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

DROP POLICY IF EXISTS "services_insert" ON services;
CREATE POLICY "services_insert" ON services FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = services.tenant_id AND rp.permission = 'services.create'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

-- 3. STAFF / PERSONAL (Permiso: staff.read / staff.create)
DROP POLICY IF EXISTS "Staff can read their own tenant staff" ON staff;
DROP POLICY IF EXISTS "staff_select" ON staff;
CREATE POLICY "staff_select" ON staff FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = staff.tenant_id AND rp.permission = 'staff.read'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

-- 4. SCHEDULES (Permiso: schedules.read)
DROP POLICY IF EXISTS "schedules_select" ON schedules;
CREATE POLICY "schedules_select" ON schedules FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = schedules.tenant_id AND rp.permission = 'schedules.read'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

-- 5. PROMOCIONES (Permiso: promos.read)
DROP POLICY IF EXISTS "promociones_select" ON promociones;
CREATE POLICY "promociones_select" ON promociones FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = promociones.barberia_id AND rp.permission = 'promos.read'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);
`;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Parche profundo RBAC aplicado para Tablas Críticas.");
  } catch (err) {
    console.error("❌ Error en Parche RBAC:", err);
  } finally {
    await client.end();
  }
}

main();
