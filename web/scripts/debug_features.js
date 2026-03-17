const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=["']?([^"'\r\n]+)["']?`, 'm'));
  return match ? match[1] : null;
}

const connectionString = getEnvVar('DIRECT_URL') || getEnvVar('DATABASE_URL');
const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("✅ Conectado a Postgres.");

    // 1. Verificar si la tabla existe y tiene RLS
    const res = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'saas_features'
    `);
    
    console.log("📊 Estado de la tabla:", res.rows[0]);

    // 2. Intentar un SELECT simple de conteo
    const countRes = await client.query("SELECT COUNT(*) FROM saas_features");
    console.log(`🔢 Conteo de filas desde Postgres: ${countRes.rows[0].count}`);

    // 3. Ver políticas aplicadas
    const pols = await client.query(`
      SELECT policyname, roles, cmd, qual 
      FROM pg_policies 
      WHERE tablename = 'saas_features'
    `);
    console.log("🛡️ Políticas RLS:", pols.rows);

  } catch (err) {
    console.error("❌ Error de debug:", err);
  } finally {
    await client.end();
  }
}

run();
