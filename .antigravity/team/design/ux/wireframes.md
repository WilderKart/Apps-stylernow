# ESTRUCTURA VISUAL - WIREFRAMES (FASE 4)

Este documento describe la maqueta estructural de las pantallas críticas para validar la composición de la interfaz antes del diseño de alta fidelidad.

---

## 🏛️ 1. Dashboard Administrativo (Master)

**Layout**: Sidebar estático + Header + Contenedor de Contenido.

```text
+---------------------------------------------------------------+
| [Logo]  |  [Buscar...]                  [Perfil] [Notificaciones] |
+---------------------------------------------------------------+
| Sidebar |                                                     |
| ------- |  [Cards de Métricas]                                |
| - Home  |  +------------+  +------------+  +------------+     |
| - Agenda|  | Ingresos   |  | Reservas   |  | Clientes   |     |
| - Equipo|  | $1,250K    |  | 45 / HOY   |  | 12 Nuevos  |     |
| - Promo |  +------------+  +------------+  +------------+     |
| - Ajuste|                                                     |
|         |  [Gráfica de Rendimiento - Ventas vs Horas]         |
| [Cerrar]|                                                       |
+---------+-------------------------------------------------------+
```

---

## 📍 2. Paso 1 Onboarding: Datos Básicos + Mapa

El master ubica su barbería en el mapa con arrastre de pin o manual.

```text
+---------------------------------------------------------------+
| PASO 1 de 6: DATOS BÁSICOS                            [Atrás] |
+---------------------------------------------------------------+
|                                                               |
|  Nombre de la Barbería: [ Input Text                     ]     |
|  Ciudad:                 [ Select Ciudad                  ]     |
|  Teléfono de contacto:   [ Input Tel                      ]     |
|                                                               |
|  +-------------------------------------------------------+    |
|  | [MAPA INTERACTIVO - GOOGLE MAPS / LEAFLET]            |    |
|  |  Arrastra el PIN para ubicar la Barbería:             |    |
|  |                                                       |    |
|  |                       (📍 PIN)                        |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  [ ] Acepto que la dirección manual se sincronice con el mapa  |
|                                                               |
|  [BOTÓN: CONTINUAR PASO 2 ->]                                 |
|                                                               |
+---------------------------------------------------------------+
```

---

## 🛍️ 3. Vista de Barbería (Para el Cliente)

```text
+---------------------------------------------------------------+
| [<- Volver]                                          [Favorito] |
+---------------------------------------------------------------+
|  [ IMAGEN DEL EXTERIOR DE LA BARBERÍA / HERO ]                |
+---------------------------------------------------------------+
|  BARBERÍA PRESTIGE                                 (⭐ 4.9/5) |
|  Bogotá, Calle 85 # 11-53                                     |
+---------------------------------------------------------------+
|  [Info]  |  [Servicios]  |  [Barberos]  |  [Reseñas]           |
+---------------------------------------------------------------+
|                                                               |
|  CATÁLOGO DE SERVICIOS:                                       |
|                                                               |
|  +-------------------------------------------------------+    |
|  | [Foto] CORTE CLÁSICO                     Price: $35,000 |    |
|  |        ⏳ 30 min                         [ + RESERVAR ] |    |
|  +-------------------------------------------------------+    |
|  +-------------------------------------------------------+    |
|  | [Foto] COMBO BARBA + CORTE               Price: $50,000 |    |
|  |        ⏳ 45 min                         [ + RESERVAR ] |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
```

---

*Diseñado por la Dirección de UX/UI - Wilbot Ultra*
