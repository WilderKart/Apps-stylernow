import fs from 'fs'
import pg from 'pg'

const { Client } = pg

// 1. Cargar variables de entorno desde .env.local
const envPath = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web\\.env.local'
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnv = (name) => {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'))
  return match ? match[1] : null
}

const connectionString = getEnv('DATABASE_URL')

if (!connectionString) {
  console.error("Falta la variable de entorno DATABASE_URL")
  process.exit(1)
}

async function verifyConnection() {
  console.log("Intentando conectar al Pooler de Supabase...")
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    console.log("✅ ¡Conectado con éxito a Supabase Pooler!")
    
    // Ejecutar una consulta rápida para listar tablas o contar usuarios
    const res = await client.query("SELECT COUNT(*) FROM usuarios")
    console.log(`📊 Total de filas en la tabla 'usuarios': ${res.rows[0].count}`)
    
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    console.log(`📋 Tablas encontradas: ${tables.rows.map(t => t.table_name).join(', ')}`)

  } catch (err) {
    console.error("❌ Error de conexión:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

verifyConnection()
