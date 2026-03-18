import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error || !user) {
       console.error("Error de Supabase en Callback:", error);
       return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error?.message || 'Código de verificación inválido o expirado')}`);
    }

    if (user) {
      // 2. Verificar si el usuario ya existe en public.usuarios (Flujo estándar o Google)
      const { data: profile } = await supabase
        .from('usuarios')
        .select('role')
        .eq('auth_id', user.id)
        .maybeSingle() // Cambiado a maybeSingle para evitar error de crash si no existe

      if (!profile) {
        // Crear perfil por defecto para nuevos ingresos de Google
        const { data: newProfile, error: insertError } = await supabase
          .from('usuarios')
          .insert({
            auth_id: user.id,
            role: 'cliente', 
            nombre: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
            email: user.email || ''
          })
          .select('role')
          .single();

        if (insertError) {
          return NextResponse.redirect(`${origin}/auth/login?error=Error creando perfil.`);
        }

        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/auth/login?role=client&msg=verified`);
      }

      // 3. Forzar Cierre de Sesión para Login Manual (V10.7.0)
      const realRole = profile.role;
      await supabase.auth.signOut();

      if (realRole === 'master' || realRole === 'manager') {
         return NextResponse.redirect(`${origin}/auth/login?role=shop_owner&msg=verified`);
      }

      if (realRole === 'barbero') {
         return NextResponse.redirect(`${origin}/auth/login?role=barber&msg=verified`);
      }
      if (realRole === 'admin') {
         return NextResponse.redirect(`${origin}/auth/login?role=admin&msg=verified`);
      }
      
      return NextResponse.redirect(`${origin}/auth/login?role=client&msg=verified`);
    }
  }

  // Redirigir a login si no hay código, preservando el rol (V10.7.7)
  const fallbackRole = searchParams.get('role') || 'client';
  return NextResponse.redirect(`${origin}/auth/login?role=${fallbackRole === 'manager' ? 'shop_owner' : fallbackRole}&error=${encodeURIComponent('Enlace de verificación expirado o ya utilizado. Por favor, inicia sesión manualmente.')}`);
}

