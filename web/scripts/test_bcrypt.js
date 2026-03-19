const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // o 'bcrypt'

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
const TEST_PASSWORD = 'Foncor88';

async function run() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT encrypted_password
      FROM auth.users
      WHERE email = $1;
    `, [TARGET_EMAIL]);

    if (res.rows.length === 0) {
      console.log("Usuario no encontrado.");
      return;
    }

    const hash = res.rows[0].encrypted_password;
    console.log("Hash encontrado:", hash);

    if (!hash) {
      console.log("El usuario no tiene contraseña seteada.");
      return;
    }

    // Supabase usa standard bcrypt?
    // Bcrypt hashes empiezan con $2a$, $2b$, $2y$
    try {
      const isMatch = bcrypt.compareSync(TEST_PASSWORD, hash);
      console.log(`\n¿Coincide '${TEST_PASSWORD}'?:`, isMatch ? "✅ SÍ" : "❌ NO");

      if (!isMatch) {
         // Probar con espacios
         const withSpace = bcrypt.compareSync(TEST_PASSWORD + ' ', hash);
         console.log(`¿Coincide '${TEST_PASSWORD} ' (con espacio)?:`, withSpace ? "✅ SÍ" : "❌ NO");
         
         const withSpaceBefore = bcrypt.compareSync(' ' + TEST_PASSWORD, hash);
         console.log(`¿Coincide ' ${TEST_PASSWORD}' (con espacio previo)?:`, withSpaceBefore ? "✅ SÍ" : "❌ NO");
      }
    } catch (e) {
      console.error("Error al comparar con bcrypt:", e.message);
    }

  } catch (err) {
    console.error("Error auditando:", err);
  } finally {
    await client.end();
  }
}

run();
