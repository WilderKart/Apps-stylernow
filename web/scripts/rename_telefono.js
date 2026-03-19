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
    console.log("[Migration] Renombrando columna 'telefono' a 'celular' en public.usuarios...");
    
    // Verificar primero si existe 'telefono'
    const check = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND table_schema = 'public' AND column_name = 'telefono';
    `);

    if (check.rows.length > 0) {
      await client.query(`
        ALTER TABLE public.usuarios RENAME COLUMN telefono TO celular;
      `);
      console.log("✅ Columna renombrada exitosamente a 'celular'.");
    } else {
      console.log("⚠️ La columna 'telefono' no existe. Verificando si 'celular' ya existe...");
      const checkCel = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND table_schema = 'public' AND column_name = 'celular';
      `);
      if (checkCel.rows.length > 0) {
         console.log("✅ La columna 'celular' YA existe. Omitiendo.");
      } else {
         console.log("❌ Error: No se encontraron las columnas esperadas.");
      }
    }

  } catch (err) {
    console.error("Error ejecutando migración:", err);
  } finally {
    await client.end();
  }
}

run();
