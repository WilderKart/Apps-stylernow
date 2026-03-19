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
    console.log("[Audit] Listando últimos 10 usuarios en auth.users...");
    const res = await client.query(`
      SELECT id, email, created_at, email_confirmed_at, last_sign_in_at
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 10;
    `);

    console.log("Usuarios encontrados:", res.rows);

  } catch (err) {
    console.error("Error listando usuarios:", err);
  } finally {
    await client.end();
  }
}

run();
