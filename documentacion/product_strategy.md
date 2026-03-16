# Product Strategy: StylerNow

## 1. Visión del Producto
StylerNow es una plataforma SaaS premium para la gestión y reserva de barberías, diseñada bajo una estética profesional (estilo Uber). Ofrece aplicaciones web y móviles 'mobile first' enfocadas en la simplicidad, la velocidad y una experiencia de usuario de alta gama (blanco y negro predominante, minimalista). \n**La versión web será una PWA (Progressive Web App) y completamente responsiva (optimizada para móvil, tablet, PC y TV)**, instalable desde el navegador. **Las versiones móviles serán aplicaciones nativas publicables en App Store (iOS) y Google Play (Android)**.

## 2. Público Objetivo
- **Barberías y Cadenas:** Que requieren una gestión unificada de sedes, barberos y métricas financieras.
- **Barberos Independientes/Empleados:** Que necesitan visibilidad de sus agendas, gestión de servicios y comisiones.
- **Clientes Finales:** Que buscan una experiencia premium, rápida y confiable para agendar cortes y servicios.

## 3. Problemas que Resuelve
1. **Gestión Ineficiente:** Dificultad para coordinar horarios, comisiones y reservas de manera unificada.
2. **Falta de Fidelización:** Ausencia de membresías y programas de lealtad estructurales.
3. **Poca Visibilidad Online:** Dificultad para las barberías de mostrar una galería (My Look) en un entorno premium.
4. **Falta de Auditoría y Control:** Pagos y contabilidad desordenada, falta de auditoría estricta de acciones.

## 4. Funcionalidades Core por Rol
- **Cliente:** Buscador por mapa (OpenStreetMap), reserva con anticipo (15%), membresías, notificaciones.
- **Master:** Gestión total de sedes, comisiones, reglas de negocio, y mini galería.
- **Manager:** Supervisión de agenda y permisos, sin acceso financiero.
- **Barbero:** Su agenda diaria, control de estados (iniciado, terminado), y comisiones propias.
- **Admin (StylerNow):** Dashboard global, métricas inter-barberías, gestión de banners, control de auditoría Fintech.

## 5. Planes de Suscripción Definidos
El modelo de negocio SaaS funcionará con los siguientes tiers, limitando módulos y recursos según el plan contratado por la barbería:\n\n1. **ESSENTIAL ($49.900 COP):** 1 barbero, 1 sede. Agenda 24/7, CRM, reservas con anticipo, notificaciones. **Incluye Emails automáticos (confirmación/recordatorios) y Push Notifications (vía Resend)**. 50 recordatorios de WhatsApp complementarios, y giftcards. Sin membresías ni reportes avanzados.\n2. **STUDIO ($119.000 COP):** Hasta 5 barberos, 3 sedes. Incluye membresías básicas, inventario, control de comisiones, horarios de staff, propinas digitales. **Incluye Emails automáticos y Push Notifications (vía Resend)**. 100 recordatorios de WA. Soporte por Chat.\n3. **PRESTIGE ($349.000 COP):** Hasta 12 barberos, 5 sedes. Incluye membresías avanzadas, IA en marketing (100 textos/mes), programa de fidelización, galería de cliente \"My Look\", fotos sin marca de agua, y 150 recordatorios de WA. Soporte prioritario.\n4. **SIGNATURE ($599.000 COP):** Hasta 20 barberos, 10 sedes. IA marketing ilimitada, administrador independiente por sede, 200 recordatorios de WA. Soporte de gerente dedicado.

## 6. Pilares Técnicos
- **Seguridad Zero Trust:** Auditoría estricta de quién, qué, cuándo y desde dónde se realizan las acciones.
- **Escalabilidad:** Arquitectura en Supabase con Next.js + React Native. Integración de **Resend** para correos y notificaciones.
- **Multi-Tenant:** Separación lógica y segura de los datos entre diferentes barberías.

## 7. Mejoras de Valor y UX (Gamificación y Engagement)
- **Promociones Inteligentes (Master):** El sistema sugiere promociones basadas en fechas o comportamiento (ej. \"Hot Sale\", \"Amor y Amistad\"). El Master decide si las crea, ignora o edita (completamente manual, sin automatización intrusiva).\n- **Insignias de Experiencia (Barberos):** Gamificación visual en el perfil del barbero para dar confianza al cliente:\n  - **Artesano (Bronce):** ≤ 1 año de experiencia. Etapa inicial/técnica.\n  - **Pro (Plata):** > 1 año de experiencia. Experiencia consolidada.\n  - **Expert (Oro):** ≥ 5 años de experiencia. Maestro altamente experimentado.\n- **Especialidades:** El perfil del barbero mostrará sus \"Skills\" principales (ej. Fade, Barba, Cortes clásicos, Diseños) para facilitar la elección por parte del cliente.
