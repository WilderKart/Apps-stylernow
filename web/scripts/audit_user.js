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
  console.error("DIRECT_URL no encontrada en .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

const TARGET_EMAIL = 'triquakupraqui-8600@yopmail.com';

async function run() {
  await client.connect();
  try {
    console.log(`Buscando usuario en auth.users para: ${TARGET_EMAIL}`);
    const res = await client.query(`
      SELECT id, email, encrypted_password, email_confirmed_at, last_sign_in_at, created_at, updated_at
      FROM auth.users
      WHERE email = $1;
    `, [TARGET_EMAIL]);

    if (res.rows.length === 0) {
      console.log("No se encontró usuario con ese email en auth.users.");
    } else {
      const u = res.rows[0];
      console.log("Usuario encontrado:", {
         id: u.id,
         email: u.email,
         email_confirmed: u.email_confirmed_at ? "SÍ" : "NO",
         has_password: u.encrypted_password ? "SÍ" : "NO",
         encrypted_len: u.encrypted_password ? u.encrypted_password.length : 0,
         last_sign_in: u.last_sign_in_at,
         created: u.created_at,
         updated: u.updated_at
      });

      // Comparar updated_at vs created_at para ver si se corrió el updateUser
      if (u.updated_at > u.created_at) {
         console.log("El usuario ha sido actualizado después de su creación (Plausiblemente updateUser corrió).");
      } else {
         console.log("El usuario NO ha sido actualizado desde su creación (updateUser falló o no se ejecutó).");
      }
    }

  } catch (err) {
    console.error("Error auditando usuario:", err);
  } finally {
    await client.end();
  }
}

run();
