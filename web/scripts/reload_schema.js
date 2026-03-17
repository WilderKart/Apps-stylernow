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

    // 1. Asignar permisos a anon y authenticated
    console.log("🔑 Asignando permisos a anon y authenticated...");
    await client.query("GRANT SELECT, UPDATE, INSERT, DELETE ON saas_features TO anon, authenticated, service_role");
    
    // 2. Notificar recarga de caché a PostgREST
    console.log("🔔 Notificando recarga de esquema a PostgREST...");
    await client.query("NOTIFY pgrst, 'reload schema'");

    console.log("🎉 Servidor configurado y PostgREST notificado.");

  } catch (err) {
    console.error("❌ Error ejecutando reload:", err);
  } finally {
    await client.end();
  }
}

run();
