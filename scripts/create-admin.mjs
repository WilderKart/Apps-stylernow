import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// 1. Cargar variables de entorno desde .env.local
const envPath = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web\\.env.local'
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnv = (name) => {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'))
  return match ? match[1] : null
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createAdmin() {
  const email = 'fundador@stylernow.com'
  const password = 'Kevin3183943465@'

  console.log(`Intentando crear SuperAdmin: ${email}`)

  // Crear usuario en auth.users con confirmación automática
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Bypassa el límite de correo!
    user_metadata: { full_name: 'Fundador StylerNow' }
  })

  if (authError) {
    console.error("Error al crear usuario en auth:", authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`Usuario creado en auth. ID: ${userId}`)

  // Insertar en la tabla publica usuarios con rol 'admin'
  const { error: dbError } = await supabase
    .from('usuarios')
    .insert({
      auth_id: userId,
      role: 'admin', // En minúsculas como en el enum de la DB
      nombre: 'Fundador StylerNow',
      email: email
    })

  if (dbError) {
    console.error("Error al insertar en tabla 'usuarios':", dbError.message)
    process.exit(1)
  }

  console.log("✅ SuperAdmin creado con éxito en auth y public.usuarios!")
}

createAdmin()
