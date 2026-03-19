const postgres = require('postgres')

const dbUrl = "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
const sql = postgres(dbUrl)

async function run() {
  try {
    console.log("--- ACTUALIZANDO RESTRICCIÓN DE ROLES ---")

    // 1. Dropear constraint anterior
    await sql`
      ALTER TABLE memberships 
      DROP CONSTRAINT IF EXISTS memberships_role_check;
    `
    console.log("Constraint anterior dropeado")

    // 2. Crear nueva constraint incluyendo 'master'
    await sql`
      ALTER TABLE memberships 
      ADD CONSTRAINT memberships_role_check 
      CHECK (role = ANY (ARRAY['master'::text, 'owner'::text, 'manager'::text, 'barber'::text, 'client'::text]));
    `
    console.log("Nuevo constraint creado con 'master' exitosamente")

  } catch (err) {
    console.error("Error al actualizar la base de datos:", err)
  } finally {
    await sql.end()
  }
}

run()
