import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshes the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // CONTROL DE ACCESO (Zero Trust) para /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/admin', request.url))
    }

    // Consultar el rol en base de datos
    const { data: profile } = await supabase
      .from('usuarios')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Redirigir a login con error de acceso si no es admin
      const failUrl = new URL('/auth/login', request.url)
      failUrl.searchParams.set('error', 'Acceso denegado. No eres administrador.')
      return NextResponse.redirect(failUrl)
    }
  }

  return supabaseResponse
}
