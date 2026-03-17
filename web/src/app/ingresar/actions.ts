'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login-redirect')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string || '',
      }
    }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp(data)

  if (authError) {
    return { error: authError.message }
  }

  // Insertar perfil en public.usuarios con rol 'cliente'
  if (authData?.user) {
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        auth_id: authData.user.id,
        role: 'cliente',
        nombre: (formData.get('full_name') as string) || 'Cliente',
        email: data.email
      })

    if (dbError) {
      return { error: dbError.message }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login-redirect')
}
