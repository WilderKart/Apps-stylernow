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
    console.log("[Migration] Aplicando política INSERT en public.usuarios...");

    // 1. Eliminar política si ya existe por si acaso
    await client.query(`
      DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON public.usuarios;
    `);

    // 2. Crear la política INSERT blindada
    await client.query(`
      CREATE POLICY "Usuarios pueden crear su propio perfil" 
      ON public.usuarios FOR INSERT 
      WITH CHECK (auth_id = auth.uid());
    `);

    console.log("✅ Política 'Usuarios pueden crear su propio perfil' aplicada con éxito.");

    // 3. (Opcional) Asegurar SELECT por si faltara para el login posterior
    await client.query(`
      DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.usuarios;
      CREATE POLICY "Usuarios pueden ver su propio perfil" 
      ON public.usuarios FOR SELECT 
      USING (auth_id = auth.uid());
    `);
    console.log("✅ Política de SELECT re-asegurada para 'auth_id = auth.uid()'.");

  } catch (err) {
    console.error("Error aplicando política RLS:", err);
  } finally {
    await client.end();
  }
}

run();
