'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/utils/supabase/server'
import { getOrGenerateDailySnapshot, getHistoricalSnapshots } from '@/app/dashboard/actions/snapshot-actions'
import { validateAIPayload, createPayloadHash, FALLBACK_PAYLOAD } from './ai-validator'

const apiKey = process.env.GEMINI_API_KEY
let genAI: GoogleGenerativeAI

export async function getProactiveAIInsights(tenantId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // 1. REVISAR CACHÉ (Evitar facturación excesiva e IA errática en un mismo día)
  const { data: cachedLog } = await supabase
    .from('ai_insight_logs')
    .select('output_ai')
    .eq('tenant_id', tenantId)
    .eq('role', 'master')
    .gte('cache_valid_until', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cachedLog && cachedLog.output_ai) {
    return { data: cachedLog.output_ai, cached: true }
  }

  // 2. BUSCAR DATOS MATEMÁTICOS FRESCOS
  if (!apiKey) return { error: 'LLM Key missing' }
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey)

  const [snapshotRes, historicalRes] = await Promise.all([
     getOrGenerateDailySnapshot(tenantId),
     getHistoricalSnapshots(tenantId)
  ]);

  if (snapshotRes.error) return { error: snapshotRes.error }
  
  const currentData = snapshotRes.data;
  const { lastWeek, lastMonth } = historicalRes;

  const model = genAI.getGenerativeModel({ 
     model: "gemini-1.5-flash",
     generationConfig: {
         responseMimeType: "application/json" 
     }
  })

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const strDate = today.toLocaleDateString('es-ES', options);
  
  const inputKpis = {
     today: strDate,
     current: currentData,
     lastWeek: lastWeek ? lastWeek.income_data : null,
     lastMonth: lastMonth ? lastMonth.income_data : null
  };

  const prompt = `
  Actúa como un motor de decisiones B2B Autónomo Fintech. La fecha es ${strDate}.
  Lee estos KPIs crudos y detecta anomalías o quiebres.

  DATOS:
  ${JSON.stringify(inputKpis)}

  REGLAS DE SALIDA:
  1. Formato JSON ESTRICTO.
  2. Cada Insight debe incluir "priority_score" (0-100) y "confidence" (0-1).
  3. "impact_type" debe ser exactamente "revenue", "retention" u "occupancy".
  4. "is_anomaly": true si detectas una caída/pico anormal.
  5. Promociones: "type" SOLO puede ser "discount", "campaign" o "flash_sale". "value" NUNCA mayor a 50.
  
  FORMATO JSON (Respeta esta firma exacta):
  {
    "score": 0-100,
    "status": "success" | "warning" | "danger",
    "summary": "String",
    "insights": [
      {
        "type": "problem" | "success" | "warning",
        "title": "String",
        "cause": "String",
        "impact": "String",
        "actions": ["String"],
        "priority_score": 0-100,
        "confidence": 0-1,
        "is_anomaly": boolean,
        "impact_type": "revenue" | "retention" | "occupancy"
      }
    ],
    "promotions": [
       { "title": "String", "type": "discount", "value": 20, "schedule": "String", "target": "String" }
    ]
  }
  `

  try {
    const output = await model.generateContent(prompt)
    const jsonString = output.response.text()
    const rawData = JSON.parse(jsonString);

    // 3. PASAR POR FILTRO ZOD-LIKE (HARDENING)
    const validation = validateAIPayload(rawData);
    const finalData = (validation.isValid && validation.sanitizedData) ? validation.sanitizedData : FALLBACK_PAYLOAD;

    // 4. HASHEAR PAYLOAD Y GUARDAR AUDITORIA (ZERO TRUST)
    const payloadHash = createPayloadHash(inputKpis, finalData);
    
    // Configurar expiración del caché: Mismo día a las 23:59 o +12 horas. Elegimos 12 horas.
    const cacheUntil = new Date();
    cacheUntil.setHours(cacheUntil.getHours() + 12);

    await supabase.from('ai_insight_logs').insert({
      tenant_id: tenantId,
      role: 'master',
      input_kpis: inputKpis,
      output_ai: finalData,
      payload_hash: payloadHash,
      priority_score: finalData.insights?.[0]?.priority_score || 50,
      confidence: finalData.insights?.[0]?.confidence || 0.5,
      is_anomaly: finalData.insights?.some((i: any) => i.is_anomaly) || false,
      impact_type: finalData.insights?.[0]?.impact_type || 'revenue',
      status: 'pending',
      cache_valid_until: cacheUntil.toISOString()
    })

    return { data: finalData, cached: false, validationError: validation.error }
  } catch (error) {
    console.error("AI Gen Ex", error);
    return { data: FALLBACK_PAYLOAD, cached: false, error: 'Excepción de Red IA' }
  }
}
