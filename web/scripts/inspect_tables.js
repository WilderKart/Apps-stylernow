require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function inspect() {
  console.log("--- APPOINTMENTS ---")
  const { data: appData, error: appErr } = await supabase.from('appointments').select('*').limit(1)
  console.log("appointments err:", appErr?.message || "none")
  
  if (appData) {
    if (appData.length === 0) console.log("Empty, trying structure from error...")
    const { error: fErr } = await supabase.from('appointments').select('non_existent_column_to_get_error').limit(1)
    console.log("App Struct from error:", fErr?.message || "unknown")
  }
  
  console.log("--- SERVICES ---")
  const { error: sErr } = await supabase.from('services').select('non_existent_column_to_get_error').limit(1)
  console.log("Serv Struct from error:", sErr?.message || "unknown")

  console.log("--- CLIENTS (if exists) ---")
  const { error: cErr } = await supabase.from('clients').select('non_existent_column_to_get_error').limit(1)
  console.log("Clients Struct from error:", cErr?.message || "unknown")

  console.log("--- BARBERS / EMPLOYEES (if exists) ---")
  const { error: eErr } = await supabase.from('usuarios').select('non_existent_column_to_get_error').limit(1)
  console.log("Usuarioss Struct from error:", eErr?.message || "unknown")

}

inspect()
