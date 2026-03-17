import fs from 'fs'
import path from 'path'
import pg from 'pg'

const { Client } = pg

// 1. Cargar variables de entorno desde .env.local
const envPath = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web\\.env.local'
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnv = (name) => {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'))
  return match ? match[1] : null
}

let connectionString = getEnv('DATABASE_URL')

if (connectionString) {
  // Reemplazar host por la IPv6 resuelta si falla la resolución de nombres
  connectionString = connectionString.replace('db.povaaoywqsfapxatnleu.supabase.co', '[2600:1f13:838:6e0f:9a43:7e61:151b:d5d4]')
}

if (!connectionString) {
  console.error("Falta la variable de entorno DATABASE_URL")
  process.exit(1)
}

// 2. Leer schema.sql
const sqlPath = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\supabase\\schema.sql'
const sqlContent = fs.readFileSync(sqlPath, 'utf8')

async function initDb() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false } // Requerido para Supabase Cloud
  })
  
  try {
    console.log("Conectando a la base de datos...")
    await client.connect()
    
    console.log("Ejecutando schema.sql...")
    await client.query(sqlContent)
    
    console.log("✅ Tablas creadas con éxito!")
    
  } catch (err) {
    console.error("❌ Error de ejecución SQL:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

initDb()
