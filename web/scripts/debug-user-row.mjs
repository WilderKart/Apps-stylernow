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

async function debugUser() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    console.log("Conectado con éxito a Supabase Pooler.")
    
    // 1. Ver el registro en 'usuarios'
    const resUser = await client.query("SELECT * FROM usuarios")
    console.log("\n📊 --- REGISTROS EN TABLA 'usuarios' ---")
    console.log(JSON.stringify(resUser.rows, null, 2))

    // 2. Ver políticas RLS en la tabla 'usuarios'
    console.log("\n🛡️ --- POLÍTICAS RLS EN TABLA 'usuarios' ---")
    const resPolicies = await client.query(`
      SELECT polname, polcmd, polroles, polqual
      FROM pg_policy pol
      JOIN pg_class c ON pol.polrelid = c.oid
      WHERE c.relname = 'usuarios'
    `)
    
    if (resPolicies.rows.length === 0) {
      console.log("⚠️ ¡ATENCIÓN! No se encontraron políticas RLS activas en 'usuarios'.")
      console.log("Esto significa que RLS bloquea TODO acceso de lectura/escritura para el usuario logueado.")
    } else {
      resPolicies.rows.forEach(p => {
         console.log(`- [${p.polcmd}] Policy Name: ${p.polname}`)
      })
    }

  } catch (err) {
    console.error("❌ Error:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

debugUser()
