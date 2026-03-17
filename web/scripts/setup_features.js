const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Leer del .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=["']?([^"'\r\n]+)["']?`, 'm'));
  return match ? match[1] : null;
}

const connectionString = getEnvVar('DIRECT_URL') || getEnvVar('DATABASE_URL');

if (!connectionString) {
  console.error("❌ No se encontró DIRECT_URL o DATABASE_URL en .env.local");
  process.exit(1);
}

const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("✅ Conectado a Postgres.");

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS saas_features (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          active BOOLEAN DEFAULT FALSE,
          actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client.query(createTableSql);
    console.log("✅ Tabla saas_features creada o ya existente.");

    // Insertar valores por defecto si está vacía
    const countRes = await client.query("SELECT COUNT(*) FROM saas_features");
    if (parseInt(countRes.rows[0].count) === 0) {
      console.log("🌱 Insertando features por defecto...");
      const insertSql = `
        INSERT INTO saas_features (id, name, description, icon, active) VALUES
        ('ai_marketing', 'IA Marketing (Generación Copys)', 'Permite a barberías crear promociones usando IA.', 'Bot', true),
        ('analytics_pro', 'Reportes Avanzados B2B', 'Visor de métricas cruzadas y mapas de calor para empresas.', 'BarChart', true),
        ('inventory', 'Gestión de Inventario', 'Control de stock de productos para barberías (Beta).', 'Settings2', false),
        ('mp_split', 'Split de Pagos MercadoPago', 'Paga la comisión al barbero y el resto al local automáticamente.', 'Zap', false),
        ('zero_trust_log', 'Auditoría Zero Trust', 'Registro estricto de accesos y bloqueos de seguridad.', 'Shield', true),
        ('promo_banners_ai', 'Banners Autogenerados', 'Crea banners con IA basados en tendencias de cortes.', 'Sparkles', true)
      `;
      await client.query(insertSql);
      console.log("✅ Features insertadas con éxito.");
    } else {
      console.log("💡 La tabla ya contiene datos. Saltando inserción inicial.");
    }

  } catch (err) {
    console.error("❌ Error ejecutando setup:", err);
  } finally {
    await client.end();
  }
}

run();
