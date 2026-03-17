import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${requestUrl.origin}/ingresar`)
  }

  // Fetch role from public.usuarios
  const { data: profile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  const role = (profile?.role as string || 'cliente').toLowerCase()

  let redirectPath = '/cliente'
  if (role === 'master') redirectPath = '/dashboard'
  else if (role === 'manager') redirectPath = '/manager'
  else if (role === 'barbero') redirectPath = '/barbero'
  else if (role === 'admin') redirectPath = '/admin'

  return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
}
