const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'));
  return match ? match[1] : null;
}

const connectionString = getEnvVar('DIRECT_URL');

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  try {
    console.log("[Migration] Aplicando política INSERT en public.memberships...");

    // 1. Crear política INSERT si no existe
    await client.query(`
      DROP POLICY IF EXISTS "Insert own membership" ON public.memberships;
      CREATE POLICY "Insert own membership" 
      ON public.memberships FOR INSERT 
      WITH CHECK (user_id = auth.uid());
    `);
    console.log("✅ Política 'Insert own membership' aplicada con éxito.");

    // 2. Asegurar SELECT por si faltara para el Onboarding
    await client.query(`
      DROP POLICY IF EXISTS "Select own membership" ON public.memberships;
      CREATE POLICY "Select own membership" 
      ON public.memberships FOR SELECT 
      USING (user_id = auth.uid());
    `);
    console.log("✅ Política de SELECT re-asegurada en memberships.");

  } catch (err) {
    console.error("Error aplicando política RLS en memberships:", err);
  } finally {
    await client.end();
  }
}

run();
