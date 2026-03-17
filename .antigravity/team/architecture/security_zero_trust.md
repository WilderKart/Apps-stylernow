# ARQUITECTURA DE SEGURIDAD ZERO TRUST - STYLER NOW

Este documento detalla las medidas de seguridad arquitectónicas que garantizan la integridad de la información y la prevención de fraudes, siguiendo el principio de **Cero Confianza** (Zero Trust).

---

## 🔒 1. Validaciones 100% del Lado del Servidor (Server-Side)

Bajo ninguna circunstancia la lógica de negocio crítica residirá en el cliente (App o Web). El cliente es solo una interfaz de visualización y envío de intenciones.

### 📋 Reglas de Validación de Negocio
- **Cálculo de Tarifas y Descuentos**: El precio final de una reserva o producto **JAMÁS** se calcula en el cliente. Se valida en el backend al procesar el Checkout.
- **Validación de Disponibilidad**: El cliente no puede "forzar" un horario. Se verifica contra la base de datos en tiempo real mediante *Edge Functions* antes de confirmar la reserva.
- **Creación de Barberías/Servicios**: El cliente solo envía el formulario. El backend valida límites de plan (Trial vs Premium), tamaños de archivo (max 5MB) y sanidad de datos.

---

## 🛡️ 2. Aislamiento de Tenants y Menor Privilegio (RLS)

Cada tabla en Supabase tiene habilitado **Row Level Security (RLS)**. No hay acceso por defecto.

### 🔑 Tabla de Control de Acceso (RBAC)
| Rol | Acceso a `reservas` | Acceso a `ingresos` | Acceso a `configuracion` |
| :--- | :--- | :--- | :--- |
| **Cliente** | Solo Propias (lectura/creación) | Denegado | Lectura básica |
| **Barbero** | Solo Asignadas (lectura) | Denegado | Denegado |
| **Manager** | Todas de la barbería (lectura/edición) | Lectura total | Lectura |
| **Master** | Control total de su Tenant | Control total | Control total (Modificación) |
| **SuperAdmin** | Lectura Global (Auditoría) | Lectura Global | Solo Banners / Soporte |

> [!IMPORTANT]
> Las políticas RLS de Supabase utilizan `auth.uid()` y un mapeo de roles en una tabla `perfiles_roles` para filtrar dinámicamente cada fila.

---

## 📝 3. Logs de Auditoría Obligatorios (Audit Trails)

Cualquier cambio en tablas críticas debe ser rastreado.

### ⚙️ Implementación en Base de Datos
- **Tabla**: `audit_logs` (`id`, `user_id`, `tabla`, `accion`, `valores_anteriores`, `valores_nuevos`, `created_at`).
- **Trigger**: Se ejecutará `AFTER INSERT OR UPDATE OR DELETE` en las siguientes tablas:
  - `reservas` (Cambios de estado, barbero, hora).
  - `pagos` (Dinero transaccionado, comisiones).
  - `configuracion` (Precios de servicios, desactivación de banners).
  - `perfiles_roles` (Asignación de permisos).

---

## 🌐 4. Seguridad en APIs y Comunicaciones

- **Cifrado**: End-to-End Encryption (HTTPS/WSS) en tránsito.
- **Tokens**: Autenticación vía JWT (JSON Web Tokens) de corta duración de Supabase.
- **Validación de Archivos**: Al subir logos o fotos (Exterior/Interior), el backend verifica el MIME-type y tamaño (max 5MB) antes de guardarlo en el Bucket de Supabase Storage, aplicando RLS al Bucket.

---

*Diseñado por la Dirección de Seguridad - Wilbot Ultra*
