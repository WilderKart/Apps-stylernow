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

const TARGET_EMAIL = 'triquakupraqui-8600@yopmail.com';

async function run() {
  await client.connect();
  try {
    console.log(`[Audit] Buscando '${TARGET_EMAIL}' en auth.users con ILIKE...`);
    const authRes = await client.query(`
      SELECT id, email, encrypted_password, email_confirmed_at, created_at, updated_at
      FROM auth.users
      WHERE email ILIKE $1;
    `, [TARGET_EMAIL]);

    if (authRes.rows.length > 0) {
      console.log("-> Encontrado en auth.users:", authRes.rows);
    } else {
      console.log("-> NO encontrado en auth.users tampoco con ILIKE.");
    }

    console.log(`[Audit] Buscando en public.usuarios...`);
    // Primero listar los últimos 5 para ver qué hay en la base de datos
    const lastUsers = await client.query(`
      SELECT id, name, email, auth_id, created_at 
      FROM public.usuarios 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    console.log("Últimos 5 usuarios en public.usuarios:", lastUsers.rows);

    const publicRes = await client.query(`
      SELECT id, name, email, auth_id, created_at
      FROM public.usuarios
      WHERE email ILIKE $1;
    `, [TARGET_EMAIL]);

    if (publicRes.rows.length > 0) {
       console.log("-> Encontrado en public.usuarios:", publicRes.rows);
    } else {
       console.log("-> NO encontrado en public.usuarios.");
    }

  } catch (err) {
    console.error("Error auditando:", err);
  } finally {
    await client.end();
  }
}

run();
