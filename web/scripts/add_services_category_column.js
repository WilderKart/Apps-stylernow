const postgres = require('postgres')

const dbUrl = "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
const sql = postgres(dbUrl)

async function run() {
  try {
    console.log("--- ACTUALIZANDO TABLA SERVICES ---")

    // 1. Añadir columna category si no existe
    await sql`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS category text;
    `
    console.log("Columna 'category' añadida a 'services' exitosamente")

  } catch (err) {
    console.error("Error al actualizar la tabla services:", err)
  } finally {
    await sql.end()
  }
}

run()
