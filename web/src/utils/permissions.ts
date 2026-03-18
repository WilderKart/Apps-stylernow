import { createClient } from './supabase/server'

/**
 * Verifica si un usuario tiene un permiso específico dentro de un tenant.
 * Si el usuario es 'founder' en la tabla users, se le concede bypass total.
 * 
 * @throws Error si no está autenticado, no tiene membresía, o no tiene permisos.
 */
export async function assertPermission(userId: string, tenantId: string, permission: string) {
  const supabase = await createClient()

  // 1. Founder Bypass (Acceso Absoluto)
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (userProfile?.role === 'founder') {
    return true; // Bypass total
  }

  // 2. Cargar Membresía (Aislamiento Multi-tenant)
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (!membership) {
    throw new Error("Unauthorized");
  }

  // 3. Verificar Permiso Granular
  const { data: allowed } = await supabase
    .from('role_permissions')
    .select('permission')
    .eq('role', membership.role)
    .eq('permission', permission)
    .maybeSingle()

  if (!allowed) {
    throw new Error("Forbidden");
  }

  return true;
}

/**
 * Llama al limitador de tasa embebido en base de datos.
 * @throws Error si se excede el límite.
 */
export async function assertRateLimit(
  userId: string | null, 
  ip: string, 
  action: string, 
  max: number, 
  windowSeconds: number
) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_ip: ip,
    p_action: action,
    p_max: max,
    p_window_seconds: windowSeconds
  })

  if (error) {
    throw new Error("Rate limit exceeded");
  }
  
  return true;
}
