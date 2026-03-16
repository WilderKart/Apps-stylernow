# DEPLOYMENT GUIDE

Este documento instruye cómo publicar el ecosistema completo de StylerNow a Producción.

## 1. Web / Dashboard / PWA -> Vercel

Dada la arquitectura en Next.js App Router, el despliegue es idiomático con Vercel.

### Pipeline
1. Conectar repositorio GitHub a Vercel.
2. Root Directory: `web`.
3. Build Command: `npm run build` o `next build`.
4. Establecer las Variables de Entorno en Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `STRIPE_SECRET_KEY`
5. Click **Deploy**. El output generará automáticamente los Service Workers de la PWA.

## 2. Database -> Supabase

Migraciones seguras mediante CLI:
```bash
supabase link --project-ref <YOUR_PROJECT_ID>
supabase db push
supabase functions deploy --no-verify-jwt
```

## 3. Mobile App (iOS / Android) -> EAS (Expo Application Services)

1. En la carpeta `mobile`, inicializar EAS:
   ```bash
   eas init --id <PROJECT_ID>
   ```
2. Build Android (.aab):
   ```bash
   eas build --platform android --profile production
   ```
3. Build iOS (.ipa):
   ```bash
   eas build --platform ios --profile production
   ```
4. **Submit:** Usar `eas submit -p ios/android` para subir a App Store Connect y Google Play Console respectivamente.
