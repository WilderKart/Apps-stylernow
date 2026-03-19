import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  try {
    const { data: enumData, error: enumError } = await supabase.rpc('execute_sql', {
      query: "SELECT enum_range(NULL::user_role)"
    })
    
    if (enumError) {
      // If RPC execute_sql is not defined, we can try running a direct query via REST? No, REST doesn't support raw SQL easily unless we do something else.
      // Let's just try running a simple select on a view or executing something that lists items if possible.
      // Wait, there is no generic RPC execute_sql usually unless it was created.
      // We can use postgres package directly! We have the DATABASE_URL in .env.local!
      console.log("No RPC execute_sql. Usaremos conexión directa postgres.")
    } else {
      console.log("Enum Roles:", enumData)
    }
  } catch (e) {
    console.error(e)
  }
}

run()
