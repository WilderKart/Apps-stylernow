'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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
  await supabase.from('users').update({ role: 'MASTER' }).eq('id', user.id)

  return { success: true, tenant }
}

// Step 2 — Add services (from catalog or custom)
export async function addServicesToTenantAction(
  tenantId: string,
  selectedServices: Array<{
    catalog_id?: string
    name: string
    price: number
    duration_minutes: number
    category: string
    image_url?: string
  }>
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'No autenticado' }

  const toInsert = selectedServices.map(s => ({
    tenant_id: tenantId,
    name: s.name,
    price: s.price,
    duration_minutes: s.duration_minutes,
    active: true,
    catalog_id: s.catalog_id || null,
    image_url: s.image_url || null,
  }))

  const { error } = await supabase.from('services').insert(toInsert)
  if (error) return { error: error.message }
  return { success: true }
}

// Step 3 — Complete onboarding
export async function completeTenantOnboardingAction(tenantId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('tenants').update({ onboarding_completed: true, onboarding_step: 4 })
    .eq('id', tenantId).eq('owner_id', user.id)

  if (error) return { error: error.message }
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
