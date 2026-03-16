import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${requestUrl.origin}/ingresar`)
  }

  // Fetch role + must_change_password flag from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('role, must_change_password')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'CLIENT'

  // Masters who were force-reset must change their password first
  if (role === 'MASTER' && profile?.must_change_password) {
    return NextResponse.redirect(`${requestUrl.origin}/cambiar-contrasena`)
  }

  let redirectPath = '/cliente'
  if (role === 'MASTER') redirectPath = '/dashboard'
  else if (role === 'MANAGER') redirectPath = '/manager'
  else if (role === 'BARBER') redirectPath = '/staff'
  else if (role === 'SUPERADMIN') redirectPath = '/admin'

  return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
}
