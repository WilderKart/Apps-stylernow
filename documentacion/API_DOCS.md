# API DOCS - StylerNow Integrations

StylerNow utiliza primariamente Supabase Client para interacción DB directa con RLS. Para operaciones seguras de servidor se utilizan Edge Functions y APIs de terceros.

## 1. Supabase Edge Functions
Ubicación: `supabase/functions/`

### `create-promotion`
Invocada por el MASTER. Se asegura de validar que la barbería tenga plan activo.
- **Req:** `auth token`, `barberia_id`, `titulo`, `descuento`, `tipo`.
- **Res:** `200 OK` (Insert en tabla Promociones).

### `send-appointment-reminder`
Cron job (pg_cron) o Edge Function programada.
- **Acción:** Dispara llamadas a la API de **Resend** y Envía Notificaciones Push vía Expo.

## 2. Integración: Resend
Se utiliza para notificaciones transaccionales.

- **Confirmación de Cita:** Al concretar una reserva, envía un HTML template minimalista confirmando fecha, hora y barbero.
- **Recordatorios:** Enviados 2 horas antes de la cita.
- **Marketing AI (Plan Prestige/Signature):** Emails masivos con diseño blanco/negro promocionando servicios.

*API Key:* Gestionada en entorno de variables de servidor Vercel.

## 3. Integración Push: Expo Push Notifications
- Las cuentas de cliente almacenan el `pushToken` en Supabase Club.
- Cuando una reserva es cancelada o creada, el Edge Function hace POST a `https://exp.host/--/api/v2/push/send`.
