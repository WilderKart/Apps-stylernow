const postgres = require('postgres')

const dbUrl = "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres" // Cambiado al puerto 5432 original temporalmente local
const sql = postgres(dbUrl)

async function run() {
  try {
    console.log("--- APLICANDO ESQUEMA FINTECH DE ESTADOS Y AUDITORÍA ---")

    // 1. Alterar tabla tenants (Máquina de estados estricta y T&C)
    await sql`ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_status_check;`
    
    // Convert status rows to valid if any exist (safety first)
    await sql`UPDATE tenants SET status = 'pending' WHERE status NOT IN ('pending', 'approved', 'rejected') OR status IS NULL;`

    await sql`ALTER TABLE tenants ADD CONSTRAINT tenants_status_check CHECK (status IN ('pending', 'approved', 'rejected'));`
    
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;`
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS terms_version TEXT;`
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS terms_evidence TEXT;`
    
    console.log("[-] Tabla tenants asegurada con CHECK y T&C")

    // 2. Crear tabla audit_logs
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        actor_id UUID NOT NULL,
        target_id UUID,
        action TEXT NOT NULL,
        metadata JSONB
      );
    `
    // Policies para que nadie desde el front pueda modificar logs (RLS activo)
    await sql`ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;`
    await sql`DROP POLICY IF EXISTS audit_logs_read ON audit_logs;`
    await sql`
      CREATE POLICY audit_logs_read ON audit_logs FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'admin' OR role = 'founder')
      );
    `
    console.log("[-] Tabla audit_logs creada y asegurada")

    // 3. Crear tabla in_app_notifications
    await sql`
      CREATE TABLE IF NOT EXISTS in_app_notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        user_id UUID NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE NOT NULL
      );
    `
    
    await sql`ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;`
    await sql`DROP POLICY IF EXISTS in_app_notifications_select ON in_app_notifications;`
    await sql`
      CREATE POLICY in_app_notifications_select ON in_app_notifications FOR SELECT USING (auth.uid() = user_id);
    `
    await sql`DROP POLICY IF EXISTS in_app_notifications_update ON in_app_notifications;`
    await sql`
      CREATE POLICY in_app_notifications_update ON in_app_notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    `

    console.log("[-] Tabla in_app_notifications creada y asegurada con RLS")
    console.log("--- MIGRACIÓN EXITOSA ---")

  } catch (err) {
    console.error("Error al aplicar migración:", err)
  } finally {
    await sql.end()
  }
}

run()
