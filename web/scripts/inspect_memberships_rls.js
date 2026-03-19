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
    const policies = await sql`
      SELECT 
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE tablename = 'memberships';
    `
    console.log("=== POLÍTICAS RLS MEMBERSHIPS ===")
    console.log(JSON.stringify(policies, null, 2))

  } catch (e) {
    console.error("Error consultando pg_policies:", e)
  } finally {
    await sql.end()
  }
}

run()
