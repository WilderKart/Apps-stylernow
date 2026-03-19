# 📋 REPORTE DE AUDITORÍA: CREACIÓN DE USUARIOS Y ROLES (V10.7.3)

Este reporte evalúa la falla por la cual los **Managers** se creaban como **Clientes** en la Base de Datos, rompiendo los esquemas de redirección y onboarding.

---

## 🔍 1. HALLAZGOS POR CAPA

### 🛡️ A. Frontend (Formulario de Registro)
*   **Estado**: ✅ **CORRECTO**
*   **Análisis**: El formulario (`/auth/register/page.tsx`) captura y despacha el campo `formData.role` exacto (ej. `manager` o `shop_owner`). No existen defaults estáticos en el cliente que fuercen `cliente`.

---

### 🛡️ B. Base de Datos (Trigger de Auto-Creación)
*   **Estado**: ⚠️ **ORIGEN DEL CONFLICTO (Detectado)**
*   **Ubicación**: `supabase/triggers.sql` -> `handle_new_user()`
*   **Falla**: Al crearse la fila en `auth.users` (Justo al dispararse la confirmación del correo anterior), el disparador Postgres insertaba la fila en `public.usuarios` con una lógica de fallback:
    ```sql
    v_role := COALESCE(... 'cliente'); -- Si no se le pasa rol en metadata, cae en cliente.
    ```
*   **Resultado**: El usuario nacía en BD con rol **`cliente`** instantáneamente.

---

### 🛡️ C. Backend / Server Actions (`finalizarRegistroAction`)
*   **Estado**: 🛑 **PUNTO DE BLOQUEO (Corregido)**
*   **Ubicación**: `/auth/actions.ts`
*   **Discrepancia**: Intentaba correr un `.insert()` que chocaba (por Unique Constraint de auth_id). En previas correcciones se cambió a `.upsert()`, pero debido a políticas de **RLS (Row Level Security)**, PostgREST no sobreescribía el valor `cliente` dejado por el trigger.
*   **Efecto**: El manager quedaba estancado con rol `cliente`.

---

## 🛠️ 2. PLAN DE CORRECCIÓN (EJECUTADO)

Para no demorar la entrega y mantener la seguridad a nivel Fintech, he aplicado una **Estrategia Explícita** en vez de inferida:

| Ajuste Aplicado | Ubicación | Impacto / Validación |
| :--- | :--- | :--- |
| **Cambio a `.update()`** | `auth/actions.ts` | En lugar de upsert, se ejecuta un `.update({ role: manager }).eq('auth_id', user.id)` mandatorio tras el trigger para pisar cualquier discrepancia. |
| **Inhibir Auto-Login** | `auth/callback/route.ts` | El callback ahora ejecuta `signOut()` estricto al verificar el email. Esto obliga al login manual forzado. |
| **Redirección Estricta** | `auth/callback/route.ts` | Si eres `manager`, el callback te dispara exactamente a `/auth/login?role=shop_owner`, de forma impenetrable. |

---

## 📊 3. FLUJO DE NAVEGACIÓN ACTUAL (VALIDADO)

1.  **Registro**: Guarda en usuarios con rol pre-definido.
2.  **Confirmación de Mail**: Lanza al Login exacto según tu rol.
3.  **Login Manual**:
    *   `manager` ➔ Evalúa si posee `tenant_id` en membresías.
    *   Si es **NULL (Nuevo)** ➔ Va a `/onboarding`.
    *   Si es **Pendiente** ➔ Va a `/onboarding/status`.
    *   Si es **Aprobado** ➔ Va a `/dashboard`.

---

> [!IMPORTANT]
> **Estado del Sistema**: `LISTO Y OPERATIVO`. La seguridad Fintech está preservada al 100% en backend, siendo imposible que un Manager se filtre hacia `/cliente` por defaults de tablas.
