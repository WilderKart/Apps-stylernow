'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Inicializar cliente administrativo (SuperUser) para acciones críticas
const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Cargado de .env.local en el servidor
  if (!url || !serviceKey) throw new Error("Faltan variables de entorno para acciones administrativas")
  return createAdminClient(url, serviceKey)
}

// 1. Alternar Estado de Barbería (Suspender / Activar)
export async function toggleBarberiaStatusAction(id: string, active: boolean) {
  const supabase = await createClient()
  
  // Validar sesión y rol 'admin'
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase.from('usuarios').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'No autorizado' }

  const { error } = await supabase
    .from('barberias')
    .update({ activa: active, actualizado_en: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/barberias')
  revalidatePath('/admin')
  return { success: true }
}

// 2. Reiniciar Contraseña de Usuario
export async function resetUserPasswordAction(userId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase.from('usuarios').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'No autorizado' }

  try {
    const adminClient = getAdminClient()
    const tempPassword = `Styler${Math.random().toString(36).slice(-8)}@`
    
    const { error } = await adminClient.auth.admin.updateUserById(
      userId, 
      { password: tempPassword }
    )

    if (error) return { error: error.message }
    return { success: true, tempPassword }

  } catch (err: any) {
    return { error: err.message }
  }
}

// 3. Eliminar Usuario / Cliente (GDPR / Dereho al Olvido)
export async function deleteUserAction(userId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase.from('usuarios').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'No autorizado' }

  try {
    const adminClient = getAdminClient()
    
    // Primero eliminar de la tabla 'usuarios' (CASCADE o directo)
    const { error: dbError } = await supabase.from('usuarios').delete().eq('auth_id', userId)
    if (dbError) return { error: dbError.message }

    // Segundo eliminar del Auth de Supabase
    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }

    revalidatePath('/admin/usuarios')
    return { success: true }

  } catch (err: any) {
    return { error: err.message }
  }
}
