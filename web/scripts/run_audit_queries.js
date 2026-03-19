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
    console.log("=== 🔍 AUDITORÍA SQL INICIO ===");

    // 1. Verificar Default
    const resDefault = await client.query(`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name='usuarios' AND column_name='role';
    `);
    console.log("\n[1] Default de columna 'role':");
    console.table(resDefault.rows);

    // 2. Verificar Triggers en usuarios
    const resTriggers = await client.query(`
      SELECT event_object_table, action_timing, action_statement 
      FROM information_schema.triggers 
      WHERE event_object_table='usuarios';
    `);
    console.log("\n[2] Triggers en tabla 'usuarios':");
    console.table(resTriggers.rows);

    // 3. Buscar usuarios creados recientemente con 'client'
    const resUsers = await client.query(`
      SELECT id, email, role, created_at 
      FROM usuarios 
      WHERE role='cliente' AND created_at > '2026-03-01'
      ORDER BY created_at DESC LIMIT 5;
    `);
    console.log("\n[3] Usuarios recientes con rol 'cliente':");
    console.table(resUsers.rows);

    // 4. Buscar managers creados
    const resManagers = await client.query(`
      SELECT id, email, role, created_at 
      FROM usuarios 
      WHERE role='manager'
      ORDER BY created_at DESC LIMIT 5;
    `);
    console.log("\n[4] Usuarios recientes con rol 'manager':");
    console.table(resManagers.rows);

    console.log("\n=== 🔍 AUDITORÍA SQL FIN ===");

  } catch (err) {
    console.error("Error en auditoría:", err);
  } finally {
    await client.end();
  }
}

run();
