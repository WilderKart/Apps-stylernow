'use server';

import { createClient } from '@/utils/supabase/server'

export async function finalizarRegistroAction(formData: {
  nombre: string;
  email: string;
  celular: string;
  contrasena: string;
  role: string;
}) {
  const supabase = await createClient()

  try {
    // 1. Validar Sesión Real (Doble Capa)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Sesión no válida o expirada. Por favor, vuelve a confirmar tu correo.')
    }

    // 2. Validación Cruzada (Cross-Check Email)
    if (formData.email.toLowerCase() !== user.email?.toLowerCase()) {
      throw new Error('El correo del formulario no coincide con el correo validado.')
    }

    // 3. Validación de Contraseña (Backend Guard)
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|`~]).{8,}$/
    if (!passRegex.test(formData.contrasena)) {
      throw new Error('La contraseña no cumple con los requisitos de seguridad (8+ caracteres, 1 mayúscula, 1 número/símbolo).')
    }

    // 4. Transaccionalidad Rígida - Paso 1: Fijar contraseña
    // COMENTADO: Ahora .signUp() ya fija la contraseña desde el principio. Evitamos colisión PKCE.

    // 5. Idempotencia: Removido el early exit para garantizar que .update() siempre sobreescriba.



    // 6. Transaccionalidad Rígida - Paso 2 & 3: Insertar en base de datos (con Retry)
    let dbSuccess = false
    let lastError = null

    for (let i = 0; i < 2; i++) {
       try {
          // Validación de Celular (V10.6.3)
          const cleanCel = formData.celular.replace(/\D/g, '')
          if (cleanCel.length > 14) {
             throw new Error('El celular no puede tener más de 14 dígitos.')
          }

          // Insertar Usuario
          // Removido para evitar duplicidad (V10.7.1)

           // UPDATE explícito para pisar el default del trigger (V10.7.1)
           const { error: insertUserError } = await supabase
             .from('usuarios')
             .update({
               nombre: formData.nombre,
               celular: cleanCel,
               role: formData.role
             })
             .eq('auth_id', user.id)



          if (insertUserError) throw insertUserError

          // NOTA: Se remueve la inserción de Membresía aquí porque la tabla requiere 'tenant_id'.
          // La membresía se creará en el Onboarding junto con su respectiva barbería.
          if (formData.role === 'shop_owner' || formData.role === 'manager' || formData.role === 'owner') {
             const { error: insertMemberError } = await supabase
               .from('memberships')
               .insert({
                 user_id: user.id,
                 role: 'owner',
                 tenant_id: null
               })

             if (insertMemberError) {
                // Capturar error de UNIQUE Constraint (23505) (V10.6.2)
                if (insertMemberError.code === '23505' || insertMemberError.message?.includes('unique_user_membership')) {
                   console.log('[finalizarRegistroAction] Membresía ya existe. Continuando flujo.');
                } else {
                   throw insertMemberError;
                }
             }
          }





          dbSuccess = true
          break; // Éxito, salir del bucle
       } catch (err: any) {
          lastError = err
          // Esperar un poco antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 500))
       }
    }

    if (!dbSuccess) {
       await supabase.auth.signOut()
       throw new Error('Error al guardar datos en la base de datos: ' + (lastError?.message || 'Fallo desconocido.'))
    }

    return { success: true }

  } catch (error: any) {
    // IMPORTANTE: NO limpiar localStorage en el Catch. El Fail-Safe de datos se maneja en frontend.
    return { success: false, error: error.message || 'Error desconocido al finalizar el registro.' }
  }
}
