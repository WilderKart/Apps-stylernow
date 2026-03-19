const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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

const TARGET_EMAIL = 'triquakupraqui-6880@yopmail.com';
const NEW_PASSWORD = 'Foncor88';

async function run() {
  await client.connect();
  try {
    const salt = bcrypt.genSaltSync(10);
    // Para Supabase, usualmente se usa $2a$ o $2b$. bcryptjs usa $2a$.
    const hash = bcrypt.hashSync(NEW_PASSWORD, salt);

    console.log(`[Fix] Actualizando contraseña para ${TARGET_EMAIL}...`);
    const res = await client.query(`
      UPDATE auth.users
      SET encrypted_password = $1,
          updated_at = NOW()
      WHERE email = $2
      RETURNING id;
    `, [hash, TARGET_EMAIL]);

    if (res.rowCount > 0) {
      console.log(`✅ Contraseña actualizada exitosamente a '${NEW_PASSWORD}' para ${TARGET_EMAIL}.`);
    } else {
      console.log("❌ No se encontró el usuario para actualizar.");
    }

  } catch (err) {
    console.error("Error actualizando contraseña:", err);
  } finally {
    await client.end();
  }
}

run();
