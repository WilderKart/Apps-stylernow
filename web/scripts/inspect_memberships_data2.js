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
    const members = await sql`
      SELECT * FROM memberships 
      ORDER BY created_at DESC 
      LIMIT 10
    `
    console.log('--- RECENT MEMBERSHIPS ---')
    console.log(JSON.stringify(members, null, 2))
  } catch (err) {
    console.error('SQL Error:', err)
  } finally {
    await sql.end()
  }
}

run()
