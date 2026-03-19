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

const sql = postgres(connectionString)

async function run() {
  try {
    const services = await sql`
      SELECT * FROM service_catalog LIMIT 1;
    `
    console.log("=== COLUMNAS DETECTADAS ===")
    if (services.length > 0) {
      console.log(Object.keys(services[0]))
    } else {
      console.log("Tabla vacía")
    }
  } catch (e) {
    console.error(e)
  } finally {
    await sql.end()
  }
}

run()
