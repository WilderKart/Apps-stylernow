import crypto from 'crypto';

export type AIInsightSchema = {
  score: number;
  status: 'success' | 'warning' | 'danger';
  summary: string;
  insights: {
    type: 'problem' | 'success' | 'warning';
    title: string;
    cause: string;
    impact: string;
    actions: string[];
    priority_score: number;
    confidence: number;
    is_anomaly: boolean;
    impact_type: 'revenue' | 'retention' | 'occupancy';
  }[];
  promotions: {
    title: string;
    type: 'discount' | 'campaign' | 'flash_sale';
    value: number;
    schedule: string;
    target: string;
  }[];
}

export function validateAIPayload(data: any): { isValid: boolean, error?: string, sanitizedData?: AIInsightSchema } {
  try {
    if (!data || typeof data !== 'object') throw new Error("Raíz inválida");
    if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) throw new Error("Score inválido");
    if (!['success', 'warning', 'danger'].includes(data.status)) throw new Error("Status inválido");
    if (typeof data.summary !== 'string' || data.summary.trim().length === 0) throw new Error("Summary ausente");
    
    if (!Array.isArray(data.insights)) throw new Error("Insights ausentes");
    if (data.insights.length === 0) throw new Error("Mínimo 1 insight requerido");
    
    const validInsights = data.insights.map((ins: any) => {
      if (!['problem', 'success', 'warning'].includes(ins.type)) throw new Error("Insight type dev");
      if (!ins.title || ins.title.trim() === '') throw new Error("Insight title missing");
      if (!ins.cause || ins.cause.trim() === '') throw new Error("Insight cause missing");
      if (!ins.impact || ins.impact.trim() === '') throw new Error("Insight impact missing");
      if (!Array.isArray(ins.actions) || ins.actions.length === 0) throw new Error("Insight actions missing");
      
      const pScore = Number(ins.priority_score);
      const conf = Number(ins.confidence);
      if (isNaN(pScore) || pScore < 0 || pScore > 100) throw new Error("Priority_score dev 0-100");
      if (isNaN(conf) || conf < 0 || conf > 1) throw new Error("Confidence dev 0-1");
      
      if (!['revenue', 'retention', 'occupancy'].includes(ins.impact_type)) throw new Error("Impact_type enum fallido");

      return {
        ...ins,
        is_anomaly: Boolean(ins.is_anomaly),
        priority_score: pScore,
        confidence: conf
      };
    });

    const validPromos = (Array.isArray(data.promotions) ? data.promotions : []).map((promo: any) => {
      if (!['discount', 'campaign', 'flash_sale'].includes(promo.type)) throw new Error("Promo type fallida");
      const v = Number(promo.value);
      if (isNaN(v) || v > 50 || v < 0) throw new Error("Ataque a Promoción: Descuento mayor a 50%");
      if (!promo.title || !promo.schedule || !promo.target) throw new Error("Promo incompletas");
      
      return {
        ...promo,
        value: v
      }
    });

    return {
      isValid: true,
      sanitizedData: {
        score: data.score,
        status: data.status,
        summary: data.summary,
        insights: validInsights,
        promotions: validPromos
      }
    }
  } catch (err: any) {
    return { isValid: false, error: err.message };
  }
}

export function createPayloadHash(input: any, output: any): string {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify({ input, output }));
  return hash.digest('hex');
}

// Fallback genérico en caso de que Gemini devuelva basura y se bloquee
export const FALLBACK_PAYLOAD: AIInsightSchema = {
  score: 50,
  status: 'warning',
  summary: "Análisis detenido por Seguridad. Resultados inconsistentes.",
  insights: [
    {
      type: 'warning',
      title: 'Validación Rechazada',
      cause: 'El modelo emitió datos fuera de los rangos permitidos.',
      impact: 'Riesgo Financiero bloqueado por plataforma.',
      actions: ['Reintentar mañana o forzar cálculo'],
      priority_score: 100,
      confidence: 1,
      is_anomaly: true,
      impact_type: 'revenue'
    }
  ],
  promotions: []
};
