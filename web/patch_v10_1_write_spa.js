const { Client } = require('pg');

const sql = `
-- ==========================================
-- 🛡️ COMPLEMENTO DE ESCRITURA V10.1 (SPA)
-- ==========================================

-- 1. SERVICIOS (Escritura): INSERT, UPDATE, DELETE protegidos por permisos
DROP POLICY IF EXISTS "servicios_insert" ON servicios;
CREATE POLICY "servicios_insert" ON servicios FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = servicios.barberia_id AND rp.permission = 'services.create'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

DROP POLICY IF EXISTS "servicios_update" ON servicios;
CREATE POLICY "servicios_update" ON servicios FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = servicios.barberia_id AND rp.permission = 'services.update'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

DROP POLICY IF EXISTS "servicios_delete" ON servicios;
CREATE POLICY "servicios_delete" ON servicios FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = servicios.barberia_id AND rp.permission = 'services.delete'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

-- 2. PROMOCIONES (Escritura): INSERT, UPDATE, DELETE protegidos por permisos
DROP POLICY IF EXISTS "promociones_insert" ON promociones;
CREATE POLICY "promociones_insert" ON promociones FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = promociones.barberia_id AND rp.permission = 'promos.create'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

DROP POLICY IF EXISTS "promociones_update" ON promociones;
CREATE POLICY "promociones_update" ON promociones FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = promociones.barberia_id AND rp.permission = 'promos.update'
  ) OR auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
);

DROP POLICY IF EXISTS "promociones_delete" ON promociones;
CREATE POLICY "promociones_delete" ON promociones FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m 
    JOIN role_permissions rp ON rp.role = m.role 
    WHERE m.user_id = auth.uid() AND m.tenant_id = promociones.barberia_id AND rp.permission = 'promos.delete'
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
    console.log("✅ Políticas de escritura aplicadas en tablas españolas.");
  } catch (err) {
    console.error("❌ Error aplicando escritura:", err);
  } finally {
    await client.end();
  }
}

main();
