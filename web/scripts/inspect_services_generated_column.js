const postgres = require('postgres')

const dbUrl = "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
const sqlClient = postgres(dbUrl)

async function run() {
  try {
    const columns = await sqlClient`
      SELECT 
          column_name, 
          is_generated,
          generation_expression
      FROM 
          information_schema.columns
      WHERE 
          table_name = 'services' AND column_name = 'normalized_name';
    `
    console.log("--- PROPIEDADES DE NORMALIZED_NAME ---")
    console.log(JSON.stringify(columns, null, 2))

  } catch (err) {
    console.error("Error executing query:", err)
  } finally {
    await sqlClient.end()
  }
}

run()
