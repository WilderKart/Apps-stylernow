import postgres from 'postgres'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve('.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}="([^"]+)"`))
  return match ? match[1] : null
}

const connectionString = getEnvVar('DIRECT_URL')

if (!connectionString) {
  console.error("Falta DIRECT_URL")
  process.exit(1)
}

const sql = postgres(connectionString)

async function run() {
  try {
    const services = await sql`
      SELECT id, category, name, image_url 
      FROM service_catalog 
      WHERE name ILIKE '%Mascarilla%' 
         OR name ILIKE '%Depilaci%'
         OR category ILIKE '%Manicure%'
         OR category ILIKE '%Facial%'
         OR category ILIKE '%Depilación%';
    `
    console.log("=== CATÁLOGO DE SERVICIOS ===")
    console.log(JSON.stringify(services, null, 2))

  } catch (e) {
    console.error("Error consultando catálogo:", e)
  } finally {
    await sql.end()
  }
}

run()
