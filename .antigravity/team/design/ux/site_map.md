# MAPA DE NAVEGACIÓN - SITE MAP (FASE 4)

Este documento detalla la jerarquía de URLs y pantallas para complementar la arquitectura de navegación de **StylerNow**.

---

## 🧭 1. Estructura de Rutas (Sitemap)

### 🔄 Diagrama de Conectividad de Pantallas
```mermaid
graph TD
    A[Landing Page: /] -->|Click| B[Autenticación: /ingresar]
    
    subgraph Onboarding [Flujo Onboarding]
        B -->|Crear Barbería| C[Paso 1: Datos Básicos /onboarding]
        C --> D[Paso 2: Servicios]
        D --> E[Paso 3: Fotos]
        E --> F[Paso 4: OTP Email]
        F --> G[Paso 5: Contraseña]
        G --> H[Paso 6: Enviar]
    end

    subgraph Master [Panel Master]
        H -->|Aprobado| I[Dashboard: /dashboard]
        I --> J[Agenda: /dashboard/agenda]
        I --> K[Equipo: /dashboard/equipo]
        I --> L[Promociones: /dashboard/configuracion]
    end

    subgraph Cliente [Panel Cliente]
        B -->|Registrarse Cliente| M[Mapa Principal: /cliente]
        M --> N[Detalle Barbería: /cliente/barberia/:id]
        N --> O[Reservar/Checkout: /cliente/checkout]
        M --> P[Mis Reservas: /cliente/reservas]
        M --> Q[Mi Perfil: /cliente/perfil]
    end

    subgraph Barbero [Panel Barbero]
        B -->|Login Barbero| R[Dashboard Barbero: /barbero]
        R --> S[Comisiones: /barbero/comisiones]
        R --> T[Ajustes Perfil: /barbero/perfil]
    end

    subgraph Global [Soporte & Global]
        I -.-> U[Soporte Contraseña: /soporte-contrasena]
        R -.-> U
        U --> V[Cambiar Contraseña: /cambiar-contrasena]
    end
```

---

## 🔐 2. Árbol de Accesos por Rol

- **Master / Admin**: `/dashboard`, `/dashboard/agenda`, `/dashboard/equipo`, `/dashboard/configuracion`
- **Barbero/Colaborador**: `/barbero`, `/barbero/comisiones`, `/barbero/perfil`
- **Cliente / Invitado**: `/`, `/cliente`, `/cliente/barberia/[id]`, `/cliente/checkout`, `/cliente/reservas`
- **SuperAdmin**: `/admin` (Gestión de Banners, Reset Contraseñas)

---

*Diseñado por la Dirección de UX/UI - Wilbot Ultra*
