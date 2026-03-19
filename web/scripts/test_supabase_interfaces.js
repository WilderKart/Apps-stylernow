import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log("Inventario de Metodos signInWithOtp:")
console.log(supabase.auth.signInWithOtp.toString())
// We can test if typescript complains to check support interface
// This script is better just inspecting the TS definition of the package if available
// but better to read the official JS SDK code or types.
