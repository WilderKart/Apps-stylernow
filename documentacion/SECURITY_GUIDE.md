# SECURITY GUIDE - ZERO TRUST FINTECH ARCHITECTURE

El proyecto StylerNow debe cumplir con estándares bancarios de integridad de información al gestionar ingresos transaccionales y comisiones de múltiples sedes. 

## 1. Principio fundamental: Cero Confianza
Ni siquiera los usuarios internos de la barbería confían en el backend por defecto ni el backend confía en frontend.

- **Supabase Row Level Security (RLS)**: Cada tabla en Supabase **DEBE** tener RLS activado.\n  - Ejemplo `barberias`: Solo leídas si pertenecen al inquilino que las creó.\n  - Ejemplo `reservas`: Solo modificadas por los usuarios que participan de ella (El barbero asignado o el cliente autor).\n- Las reglas RLS previenen la escalada de privilegios cruzada (Tenant isolation).\n\n## 2. API Security\n- Prohibida la lógica de tarifas/promociones o asignación en el **cliente**. Todo descuento (StylerNow Smart Promotions) se calcula dinámicamente o se valida a través de *Secure Edge Functions* al llamar el Checkout final.\n- Los keys de Supabase Cliente (*anon key*) limitan privilegios usando RLS, la manipulación de base de datos cruda solo puede provenir de Service Roles autorizados protegidos por un KMS sólido (Vercel env variables protegidas).\n\n## 3. OWASP Top 10\n- El ORM de Supabase parametriza automáticamente las queries evadiendo Inyección SQL.\n- El almacenamiento de Estado de Autenticación usa cookies HTTPonly en entorno web vía SSR.\n- Prevención XSS por sanitización nativa JSX incorporada en las librerías Frontend (React/Next).
