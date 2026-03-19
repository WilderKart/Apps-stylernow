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
    const perms = await sql`
      SELECT * FROM role_permissions 
      WHERE permission = 'services.create'
    `
    console.log('--- PERMISOS PARA services.create ---')
    console.log(JSON.stringify(perms, null, 2))
  } catch (err) {
    console.error('SQL Error:', err)
  } finally {
    await sql.end()
  }
}

run()
