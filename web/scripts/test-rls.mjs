import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const envPath = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web\\.env.local'
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnv = (name) => {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'))
  return match ? match[1] : null
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if (!supabaseUrl || !anonKey) {
  console.error("Faltan variables URL o ANON_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, anonKey)

async function testRls() {
  console.log("Iniciando sesión como fundador@stylernow.com...")
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'fundador@stylernow.com',
    password: 'Kevin3183943465@'
  })

  if (authError) {
    console.error("❌ Error de login:", authError.message)
    process.exit(1)
  }

  const user = authData.user
  console.log(`✅ Login Exitoso. User ID: ${user.id}`)

  // Simular la consulta de login-redirect.route.ts
  const { data: profile, error: dbError } = await supabase
    .from('usuarios')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (dbError) {
    console.error("❌ Error al leer 'usuarios' bajo RLS:", dbError.message)
  } else {
    console.log("📊 Fila encontrada con RLS:", profile)
  }
}

testRls()
