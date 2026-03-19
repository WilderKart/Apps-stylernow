'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { assertPermission, assertRateLimit } from '@/utils/permissions'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// Service-role client for bypassing RLS on admin actions
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Check anti-abuse: document, phone, email uniqueness
export async function checkTrialEligibilityAction(document: string, phone: string, email: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('check_trial_eligibility', {
    p_document: document,
    p_phone: phone,
    p_email: email,
  })
  if (error) return { eligible: false, reason: 'server_error' }
  return data as { eligible: boolean; reason?: string }
}

// Upload image to Supabase Storage (called from client with File object serialized as base64)
export async function uploadImageAction(
  base64: string,
  mimeType: string,
  bucket: 'barberia-media' | 'servicios-custom',
  filename: string
): Promise<{ url: string | null; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { url: null, error: 'No autenticado' }

  // Decode base64
  const buffer = Buffer.from(base64, 'base64')
  if (buffer.length > 5 * 1024 * 1024) {
    return { url: null, error: 'La imagen no puede superar los 5 MB' }
  }

  const path = `${user.id}/${Date.now()}_${filename}`
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mimeType,
    upsert: true,
  })

  if (error) return { url: null, error: error.message }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: publicUrl }
}

// Step 1 — Create tenant with identity verification + anti-abuse + geo
export async function createTenantAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'No autenticado' }

  const name = formData.get('name') as string

  const city = formData.get('city') as string
  const phone = formData.get('phone') as string

  // --- Anti-duplicado Tenant (V10.6.1) ---
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id, status')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (existingTenant) {
    // 🛡️ Sanar membresías huérfanas de pruebas previas
    await supabase
      .from('memberships')
      .update({ tenant_id: existingTenant.id })
      .eq('user_id', user.id);

    // Retornar éxito y el tenant para que la UI redirija según el status
    return { success: true, tenant: existingTenant }
  }


  const address = formData.get('address') as string
  const email = (formData.get('email') as string) || user.email || ''
  const documentType = formData.get('document_type') as string
  const documentNumber = formData.get('document_number') as string
  const logoUrl = formData.get('logo_url') as string | null
  const photoExteriorUrl = formData.get('photo_exterior_url') as string | null
  const photoInteriorUrl = formData.get('photo_interior_url') as string | null
  const lat = parseFloat(formData.get('lat') as string || '0') || null
  const lng = parseFloat(formData.get('lng') as string || '0') || null

  // --- Anti-abuse check ---
  const eligibility = await checkTrialEligibilityAction(documentNumber, phone, email)
  if (!eligibility.eligible) {
    const messages: Record<string, string> = {
      document_exists: 'Este número de documento ya fue usado en una prueba gratuita.',
      phone_exists: 'Este teléfono ya fue asociado a una prueba gratuita.',
      email_exists: 'Este correo ya tiene una prueba gratuita activa.',
    }
    return { error: messages[eligibility.reason || ''] || 'Ya tienes una prueba gratuita registrada.' }
  }

  // Get IP and user-agent from request headers
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Build slug
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .trim()

  const { data: existing } = await supabase.from('tenants').select('id').eq('slug', slug).single()
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      name, slug: finalSlug, owner_id: user.id,
      plan: 'FREE', status: 'PENDING_REVIEW',
      address, city, country: 'CO', phone,
      email, logo_url: logoUrl,
      photo_exterior_url: photoExteriorUrl,
      photo_interior_url: photoInteriorUrl,
      lat, lng,
      document_type: documentType,
      document_number: documentNumber,
      onboarding_step: 2,
      onboarding_completed: false,
    })
    .select().single()

  if (error) return { error: error.message }

  // Register trial to prevent abuse
  await supabase.from('trial_registrations').insert({
    document_type: documentType,
    document_number: documentNumber,
    phone, email,
    ip_address: ipAddress,
    user_agent: userAgent,
    user_id: user.id,
    tenant_id: tenant.id,
  })

  // Update user role to MASTER
  await supabase.from('users').update({ role: 'master' }).eq('id', user.id)


  // 🛡️ CAPA 1: Vincular membresía con la barbería creada (V10.7 - Zero Trust)
  const { error: upsertMemberError } = await supabase
    .from('memberships')
    .upsert({ 
      user_id: user.id, 
      tenant_id: tenant.id, 
      role: 'master' 
    })

  if (upsertMemberError) {
     console.error('[createTenantAction] Error vinculando membresía:', upsertMemberError);
     return { error: 'Inconsistencia de Seguridad: Error al registrar tu membresía administrativa.' }
  }



  return { success: true, tenant }
}

