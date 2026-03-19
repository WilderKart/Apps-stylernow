'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Master sets their own password during onboarding ────────────────────────
export async function setMasterPasswordAction(password: string, confirmPassword: string) {
  if (password !== confirmPassword) return { error: 'Las contraseñas no coinciden.' }
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }

  // Strength validation
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return { error: 'La contraseña debe tener mayúsculas, minúsculas, números y un carácter especial (!@#$...).' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'No autenticado.' }

  // Update password in Supabase Auth (server-side only — Zero Trust)
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  // Mark must_change_password = false (it's being set now, not reset)
  await supabase.from('users').update({ must_change_password: false }).eq('id', user.id)

  // Update onboarding step to 3 (Services)
  await supabase
    .from('tenants')
    .update({ onboarding_step: 3 })
    .eq('owner_id', user.id)

  return { success: true }
}

// ─── Check if user must change password (called at login redirect) ─────────────
export async function checkMustChangePasswordAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { mustChange: false }

  const { data } = await supabase.from('users').select('must_change_password, role').eq('id', user.id).single()
  return {
    mustChange: data?.must_change_password === true,
    role: data?.role,
  }
}

// ─── SUPERADMIN: Force reset a master's password ─────────────────────────────
export async function adminResetMasterPasswordAction(targetUserId: string, note?: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'No autenticado.' }

  // Verify caller is SUPERADMIN
  const { data: adminUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (adminUser?.role !== 'SUPERADMIN') return { error: 'Sin permisos.' }

  // Verify target is a MASTER
  const { data: targetUser } = await supabase.from('users').select('role').eq('id', targetUserId).single()
  if (targetUser?.role !== 'MASTER') return { error: 'Solo puedes resetear contraseñas de Masters.' }

  // Generate a secure temporary password
  const tempParts = [
    Math.random().toString(36).slice(2, 6).toUpperCase(),
    Math.random().toString(36).slice(2, 6),
    Math.floor(1000 + Math.random() * 9000),
    ['!', '@', '#', '$', '%'][Math.floor(Math.random() * 5)],
  ]
  const tempPassword = tempParts.join('')

  // Use Admin API to reset password (bypasses auth flow)
  const admin = adminClient()
  const { error: resetError } = await admin.auth.admin.updateUserById(targetUserId, {
    password: tempPassword,
  })
  if (resetError) return { error: resetError.message }

  // Mark must_change_password flag
  await admin.from('users').update({
    must_change_password: true,
    password_reset_by: user.id,
    password_reset_at: new Date().toISOString(),
  }).eq('id', targetUserId)

  // Audit log
  await supabase.from('password_reset_log').insert({
    target_user_id: targetUserId,
    reset_by: user.id,
    reset_type: 'admin_reset',
    note: note || 'Reset manual desde el panel admin.',
  })

  return { success: true, tempPassword }
}

// ─── Support ticket for password help (Master forgot password) ────────────────
export async function createPasswordSupportTicketAction(email: string, message: string, tenantPlan?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('support_tickets').insert({
    user_id: user?.id || null,
    email,
    type: 'password_reset',
    message,
    tenant_plan: tenantPlan || 'unknown',
    status: 'open',
    priority: 'high', // password resets are always high priority
  })

  if (error) return { error: error.message }

  // Send notification email to support (via Resend)
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'StylerNow Sistema <no-reply@stylernow.co>',
      to: 'soporte@stylernow.co', // support email
      subject: `[TICKET] Reset de contraseña Master — ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 24px;">
          <h2 style="color:#1A1A1A">Nuevo Ticket de Soporte</h2>
          <p><strong>Tipo:</strong> Reset de contraseña (Master)</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Plan:</strong> ${tenantPlan || 'N/A'}</p>
          <p><strong>Mensaje:</strong> ${message}</p>
          <p><strong>Prioridad:</strong> Alta</p>
          <hr/>
          <p style="color:#888;font-size:12px">StylerNow · Sistema de soporte automático</p>
        </div>
      `,
    })
  } catch (_) { /* Non-blocking: ticket was created even if email fails */ }

  return { success: true }
}
