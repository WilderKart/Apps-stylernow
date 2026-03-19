const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Leer del .env.local manualmente para no depender de dotenv
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'));
  return match ? match[1] : null;
}

const connectionString = getEnvVar('DIRECT_URL');

if (!connectionString) {
  console.error("DIRECT_URL no encontrada en .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  await client.connect();
  try {
    console.log("Conectado a la base de datos.");
    console.log("Ejecutando ALTER TABLE memberships...");
    await client.query("ALTER TABLE public.memberships ALTER COLUMN tenant_id DROP NOT NULL;");
    console.log("Éxito: La columna tenant_id ahora acepta NULL.");
  } catch (err) {
    console.error("Error al ejecutar DDL:", err);
  } finally {
    await client.end();
  }
}

run();