// Step 2 — Add services (from catalog or custom)
// ZERO TRUST v4: tenantId is NOT accepted from clients — resolved server-side from session
export async function addServicesToTenantAction(
  selectedServices: Array<{
    catalog_id?: string
    name: string
    price: number
    duration_minutes: number
    category?: string
    image_url?: string
  }>
) {
  const supabase = await createClient()
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // ① Autenticación real — nunca confiar en parámetros del request
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // 🛡️ CAPA 4: Anti-Abusos - Rate Limit por IP y Usuario (10 peticiones / minuto)
  try {
    await assertRateLimit(user?.id || null, ipAddress, 'services.create', 10, 60)
  } catch (err: any) {
    return { error: 'Límite de peticiones excedido. Intenta más tarde.' }
  }

  if (authError || !user) return { error: 'No autenticado' }

  // ② Resolver tenant desde el owner_id — el cliente NUNCA envía el tenantId
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (tenantError) return { error: 'Error al verificar tu barbería.' }
  if (!tenant) return { error: 'No tienes una barbería registrada.' }

  // 🛡️ Autocurado (Self-Healing): Garantizar que el dueño tenga membresía administrativa
  const admin = getServiceClient()
  const { error: upsertError } = await admin
    .from('memberships')
    .upsert({
      user_id: user.id,
      tenant_id: tenant.id,
      role: 'master'
    }, { onConflict: 'tenant_id,user_id' })

  if (upsertError) {
    console.error('[addServicesToTenantAction] Autocurado falló:', upsertError)
    return { error: 'Inconsistencia de Seguridad: Error al otorgar tu membresía administrativa.' }
  }


  // 🛡️ CAPA 3: RBAC Granular - Verificar Permiso 'services.create'
  try {
    await assertPermission(user.id, tenant.id, 'services.create')
  } catch (err: any) {
    return { error: err.message }
  }

  // ③ Validar el array de servicios
  if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
    return { error: 'Debes seleccionar al menos un servicio.' }
  }
  if (selectedServices.length > 50) {
    return { error: 'No puedes agregar más de 50 servicios a la vez.' }
  }

  // ④ Sanitizar y validar cada item
  const validationErrors: string[] = []
  const sanitized = selectedServices.map((s, i) => {
    const name = s.name?.trim().replace(/\s+/g, ' ') ?? ''
    const price = Number(s.price)
    const duration = Number(s.duration_minutes)

    if (!name || name.length === 0) validationErrors.push(`Servicio #${i + 1}: nombre requerido`)
    if (name.length > 60) validationErrors.push(`Servicio #${i + 1}: nombre excede 60 caracteres`)
    if (!Number.isFinite(price) || price <= 0) validationErrors.push(`"${name}": precio inválido`)
    if (price > 20_000_000) validationErrors.push(`"${name}": precio excede el límite permitido`)
    if (!Number.isFinite(duration) || duration < 15 || duration > 480) {
      validationErrors.push(`"${name}": duración debe estar entre 15 y 480 minutos`)
    }

    return {
      name,
      price,
      duration_minutes: duration,
      catalog_id: s.catalog_id || null,
      image_url: s.image_url || null,
    }
  })

  if (validationErrors.length > 0) {
    return { error: validationErrors[0] }
  }

  // ⑤ Deduplicar semánticamente dentro del lote (case-insensitive)
  const seen = new Set<string>()
  const deduped = sanitized.filter(s => {
    const key = s.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // ⑥ Inserción transaccional vía RPC (atómica — si uno falla, rollback total)
  const { error: rpcError } = await supabase.rpc('insert_services_batch', {
    p_tenant_id: tenant.id,
    p_services: deduped,
  })

  if (rpcError) {
    // ⑦ Captura de error de duplicado con mensaje UX claro
    if (rpcError.code === '23505' || rpcError.message?.includes('unique_service_name_per_tenant')) {
      return { error: 'Uno o más servicios ya existen en tu barbería.' }
    }
    console.error('[addServicesToTenantAction] RPC error:', rpcError)
    return { error: `Error al guardar servicios: ${rpcError.message}` }
  }

  // ⑧ Audit log persistente y enriquecido
  const adminClient = getServiceClient()
  await adminClient.from('audit_logs').insert({
    user_id: user.id,
    tenant_id: tenant.id,
    action: 'services_bulk_insert',
    context: {
      count: deduped.length,
      service_names: deduped.map(s => s.name),
      ip: ipAddress,
      user_agent: userAgent,
    },
  })

  // Update onboarding step to 4 (Schedules)
  await supabase
    .from('tenants')
    .update({ onboarding_step: 4 })
    .eq('id', tenant.id)

  return { success: true }
}

// Step 3 — Complete onboarding (Strict Fintech with T&C, Audit & Resend)
export async function completeTenantOnboardingAction(tenantId: string, termsVersion: string = '1.0.0', termsEvidenceRaw: string = '') {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'No autenticado' }

  const termsEvidence = `${termsEvidenceRaw} | IP fallback`;
  const adminClient = getServiceClient()

  // 1. Guardar T&C y cambiar Estado Strict ('pending') a nivel BD (bypass RLS por seguridad si owner no fue asignado aun, pero se chequea owner_id)
  const { error } = await adminClient
    .from('tenants')
    .update({ 
      onboarding_completed: true, 
      onboarding_step: 4,
      status: 'pending',
      terms_accepted_at: new Date().toISOString(),
      terms_version: termsVersion,
      terms_evidence: termsEvidence
    })
    .eq('id', tenantId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  // 2. Crear Log de Auditoría
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    target_id: tenantId,
    action: 'TENANT_CREATED_PENDING',
    metadata: {
      termsVersion,
      termsEvidence
    }
  })

  // 3. Notificación IN-APP para Administradores (o se guarda temporal si no hay admins unificados, aquí solo como ejemplo si admin = rol founder)
  // Opcional según esquema.

  // 4. Notificaciones por Email (Resend)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const { data: tenantData } = await adminClient.from('tenants').select('name, email').eq('id', tenantId).single()
      
      // Correo al ADMIN (Dueño del ecosistema) notificando nueva solicitud
      const adminEmail = "soportestylernow@gmail.com" // o process.env.ADMIN_EMAIL
      await resend.emails.send({
        from: 'StylerNow OS <noreply@notificaciones.stylernow.co>',
        to: adminEmail,
        subject: `⚠️ Nueva Barbería Pendiente: ${tenantData?.name}`,
        html: `<p>El master de la barbería <strong>${tenantData?.name}</strong> ha finalizado el onboarding y aceptado T&C.</p><p>Revisa tu panel de administración (Super Admin) para auditar la información y aprobarla o rechazarla.</p>`
      })

      // Correo al MASTER notificando que está bajo revisión
      if (tenantData?.email) {
         await resend.emails.send({
           from: 'StylerNow Team <noreply@notificaciones.stylernow.co>',
           to: tenantData.email,
           subject: 'Tu solicitud está en revisión ⏳',
           html: `<p>Hola,</p><p>Hemos recibido toda la información y hemos registrado la aceptación de nuestros Términos y Condiciones. Nuestro equipo está revisando tu cuenta de <strong>${tenantData.name}</strong> para activarla lo más pronto posible (Máximo 24h).</p><p>Te notificaremos por este mismo medio tan pronto aprueben tu Barbería.</p>`
         })
      }
    } catch (e) {
      console.error("No se pudieron enviar notificaciones de onboarding:", e)
    }
  }
  revalidatePath('/dashboard')
  return { success: true }
}

// Fetch promo banners for tenant plan
export async function fetchPromoBannersAction(plan: string = 'FREE') {
  const supabase = await createClient()
  const { data } = await supabase
    .from('promo_banners')
    .select('*')
    .eq('is_active', true)
    .eq('target_plan', plan)
    .order('sort_order')
  return data || []
}
