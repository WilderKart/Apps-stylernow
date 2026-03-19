'use server'

import { createClient } from '@/utils/supabase/server'

interface PromoPayload {
  tenantId: string
  title: string
  type: string
  value: number
  schedule: string
  target: string
  logId?: string
}

export async function executePromotionAction(payload: PromoPayload) {
  const supabase = await createClient()

  // Seguridad 1: Auth y RLS
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  // Seguridad 2: Data estricta contra inyección o manipulación de la UI
  const { tenantId, title, type, value, schedule, target, logId } = payload

  if (!['discount', 'campaign', 'flash_sale'].includes(type)) {
    return { error: 'Ataque bloqueado: Tipo de promoción inválida.' }
  }

  const numericValue = Number(value);
  if (isNaN(numericValue) || numericValue > 50 || numericValue < 0) {
    return { error: 'Ataque bloqueado: Descuento mayor al 50% o inválido no autorizado en sistema.' }
  }

  // Precalcula a 30 días
  const validUntilDate = new Date()
  validUntilDate.setDate(validUntilDate.getDate() + 30)

  // Ejecución en la base de datos
  const { data, error } = await supabase.from('promotions').insert({
    tenant_id: tenantId,
    title,
    type,
    discount_value: numericValue,
    schedule_info: schedule,
    target_audience: target,
    valid_until: validUntilDate.toISOString()
  }).select().single()

  if (error) {
    return { error: 'Fallo al ejecutar transacción en base de datos de promociones.' }
  }

  // Opcional: Actualizar el insight log original si logId existe
  if (logId) {
    await supabase.from('ai_insight_logs')
      .update({ status: 'auto-executed' })
      .eq('id', logId)
  }

  return { success: true, data }
}
