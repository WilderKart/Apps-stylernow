# StylerNow - Premium Barbershop SaaS

StylerNow es una plataforma de software como servicio (SaaS) white-label para barberías. Combina un panel de administración extenso con una aplicación orientada a reservas tipo \"Uber\" para consumidores finales.

## 🚀 Arquitectura del Proyecto

El proyecto está diseñado bajo una arquitectura de **Monorepo lógico** (separado en carpetas de producto) orientada a escalabilidad global.

- **`web/`**: Next.js 15 (App Router), Tailwind CSS, TypeScript. Sirve la Landing Page, el panel de administración (Dashboard) y una Progressive Web App (PWA) instalable.
- **`mobile/`**: React Native (Expo SDK), React Navigation. Compila para iOS y Android ofreciendo una experiencia nativa fluida a clientes y barberos.
- **Backend (Supabase)**: Auth, PostgreSQL, Row-Level Security (RLS) policies y Edge Functions.

## 🛠️ Stack Tecnológico

- **Language:** TypeScript
- **Frontend Web:** Next.js, React, Tailwind CSS, next-pwa
- **Frontend Mobile:** React Native, Expo, React Navigation
- **Database / Auth:** Supabase (Postgres)
- **Mailing & Notifications:** Resend
- **Deployment:** Vercel (Web API), EAS Build (Mobile Apps)

## 📦 Inicialización del Proyecto

### Requisitos
- Node.js >= 18.x
- Npm / Yarn
- CLI de Supabase
- CLI de Expo (`npm install -g eas-cli`)

### Instrucciones Locales Web
```bash
cd web
npm install
npm run dev
```

### Instrucciones Locales Mobile
```bash
cd mobile
npm install
npx expo start
```

### Entorno y Variables
El archivo `.env.local` debe configurarse en `web/` con:\n- `NEXT_PUBLIC_SUPABASE_URL`\n- `NEXT_PUBLIC_SUPABASE_ANON_KEY`\n- `RESEND_API_KEY`
