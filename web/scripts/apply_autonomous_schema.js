require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function applyAutonomousSchema() {
  console.log("Conectando usando pg client a la URL directa...");
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  
  try {
    await client.connect();

    const query = `
      -- 1. TABLA INMUTABLE DE LOGS DE IA
      CREATE TABLE IF NOT EXISTS ai_insight_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('master', 'admin')),
        
        input_kpis JSONB NOT NULL,
        output_ai JSONB NOT NULL,
        payload_hash VARCHAR(64) NOT NULL, -- SHA256 integrity check
        
        priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
        confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        is_anomaly BOOLEAN DEFAULT false,
        impact_type VARCHAR(20) CHECK (impact_type IN ('revenue', 'retention', 'occupancy', 'global_mrr')),
        
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'auto-executed', 'rejected')),
        cache_valid_until TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE ai_insight_logs ENABLE ROW LEVEL SECURITY;

      -- Seguridad RLS: Solo Select/Insert. SIN UPDATE. SIN DELETE.
      DROP POLICY IF EXISTS "Master can insert own logs" ON ai_insight_logs;
      CREATE POLICY "Master can insert own logs" ON ai_insight_logs FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
      );
      
      DROP POLICY IF EXISTS "Master can view own logs" ON ai_insight_logs;
      CREATE POLICY "Master can view own logs" ON ai_insight_logs FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
      );

      -- Permitir actualizar solo el status
      DROP POLICY IF EXISTS "Master can update status" ON ai_insight_logs;
      CREATE POLICY "Master can update status" ON ai_insight_logs FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
      );

      -- 2. TABLA TRANSACCIONAL DE PROMOCIONES INTELIGENTES
      CREATE TABLE IF NOT EXISTS promotions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('discount', 'campaign', 'flash_sale')),
        discount_value NUMERIC NOT NULL CHECK (discount_value >= 0 AND discount_value <= 50), -- REGLA MAXIMO 50%
        schedule_info VARCHAR(150),
        target_audience VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
        valid_until TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- Restricción de 30 días max.
        CONSTRAINT max_duration CHECK (valid_until <= created_at + INTERVAL '30 days')
      );

      ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Master promo manage" ON promotions;
      CREATE POLICY "Master promo manage" ON promotions FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
      );

      -- 3. TABLA DE AUDIT LOGS (CRÍTICA B2B)
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL, -- TENANT_APPROVED, TENANT_REJECTED
        performed_by UUID NOT NULL REFERENCES auth.users(id),
        details JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

      -- Solo lecturas e inserts por admin.
      DROP POLICY IF EXISTS "Admin view audits" ON audit_logs;
      CREATE POLICY "Admin view audits" ON audit_logs FOR SELECT USING (
        auth.uid() IN (SELECT auth_id FROM usuarios WHERE role = 'admin')
      );
      DROP POLICY IF EXISTS "Admin insert audits" ON audit_logs;
      CREATE POLICY "Admin insert audits" ON audit_logs FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT auth_id FROM usuarios WHERE role = 'admin')
      );
    `;

    await client.query(query);
    console.log("¡Tablas Inmutables y Transaccionales aplicadas con éxito con Reglas Fintech!");

  } catch (err) {
    console.error("Error ejecutando DDL Autónomo:", err);
  } finally {
    await client.end();
  }
}

applyAutonomousSchema();
