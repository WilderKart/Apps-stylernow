'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { KpiData } from '@/app/dashboard/actions/kpi-actions'
import { createClient } from '@/utils/supabase/server'

// Constructor lazy para no explotar si la Key falta en build-time
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY en variables de entorno.")
  return new GoogleGenerativeAI(apiKey)
}

export async function analyzeBusiness(kpiData: KpiData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  try {
    const genAI = getGenAI()
    // Recomendación Google Gemini: usar gemini-1.5-flash para rapidez y texto o gemini-1.5-pro para razonamiento ultra complejo.
    // Usaremos gemini-1.5-flash por latencia favorable en web.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Actúa como un **Consultor Experto en Negocios y Crecimiento (Growth Consultant)** para un emprendimiento de Barbería.
Analiza la siguiente radiografía de indicadores clave de rendimiento (KPIs) y proporciona un diagnóstico y un **plan de acción directo, crudo y accionable**. No uses lenguaje redundante, sé directo.

### 💰 1. Ingresos
Total Ingresos: $${kpiData.income?.totalIncome || 0}
Ticket Promedio: $${kpiData.income?.avgTicket?.toFixed(2) || 0}
(Si están bajos: identifica causa y propón 3 acciones en pricing o upselling).

### 👥 2. Clientes
Nuevos: ${kpiData.clients?.newClients || 0}
Recurrentes: ${kpiData.clients?.recurrentClients || 0}
Retención: ${kpiData.clients?.retentionRate?.toFixed(1) || 0}%
Frecuencia Promedio: ${kpiData.clients?.avgFrequency?.toFixed(2) || 0} visitas
(Si retención es baja: identifica fallas y propón 3 acciones de fidelización/recurrencia).

### 📅 3. Ocupación
Tasa Ocupación (Estimada): ${kpiData.occupancy?.occupancyRate || 0}%
Cancelaciones: ${kpiData.occupancy?.cancelled || 0}
No-Shows: ${kpiData.occupancy?.noShows || 0}
(Si hay baja ocupación: propón estrategias para horas muertas. Si es alta: aumento de precios).

### ✂️ 4. Barberos
Rendimiento por Empleado: 
${Object.entries(kpiData.staff?.staffPerformance || {}).map(([id, st]: any) => `Barbero ${id.slice(0,4)}: $${st.income} (${st.count} citas)`).join('\n')}
(Detecta disparidad, identifica quién rinde mejor o peor, propón replicar éxito).

### 🧾 5. Servicios (Top / Peor)
Mejor Servicio: ${kpiData.services?.topService?.name || 'N/A'} ($${kpiData.services?.topService?.income || 0})
Peor Servicio: ${kpiData.services?.weakestService?.name || 'N/A'} ($${kpiData.services?.weakestService?.income || 0})
(Propón cómo mejorar/eliminar el servicio más débil y escalar el más fuerte).

### 📉 6. Funnel y Asistencia
Citas Creadas: ${kpiData.funnel?.created || 0}
Citas Asistidas/Pagadas: ${kpiData.funnel?.attended || 0}
Tasa Asistencia: ${kpiData.funnel?.attendanceRate?.toFixed(1) || 0}%
(Analiza funnel, identifica etapa de caída de asistencia, propón 3 mejoras de conversión de citas).

Formatea la respuesta en Markdown profesional, estructurado en:
1. **Diagnóstico General**
2. **Alertas Críticas (Lo que está sangrando dinero)**
3. **Plan de Acción (Pasos 1, 2, 3)**
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    return { report: responseText }
  } catch (error: any) {
    console.error("Error en GEMINI:", error)
    return { error: 'Error generando consultoría de IA: ' + error.message }
  }
}

// ==========================================================
// 👑 GLOBAL ADMIN AI (ONLY)
// ==========================================================
export async function analyzeGlobalBusiness(adminData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase.from('usuarios').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'founder') return { error: 'No autorizado' }

  try {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Actúa como un **Experto en Crecimiento de Startups SaaS (SaaS Growth Consultant)**.
Estás analizando la data global del software "StylerNow" (Sistema para Barberías).

### Métricas Globales (Admin ONLY)
- Total Barberías Aprobadas: ${adminData.totalApproved || 0}
- Total Barberías Pendientes: ${adminData.totalPending || 0} (Cuello de botella en onboarding)
- Churn (Barberías Perdidas/Rechazadas): ${adminData.churned || 0}
- Ingresos Recurrentes Mensuales Estimados (MRR): $${adminData.mrr || 0}

Analiza este SaaS.
Si hay crecimiento: Propone cómo acelerarlo a nivel ventas B2B.
Si hay problemas (cuello de botella en pendientes o churn alto): Detecta problema y da plan de contingencia.
Si el MRR está estancado frente a usuarios probando el software: Sugiere estrategias de retención o conversión onboarding->pago.

Presenta en Markdown profesional:
1. **Salud del SaaS**
2. **Diagnóstico B2B**
3. **Estrategia Ejecutiva (Acquisition, Retention, Expansion)**
`

    const result = await model.generateContent(prompt)
    return { report: result.response.text() }
  } catch (err: any) {
    return { error: 'Error en AI Admin: ' + err.message }
  }
}
