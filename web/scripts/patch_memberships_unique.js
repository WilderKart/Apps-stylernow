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

async function run() {
  await client.connect();
  try {
    console.log("Conectado a la base de datos.");

    // 1. Limpieza de Duplicados (V10.6.1)
    console.log("Buscando duplicados en memberships...");
    const dupsQuery = await client.query(`
      SELECT user_id, COUNT(*) 
      FROM public.memberships 
      GROUP BY user_id 
      HAVING COUNT(*) > 1;
    `);

    if (dupsQuery.rows.length > 0) {
      console.log(`Encontrados ${dupsQuery.rows.length} usuarios con membresías duplicadas. Limpiando...`);
      for (const row of dupsQuery.rows) {
         // Borrar todos excepto el primero (usando ID u otro orden)
         // Supabase suele usar UUID o int 'id'. Vamos a borrar conservando el MIN(id) o combinando.
         await client.query(`
           DELETE FROM public.memberships 
           WHERE user_id = $1 
           AND id NOT IN (
             SELECT MIN(id) FROM public.memberships WHERE user_id = $1
           );
         `, [row.user_id]);
      }
      console.log("Limpieza completada.");
    } else {
      console.log("No se encontraron duplicados.");
    }

    // 2. Aplicar Constraint Unique
    console.log("Aplicando CONSTRAINT unique_user_membership...");
    await client.query(`
      ALTER TABLE public.memberships
      ADD CONSTRAINT unique_user_membership UNIQUE (user_id);
    `);
    
    console.log("Éxito: Restricción UNIQUE aplicada en memberships (user_id).");

  } catch (err) {
    if (err.message.includes('already exists')) {
       console.log("La restricción UNIQUE ya existe. Omitiendo.");
    } else {
       console.error("Error al ejecutar DDL:", err);
    }
  } finally {
    await client.end();
  }
}

run();
