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
    const res = await client.query(`
      SELECT id, email, created_at, email_confirmed_at, encrypted_password
      FROM auth.users
      WHERE email LIKE '%triquak%';
    `);

    console.log("Usuarios que contienen 'triquak':", res.rows.map(r => ({
       email: r.email,
       confirmed: !!r.email_confirmed_at,
       has_password: !!r.encrypted_password
    })));

  } catch (err) {
    console.error("Error auditando:", err);
  } finally {
    await client.end();
  }
}

run();
