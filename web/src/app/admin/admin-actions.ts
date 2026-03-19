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

// 1. Alternar Estado de Barbería (Suspender / Activar viejo - Mantenido param legacy si es necesario)
export async function toggleBarberiaStatusAction(id: string, active: boolean) {
  const supabase = await createClient()
  
  // Validar sesión y rol 'admin'
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase.from('usuarios').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'founder') return { error: 'No autorizado' }

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
  if (profile?.role !== 'admin' && profile?.role !== 'founder') return { error: 'No autorizado' }

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
  if (profile?.role !== 'admin' && profile?.role !== 'founder') return { error: 'No autorizado' }

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

// 4. Fintech / Zero Trust: Aprobar Barbería Pendiente
export async function approveTenantAction(tenantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase.from('usuarios').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'founder') return { error: 'No autorizado' }

  const adminDb = getAdminClient()
  
  // Strict Machine State Check: Solo aprobar 'pending'
  const { data: tenant, error: fetchErr } = await adminDb.from('tenants').select('status, name, email').eq('id', tenantId).single()
  if (fetchErr || !tenant) return { error: 'Barbería no encontrada' }
  if (tenant.status !== 'pending') return { error: 'La barbería no está en estado pendiente' }

  const { error } = await adminDb
    .from('tenants')
    .update({ status: 'approved' })
    .eq('id', tenantId)

  if (error) return { error: error.message }

  // Auditoría
  await adminDb.from('audit_logs').insert({
    actor_id: user.id,
    target_id: tenantId,
    action: 'TENANT_APPROVED',
    metadata: { previous_status: 'pending' }
  })

  // Email al Master
  if (process.env.RESEND_API_KEY && tenant.email) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'StylerNow Team <noreply@notificaciones.stylernow.co>',
        to: tenant.email,
        subject: '✅ ¡Tu Barbería fue APROBADA!',
        html: `<p>Hola,</p><p>¡Excelentes noticias! El equipo administrativo ha aprobado la cuenta de <strong>${tenant.name}</strong>.</p><p>Ya puedes acceder a tu panel y comenzar a recibir citas.</p>`
      })
    } catch(e) {}
  }

  revalidatePath('/admin/barberias')
  return { success: true }
}

// 5. Fintech / Zero Trust: Rechazar Barbería Pendiente
export async function rejectTenantAction(tenantId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase.from('usuarios').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'founder') return { error: 'No autorizado' }

  const adminDb = getAdminClient()
  
  const { data: tenant, error: fetchErr } = await adminDb.from('tenants').select('status, name, email').eq('id', tenantId).single()
  if (fetchErr || !tenant) return { error: 'Barbería no encontrada' }
  if (tenant.status !== 'pending') return { error: 'La barbería no está en estado pendiente' }

  const { error } = await adminDb
    .from('tenants')
    .update({ status: 'rejected' })
    .eq('id', tenantId)

  if (error) return { error: error.message }

  // Auditoría
  await adminDb.from('audit_logs').insert({
    actor_id: user.id,
    target_id: tenantId,
    action: 'TENANT_REJECTED',
    metadata: { reason }
  })

  // Email
  if (process.env.RESEND_API_KEY && tenant.email) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'StylerNow Team <noreply@notificaciones.stylernow.co>',
        to: tenant.email,
        subject: '⚠️ Actualización sobre tu solicitud',
        html: `<p>Hola,</p><p>Hemos revisado tu solicitud para <strong>${tenant.name}</strong> y lamentablemente no ha sido aprobada en esta ocasión.</p><p><strong>Motivo:</strong> ${reason}</p><p>Si crees que esto es un error, por favor contacta a soporte.</p>`
      })
    } catch(e) {}
  }

  revalidatePath('/admin/barberias')
  return { success: true }
}
