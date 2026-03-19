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
    console.log("[Audit] Solicitando políticas de RLS en public.usuarios...");
    
    // Consulta para Postgres
    const res = await client.query(`
      SELECT 
        policyname AS name,
        cmd AS operation,
        roles,
        qual AS using_expression,
        with_check AS check_expression
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'usuarios';
    `);

    console.log("Políticas encontradas para 'public.usuarios':");
    for (const p of res.rows) {
       console.log(`\n- Nombre: ${p.name}`);
       console.log(`  Operación: ${p.operation}`);
       console.log(`  Roles: ${p.roles.join(', ')}`);
       console.log(`  USING: ${p.using_expression}`);
       console.log(`  CHECK: ${p.check_expression}`);
    }

    if (res.rows.length === 0) {
      console.log("No se encontraron políticas. ¿Está RLS activado?");
      const rlsCheck = await client.query(`
         SELECT relname, relrowsecurity 
         FROM pg_class JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
         WHERE nspname = 'public' AND relname = 'usuarios';
      `);
      if (rlsCheck.rows.length > 0) {
         console.log(`RLS está activado: ${rlsCheck.rows[0].relrowsecurity ? 'SÍ' : 'NO'}`);
      }
    }

  } catch (err) {
    console.error("Error listando políticas:", err);
  } finally {
    await client.end();
  }
}

run();
