import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Read .env.local manually
const envPath = path.resolve('.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}="([^"]+)"`))
  return match ? match[1] : null
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.from('usuarios').select('role').limit(1)
  console.log("Data o Error:", data, error)
  // Let's inspect the exact list of users or run a direct REST schema query
  // Wait, we can list the tables or RPC if there's any available.
  // Actually, we can do a trick to get the enum values: 
  // insert into usuarios with invalid role, and read the error message!
  const { error: testError } = await supabase.from('usuarios').insert({ role: 'test_invalid_role' })
  console.log("Error inducido para leer roles:", testError ? testError.message : "No error")
}

run()
