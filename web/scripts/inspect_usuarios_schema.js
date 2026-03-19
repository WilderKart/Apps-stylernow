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
    console.log("[Audit] Inspeccionando estructura de public.usuarios...");
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND table_schema = 'public';
    `);

    console.log("Columnas de 'public.usuarios':");
    for (const c of res.rows) {
       console.log(`- ${c.column_name} (${c.data_type})`);
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
