const postgres = require('postgres')

const sql = postgres(process.env.SUPABASE_DB_URL || {
  host: "aws-0-us-east-1.pooler.supabase.com", // tendré que sacarlo del .env
  // mejor lo saco del .env.local para que sea dinámico
})

const dbUrl = "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres" // Usar puerto 5432 para evitar pgbouncer issues en DDL
const sqlClient = postgres(dbUrl)

async function run() {
  try {
    const indexes = await sqlClient`
      SELECT
          indexname,
          indexdef
      FROM
          pg_indexes
      WHERE
          tablename = 'memberships';
    `
    console.log("--- ÍNDICES EN MEMBERSHIPS ---")
    console.log(JSON.stringify(indexes, null, 2))

    const constraints = await sqlClient`
      SELECT
          conname,
          pg_get_constraintdef(c.oid)
      FROM
          pg_constraint c
          JOIN pg_namespace n ON n.oid = c.connamespace
          JOIN pg_class s ON s.oid = c.conrelid
      WHERE
          s.relname = 'memberships';
    `
    console.log("\n--- CONSTRAINTS EN MEMBERSHIPS ---")
    console.log(JSON.stringify(constraints, null, 2))

  } catch (err) {
    console.error("Error executing query:", err)
  } finally {
    await sqlClient.end()
  }
}

run()
