# 🗺️ MAPA DEL SITIO Y ENRUTAMIENTO POR ROL (V10.7.2)

Este documento detalla la estructura completa de rutas de **StylerNow**, especificando accesos, flujos de autenticación (Zero Trust) y operaciones permitidas para cada rol dentro del ecosistema.

---

## 🔐 1. FLUJO DE AUTENTICACIÓN (Zero Trust Fintech)

El sistema opera con control estricto desde el backend, asegurando que ningún usuario salte etapas de validación.

| Evento / Acción | Ruta Destino | Propósito / Acción Permitida |
| :--- | :--- | :--- |
| **Registro (Submit)** | `/auth/register` | Formula datos de acceso (`manager`/`barbero`). Guarda perfiles pre-activados. |
| **Confirmación de Email** | `/auth/callback` | Valida código Supabase. **Auto-SignOut** obligatorio para evitar entrada ciega. |
| **Login Segmentado** | `/auth/login?role=[rol]` | Despliega formulario personalizado según rol (`shop_owner`, `barber`, `client`). |

---

## 👔 2. ROL: Manager / Dueño de Barbería (`manager`)
Responsable de la administración del local, staff, promociones y flujos financieros.

### 📍 Fase 1: Onboarding (Sin Local Creado)
| Ruta de Acceso | Qué se puede hacer / Propósito |
| :--- | :--- |
| `📂 /onboarding` | Formulario de creación de Barbería. Ingresa Nombre, Dirección, Geolocalización, Teléfono y NIT. |
| `📂 /onboarding/status` | Vista de espera. Despliega estado: **"En Revisión"**. Bloquea accesos hasta aval de `admin`. |

### 📍 Fase 2: Consolidado (Barbería Activa)
| Ruta de Acceso | Qué se puede hacer / Propósito |
| :--- | :--- |
| `📂 /dashboard` | **KPIs y Resumen**: Facturación del día, citas activas y rendimiento de staff. |
| `📂 /dashboard/agenda` | **Calendario Global**: Asignar citas, mover horarios, registrar bloqueos de Agenda. |
| `📂 /dashboard/barberos` | **Staff Management**: Comisiones, propinas, insignias (Artesano, Pro, Expert). |
| `📂 /dashboard/marketing` | **Crecimiento**: Crear descuentos, cupones y programar notificaciones Push (Resend). |
| `📂 /dashboard/finanzas` | **Cuentas**: Exclusivo para auditorías de ganancias, pagos a staff y corte de caja. |

---

## 💈 3. ROL: Barbero Staff (`barbero`)
Focado en la visualización de su propio flujo de trabajo sin visibilidad de datos globales.

| Ruta de Acceso | Qué se puede hacer / Propósito |
| :--- | :--- |
| `📂 /staff/mi-agenda` | Ver citas asignadas en tiempo real. Registrar "Servicio Completado". |
| `📂 /staff/mis-ingresos` | Desglose de comisiones acumuladas y propinas. **RLS activado** (no lee otros barberos). |
| `📂 /staff/mi-perfil` | Ver rango de insignia actual, actualizar especialidades y fotos para portafolio. |

---

## 📱 4. ROL: Cliente (`cliente`)
Usuarios finales que consumen el servicio de reserva y fidelidad.

| Ruta de Acceso | Qué se puede hacer / Propósito |
| :--- | :--- |
| `📂 /cliente` | **Home PWA**: Buscador geolocalizado ("Tipo Uber") para dar con barberías cercanas. |
| `📂 /cliente/reservas` | Historial de citas. Citas próximas con código QR de check-in rápido. |
| `📂 /cliente/perfil` | Gestión de suscripción, pasarelas de pago y saldo de puntos de fidelización. |

---

## 👑 5. ROL: Administrador General (`admin`)
Módulo backoffice de control de tenants y auditoría.

| Ruta de Acceso | Qué se puede hacer / Propósito |
| :--- | :--- |
| `📂 /admin` | Listado de barberías nacientes pendientes de aprobación. Pulsar **"Aprobar"** / **"Rechazar"**. |
| `📂 /admin/soporte` | Gestión de tickets, auditorías de logs de seguridad y bloqueo preventivo de tenants. |
