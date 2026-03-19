'use server'

import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── Generate and send OTP code via Resend ───────────────────────────────────
export async function sendEmailOtpAction(email: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'No autenticado' }

  // Generate OTP via Supabase function (6-digit, stored in DB)
  const { data: code, error: rpcError } = await supabase.rpc('create_email_otp', {
    p_email: email,
    p_user_id: user.id,
  })
  if (rpcError || !code) return { error: 'No se pudo generar el código. Intenta de nuevo.' }

  // Send email via Resend (cheapest: free tier = 3000 emails/mes)
  const { error: emailError } = await resend.emails.send({
    from: 'StylerNow <no-reply@stylernow.com>',
    to: email,
    subject: `${code} es tu código de verificación — StylerNow`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
        <div style="margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; background: #1A1A1A; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="color: white; font-size: 24px;">✂️</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #1A1A1A; margin: 0 0 8px;">StylerNow</h1>
          <p style="color: #6B7280; font-size: 14px; margin: 0;">Verificación de correo electrónico</p>
        </div>
        
        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Usa el siguiente código para verificar tu correo electrónico. El código expira en <strong>15 minutos</strong>.
        </p>
        
        <div style="background: #F9FAFB; border: 2px solid #E5E7EB; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #1A1A1A; margin: 0; font-family: 'Courier New', monospace;">${code}</p>
        </div>
        
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          Si no solicitaste este código, ignora este correo. Por seguridad, nunca compartas este código con nadie.
        </p>
        
        <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 24px 0;" />
        <p style="color: #D1D5DB; font-size: 11px; text-align: center; margin: 0;">StylerNow · Plataforma SaaS para Barberías</p>
      </div>
    `,
  })

  if (emailError) {
    console.error('Resend Error:', emailError)
    return { error: 'No se pudo enviar el correo. Verifica que la dirección sea válida.' }
  }
  return { success: true }
}

// ─── Verify OTP code entered by the user ─────────────────────────────────────
export async function verifyEmailOtpAction(email: string, code: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { valid: false, reason: 'not_authed' }

  const { data, error } = await supabase.rpc('verify_email_otp', {
    p_email: email,
    p_code: code.trim(),
    p_user_id: user.id,
  })

  if (error) return { valid: false, reason: 'server_error' }
  return data as { valid: boolean; reason?: string }
}
