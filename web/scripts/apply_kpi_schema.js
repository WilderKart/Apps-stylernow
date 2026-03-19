require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function applyKpiSchema() {
  console.log("Conectando usando pg client a la URL directa...");
  // Cambiamos DATABASE_URL por DIRECT_URL
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  
  try {
    await client.connect();

    const query = `
      CREATE TABLE IF NOT EXISTS tenant_kpi_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
        period_type VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly')),
        
        income_data JSONB DEFAULT '{}',
        clients_data JSONB DEFAULT '{}',
        occupancy_data JSONB DEFAULT '{}',
        staff_data JSONB DEFAULT '{}',
        services_data JSONB DEFAULT '{}',
        funnel_data JSONB DEFAULT '{}',
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (tenant_id, snapshot_date, period_type)
      );

      ALTER TABLE tenant_kpi_snapshots ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Master can view own kpi snapshots" ON tenant_kpi_snapshots;
      CREATE POLICY "Master can view own kpi snapshots"
      ON tenant_kpi_snapshots
      FOR SELECT
      USING (
        tenant_id IN (
          SELECT tenant_id FROM memberships WHERE user_id = auth.uid()
        )
      );
    `;

    await client.query(query);
    console.log("¡Éxito! Tabla tenant_kpi_snapshots estructurada y protegida por RLS a través de DIRECT_URL.");

  } catch (err) {
    console.error("Error ejecutando DDL:", err);
  } finally {
    await client.end();
  }
}

applyKpiSchema();
