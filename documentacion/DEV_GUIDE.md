# DEVELOPMENT GUIDE

Bienvenido desarrollador a StylerNow. Por favor adhiérate a las siguientes normativas internas para mantener la consistencia del código.

## 1. Monorepo y Scripts
- Utiliza la terminal en en la carpeta `web` o `mobile` según la UI a afectar.
- Preferimos uso de `npm` nativo en lugar de administradores complejos en este stage para iteración rápida de inicio.

## 2. Reglas de Estilo (Linting & Formatting)
- Tailwind: NUNCA uses estilos inline de React fuera de Tailwind salvo cálculos dinámicos de UI.
- Nomenclatura PWA/Web:
  - Archivos de Componente UI: `components/ui/Button.tsx`.
  - Preferir composición de clases de Tailwind: `@apply` en `globals.css` solo para patrones críticos.
  - Para interfaces monocromáticas de la marca: Solo usar variaciones de zinc y neutral (`bg-zinc-50`, `text-zinc-900`) complementadas con un solo color de atención (`green-500` marino suave).
- Arquitectura Limpia: Separación estricta de lógica de acceso a datos (Supabase Client Layers) de los componentes de Vista. NUNCA realizar llamadas lógicas Supabase directamente en componentes presentacionales.

## 3. Branching Model (Git)
Se utiliza Trunk-Based Development:
- `main` está protegida. Todo el desarrollo se hace en las ramas de `feature/*` o `fix/*` y requerirá validación antes de mergear contra `main`.

## 4. Fake Data
> **PELIGRO**: Por directiva de Wilbot, está estrictamente prohibido popular DB Productiva con "Fake Data" sin autorización. Utilizar Supabase local de ser estrictamente necesario, pero preferir uso del entorno en blanco real, documentando la semilla base estricta de ROLES.
