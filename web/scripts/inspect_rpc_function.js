const postgres = require('postgres')

const dbUrl = "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
const sqlClient = postgres(dbUrl)

async function run() {
  try {
    const rpcDef = await sqlClient`
      SELECT 
          p.proname as function_name,
          pg_get_functiondef(p.oid) as function_definition
      FROM 
          pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE 
          p.proname = 'insert_services_batch';
    `
    console.log("--- DEFINICIÓN DE RPC: insert_services_batch ---")
    if (rpcDef.length > 0) {
      console.log(rpcDef[0].function_definition)
    } else {
      console.log("No se encontró la función.")
    }

  } catch (err) {
    console.error("Error executing query:", err)
  } finally {
    await sqlClient.end()
  }
}

run()
