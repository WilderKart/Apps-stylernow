const { Client } = require('pg');

const sql = `
-- ==========================================
-- 🛡️ FIX AUDITORÍA V10 — PERMISOLOGÍA
-- ==========================================

-- A) MEMBERSHIPS: Permitir que cada usuario lea su propia membresía
DROP POLICY IF EXISTS "Memberships Select Self" ON memberships;
CREATE POLICY "Memberships Select Self" ON memberships 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

-- B) PERMISSIONS: Catálogo de sólo lectura para todos los autenticados
DROP POLICY IF EXISTS "Permissions Select ReadOnly" ON permissions;
CREATE POLICY "Permissions Select ReadOnly" ON permissions 
FOR SELECT TO authenticated 
USING (true);

-- C) ROLE_PERMISSIONS: Relación de sólo lectura necesaria para assertPermission
DROP POLICY IF EXISTS "Role Permissions Select ReadOnly" ON role_permissions;
CREATE POLICY "Role Permissions Select ReadOnly" ON role_permissions 
FOR SELECT TO authenticated 
USING (true);
`;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Ajustes de Permisología aplicados. El script de auditoría correrá sin Deny-All accidental.");
  } catch (err) {
    console.error("❌ Error aplicando fix:", err);
  } finally {
    await client.end();
  }
}

main();
