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
    console.log("[Audit] Solicitando triggers en auth.users...");
    const res = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement, action_timing
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth' AND event_object_table = 'users';
    `);

    console.log("Triggers encontrados:");
    for (const t of res.rows) {
       console.log(`- ${t.trigger_name} [${t.action_timing} ${t.event_manipulation}]: ${t.action_statement}`);
    }

    if (res.rows.length === 0) {
      console.log("No se encontraron triggers en auth.users.");
    }

  } catch (err) {
    console.error("Error listando triggers:", err);
  } finally {
    await client.end();
  }
}

run();
