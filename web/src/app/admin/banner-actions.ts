'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type PromoBanner = {
  id: string
  title: string
  subtitle?: string
  cta_label: string
  cta_url: string
  image_url?: string
  bg_color: string
  text_color: string
  is_active: boolean
  sort_order: number
  target_plan: string
}

// Fetch all promo banners (admin)
export async function fetchAllBannersAction(): Promise<{ banners: PromoBanner[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('promo_banners')
    .select('*')
    .order('sort_order')

  if (error) return { banners: [], error: error.message }
  return { banners: data as PromoBanner[] }
}

// Create new banner
export async function createBannerAction(banner: Omit<PromoBanner, 'id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('promo_banners').insert({ ...banner, created_by: user.id })
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// Update existing banner
export async function updateBannerAction(id: string, updates: Partial<PromoBanner>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('promo_banners')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// Delete banner
export async function deleteBannerAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('promo_banners').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// Toggle active status
export async function toggleBannerActiveAction(id: string, isActive: boolean) {
  return updateBannerAction(id, { is_active: isActive })
}

// Reorder banners
export async function reorderBannersAction(updates: Array<{ id: string; sort_order: number }>) {
  const supabase = await createClient()
  const promises = updates.map(u =>
    supabase.from('promo_banners').update({ sort_order: u.sort_order }).eq('id', u.id)
  )
  await Promise.all(promises)
  revalidatePath('/admin')
  return { success: true }
}
