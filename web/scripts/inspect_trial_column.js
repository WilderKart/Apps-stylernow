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
    const cols = await sql`
      SELECT column_name, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' AND column_name = 'trial_ends_at';
    `
    console.log("=== COLUMNA TRIAL_ENDS_AT ===")
    console.log(JSON.stringify(cols, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await sql.end()
  }
}

run()
