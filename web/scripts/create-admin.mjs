import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// 1. Cargar variables de entorno desde .env.local
// Como este script correrá en la carpeta 'web' o 'web/scripts', process.cwd() será 'C:\Users\karni\Documents\Proyectos\StylerNow\web' si lo ejecutamos desde ahí.
const envPath = path.join('C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web', '.env.local')
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
    email_confirm: true,
    user_metadata: { full_name: 'Fundador StylerNow' }
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log("El usuario ya está creado en auth. Procedimiento a vincular en tabla 'usuarios'.")
        // No salimos con error, intentamos recuperar el usuario para insertarlo si falta.
        const { data: listData } = await supabase.auth.admin.listUsers()
        const existing = listData.users.find(u => u.email === email)
        if (existing) {
             await insertToUsuarios(existing.id)
             return
        }
    }
    console.error("Error al crear usuario en auth:", authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`Usuario creado en auth. ID: ${userId}`)
  await insertToUsuarios(userId)
}

async function insertToUsuarios(userId) {
  const email = 'fundador@stylernow.com'
  // Insertar en la tabla publica usuarios con rol 'admin'
  const { error: dbError } = await supabase
    .from('usuarios')
    .insert({
      auth_id: userId,
      role: 'admin',
      nombre: 'Fundador StylerNow',
      email: email
    })

  if (dbError) {
    if (dbError.message.includes('unique constraint') || dbError.message.includes('already exists')) {
        console.log("✅ El perfil del SuperAdmin ya existe en la tabla 'usuarios'!")
        process.exit(0)
    }
    console.error("Error al insertar en tabla 'usuarios':", dbError.message)
    process.exit(1)
  }

  console.log("✅ SuperAdmin creado con éxito en auth y public.usuarios!")
}

createAdmin()
