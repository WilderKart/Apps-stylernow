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

if (!connectionString) {
  console.error("DIRECT_URL no encontrada");
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conname = 'unique_user_membership';
    `);

    if (res.rows.length > 0) {
      console.log("VALIDADO: El constraint 'unique_user_membership' EXISTE en la base de datos.");
    } else {
      console.log("ERROR: El constraint no fue encontrado. Intentando crearlo con sintaxis correcta...");
      await client.query(`
        ALTER TABLE public.memberships 
        ADD CONSTRAINT unique_user_membership UNIQUE (user_id);
      `);
      console.log("Constraint creado exitosamente.");
    }
  } catch (err) {
    console.error("Error al validar el constraint:", err);
  } finally {
    await client.end();
  }
}

run();
