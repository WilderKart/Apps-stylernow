# MAPA DEL SITIO - StylerNow

El flujo de usuario está dividido radicalmente entre el **Panel Administrativo (Dueños/Staff)** y la **App Cliente (Usuarios Finales)**.

## 1. Web App (PWA & Panel Admnistrativo)

### `/:home` (Landing PWA)\n- `/ingresar` (Login/Registro)\n- Autenticación multifactor/Magic Link (Supabase Auth).

### `/:dashboard` (Para Master y Manager)\n- `/dashboard/resumen` (Kpis, Citas del día, Ingresos).\n- `/dashboard/agenda` (Visualización de calendario, Barberos y Horarios).\n- `/dashboard/barberos` (Gestión de staff, % comisiones, Propinas, Insignias).\n- `/dashboard/marketing` (Promociones Inteligentes, Push Notifications y Resend).\n- `/dashboard/finanzas` (Módulo exclusivo PRESTIGE/SIGNATURE, comisiones detalladas).\n- `/dashboard/configuracion` (Brand White-label, Subir Logos, Editar Paleta Monocromática).

### `/:staff` (Para Barberos)\n- `/staff/mi-agenda` (Visualizar citas asignadas).\n- `/staff/mis-ingresos` (Comisiones generadas, RLS activado para ocultar otras ganancias).\n- `/staff/mi-perfil` (Ver Insignia actual, Actualizar Especialidades y Fotos a *My Look*).

---

## 2. Mobile App (Clientes Finales)

### Navegación Principal (React Navigation - Tabs)\n- **Home (`/home`)**:\n  - Buscador tipo \"Uber\" por geolocalización o nombre de barbería.\n  - Banner dinámico de Ofertas y Promociones Activas según la barbería.\n- **Reservas (`/reservas`)**:\n  - Historial de citas pasadas.\n  - Citas Próximas con código QR para Check-in.\n- **Perfil (`/perfil`)**:\n  - Gestión de Membresías.\n  - Fidelización (Programa de Puntos).\n  - Métodos de Pago Gardados.

### Flujo de Reserva\n1. `Buscar Barbería` → `Ver Catálogo y Estilos (My Look)`\n2. `Seleccionar Barbero` (Ver Especialidad e Insignia: Artesano/Pro/Expert).\n3. `Seleccionar Servicio/Combo` (Precios dinámicos/Promociones).\n4. `Seleccionar Horario`\n5. `Pagar Anticipo` → Generar Reserva → Envío de SMS/Email (Resend).
