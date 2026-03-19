const postgres = require('postgres')

const dbUrl = "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
const sqlClient = postgres(dbUrl)

async function run() {
  try {
    const tableType = await sqlClient`
      SELECT 
          table_type
      FROM 
          information_schema.tables
      WHERE 
          table_name = 'barberias';
    `
    console.log("--- TIPO DE OBJETO BARBERIAS ---")
    console.log(JSON.stringify(tableType, null, 2))

    if (tableType.length > 0 && tableType[0].table_type === 'VIEW') {
      const viewDef = await sqlClient`
        SELECT pg_get_viewdef('barberias'::regclass, true) as view_definition;
      `
      console.log("--- DEFINICIÓN DE VISTA BARBERIAS ---")
      console.log(viewDef[0].view_definition)
    }

  } catch (err) {
    console.error("Error executing query:", err)
  } finally {
    await sqlClient.end()
  }
}

run()
