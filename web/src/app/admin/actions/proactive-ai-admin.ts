'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGlobalSaaSKPIs } from '@/app/dashboard/actions/kpi-actions'

const apiKey = process.env.GEMINI_API_KEY
let genAI: GoogleGenerativeAI

export async function getProactiveAdminInsights() {
  if (!apiKey) return { error: 'LLM Key missing' }
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey)

  const adminKpis: any = await getGlobalSaaSKPIs()
  if (adminKpis.error) return { error: adminKpis.error }

  const model = genAI.getGenerativeModel({ 
     model: "gemini-1.5-flash",
     generationConfig: {
         responseMimeType: "application/json" 
     }
  })

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const strDate = today.toLocaleDateString('es-ES', options);
  
  const prompt = `
  Actúa como el estratega de crecimiento (Growth Hacker) B2B del SaaS StylerNow.
  El sistema opera globalmente alojando barberías.
  La fecha actual es ${strDate}.

  ### DATOS GLOBALES DEL SISTEMA (SAAS KPIs):
  MRR Estimado: $${adminKpis.mrr}
  Barberías Activas: ${adminKpis.totalApproved}
  Pendientes de Aprobación (Funnel Incompleto): ${adminKpis.totalPending}
  Churned (Cuentas Inactivas/Rechazadas): ${adminKpis.churned}
  Total Histórico Registrado: ${adminKpis.tenantsCount}

  ### INSTRUCCIONES ESTRICTAS:
  1. No devuelvas texto plano. Solo el JSON EXACTO.
  2. Prioriza SOLAMENTE los 3 insights más críticos según el impacto en la retención global y el MRR.
  3. "score" debe ser de 0 a 100 evaluando la salud del ecosistema SaaS. Un funnel abandonado (altos pendientes) baja el score.
  4. Genera campañas estructurales B2B o features que puedan activar reactivar cuentas (como promociones de adopción).

  ### FORMATO JSON REQUERIDO:
  {
    "score": [Número 0-100],
    "status": ["success" | "warning" | "danger"],
    "summary": "Resumen B2B corto",
    "insights": [
      {
        "type": "problem" | "success" | "warning",
        "title": "Título corto",
        "cause": "Causa en los datos globales",
        "impact": "Impacto monetario estimado en MRR",
        "actions": ["Acion de plataforma 1", "Accion 2"]
      }
    ],
    "opportunities": [ ... mismo formato que insight ...],
    "promotions": [
      {
         "target": "A quiénes apuntar la campaña (Ej. Usuarios estancados)",
         "title": "Nombre de Campaña de Adopción",
         "expectedReturn": "Impacto en retención MRR"
      }
    ]
  }
  `

  try {
    const output = await model.generateContent(prompt)
    const jsonString = output.response.text()
    const aiData = JSON.parse(jsonString);
    return { data: aiData, currentData: adminKpis }
  } catch (error) {
    console.error("AI Admin Gen Error", error)
    return { error: 'Error procesando Insights B2B Proactivos' }
  }
}
