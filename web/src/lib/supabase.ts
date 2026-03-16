import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan credenciales de Supabase. El cliente no funcionará correctamente. Verifica tu .env.local')
}

// Inicialización del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
