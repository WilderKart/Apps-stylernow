# FLUJOS DE USUARIO - UX ARCHITECTURE

Este documento describe la navegación y lógica de interacción para cada rol en **StylerNow**.

---

## 👑 1. Flujo del Rol: Master (Dueño de Barbería)

El flujo del Master se enfoca en el **Onboarding** y la **Administración**.

### 🔄 Diagrama de Flujo: Onboarding & Dashboard
```mermaid
graph TD
    A[Inicio: Landing Page] -->|Click 'Crear Barbería'| B[Registro / Login]
    B --> C[Paso 1: Datos Básicos Barbería]
    C -->|Nombre, Ciudad, Mapa/Dirección| D[Paso 2: Selección de Servicios]
    D -->|Usar Predeterminados o Crear Custom| E[Paso 3: Subida de Logos/Fotos]
    E -->|Máx 5MB: Logo, Exterior, Interior| F[Paso 4: Verificación Email OTP]
    F -->|Enviar Código 4-6 Dígitos| G[Paso 5: Crear Contraseña Segura]
    G --> H[Paso 6: Enviar para Aprobación]
    H -->|Alerta Fundador| I[Dashboard Admin: Estado PENDIENTE]
    I -->|Aprobado por Fundador| J[Dashboard Activo: Periodo Trial 7 Días]
    J --> K[Gestión de Agenda / Barberos]
```

---

## 💈 2. Flujo del Rol: Barbero (Empleado)

El flujo del Barbero está optimizado para dispositivos móviles (Mobile First).

### 🔄 Diagrama de Flujo: Gestión de Turnos
```mermaid
graph TD
    A[Login Barbero] --> B[Dashboard: Vista Agenda de Hoy]
    B --> C{¿Hay Reserva Próxima?}
    C -->|Sí| D[Ver Detalle de Cliente y Servicios]
    C -->|No| E[Esperar / Ver Estadísticas]
    D --> F[Marcar Cliente como ATENDIDO]
    F --> G[Carga de Comisión en su Panel]
```

---

## 🙋‍♂️ 3. Flujo del Rol: Cliente (Usuario Final)

El flujo del cliente está enfocado en la búsqueda rápida y la reserva interactiva.

### 🔄 Diagrama de Flujo: Búsqueda y Reserva
```mermaid
graph TD
    A[Inicio Web / App] --> B[Mapa / Motor de Búsqueda]
    B -->|Localizar o Ingresar Manual| C[Resultados de Barberías Cercanas]
    C -->|Click Barbería| D[Perfil Barbería: Fotos, Info, Servicios]
    D -->|Seleccionar Servicio| E[Seleccionar Barbero y Hora Disponible]
    E --> F[Paso Checkout: Resumen de Reserva]
    F -->|Confirmar| G[Reserva en Estado: POR CONFIRMAR]
    G -->|Master Aprueba| H[Notificación de Reserva Exitosa]
```

---

*Diseñado por la Dirección de UX/UI - Wilbot Ultra*
