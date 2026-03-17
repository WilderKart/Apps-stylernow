import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const envPath = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web\\.env.local'
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnv = (name) => {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'))
  return match ? match[1] : null
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function insertAdmin() {
  const email = 'fundador@stylernow.com'
  const userId = '8fc7a9ed-5882-4ca0-bbb0-b3da997117fa' // ID del usuario creado en Auth

  console.log(`Insertando SuperAdmin en tabla 'usuarios' con ID: ${userId}`)

  const { error: dbError } = await supabase
    .from('usuarios')
    .insert({
      auth_id: userId,
      role: 'admin', // En minúsculas
      nombre: 'Fundador StylerNow',
      email: email
    })

  if (dbError) {
    console.error("Error al insertar en tabla 'usuarios':", dbError.message)
    process.exit(1)
  }

  console.log("✅ SuperAdmin vinculado con éxito en la tabla 'usuarios'!")
}

insertAdmin()
