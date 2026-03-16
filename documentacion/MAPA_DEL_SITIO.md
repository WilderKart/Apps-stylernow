# MAPA DEL SITIO - StylerNow

El flujo de usuario está dividido radicalmente entre el **Panel Administrativo (Dueños/Staff)** y la **App Cliente (Usuarios Finales)**.

## 1. Web App (PWA & Panel Admnistrativo)

### `/:home` (Landing PWA)
- `/ingresar` (Login/Registro)
- Autenticación multifactor/Magic Link (Supabase Auth).

### `/:dashboard` (Para Master y Manager)
- `/dashboard/resumen` (Kpis, Citas del día, Ingresos).
- `/dashboard/agenda` (Visualización de calendario, Barberos y Horarios).
- `/dashboard/barberos` (Gestión de staff, % comisiones, Propinas, Insignias).
- `/dashboard/marketing` (Promociones Inteligentes, Push Notifications y Resend).
- `/dashboard/finanzas` (Módulo exclusivo PRESTIGE/SIGNATURE, comisiones detalladas).
- `/dashboard/configuracion` (Brand White-label, Subir Logos, Editar Paleta Monocromática).

### `/:staff` (Para Barberos)
- `/staff/mi-agenda` (Visualizar citas asignadas).
- `/staff/mis-ingresos` (Comisiones generadas, RLS activado para ocultar otras ganancias).
- `/staff/mi-perfil` (Ver Insignia actual, Actualizar Especialidades y Fotos a *My Look*).

---

## 2. Mobile App (Clientes Finales)

### Navegación Principal (React Navigation - Tabs)
- **Home (`/home`)**:
  - Buscador tipo "Uber" por geolocalización o nombre de barbería.
  - Banner dinámico de Ofertas y Promociones Activas según la barbería.
- **Reservas (`/reservas`)**:
  - Historial de citas pasadas.
  - Citas Próximas con código QR para Check-in.
- **Perfil (`/perfil`)**:
  - Gestión de Membresías.
  - Fidelización (Programa de Puntos).
  - Métodos de Pago Gardados.

### Flujo de Reserva
1. `Buscar Barbería` → `Ver Catálogo y Estilos (My Look)`
2. `Seleccionar Barbero` (Ver Especialidad e Insignia: Artesano/Pro/Expert).
3. `Seleccionar Servicio/Combo` (Precios dinámicos/Promociones).
4. `Seleccionar Horario`
5. `Pagar Anticipo` → Generar Reserva → Envío de SMS/Email (Resend).
