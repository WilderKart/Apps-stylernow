import fs from 'fs'
import pg from 'pg'

const { Client } = pg

// Cargar variables de entorno desde .env.local
const envPath = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web\\.env.local'
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnv = (name) => {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'))
  return match ? match[1] : null
}

const connectionString = getEnv('DATABASE_URL')

async function dropPolicy() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    console.log("Conectado con éxito a Supabase Pooler.")
    
    console.log("Eliminando política recursiva...")
    await client.query(`DROP POLICY "Admins pueden ver todos los perfiles" ON usuarios;`)
    console.log("✅ Política eliminada con éxito!")

  } catch (err) {
    console.error("❌ Error:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

dropPolicy()
