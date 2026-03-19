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
    console.log("[Migration] Actualizando función 'handle_new_user()' para columna 'celular'...");

    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        v_role user_role;
      BEGIN
        v_role := COALESCE(
          (NEW.raw_user_meta_data->>'role')::user_role,
          'cliente'
        );

        IF v_role IN ('admin', 'master') THEN
          v_role := 'cliente';
        END IF;

        INSERT INTO public.usuarios (
          auth_id,
          role,
          nombre,
          email,
          celular
        ) VALUES (
          NEW.id,
          v_role,
          COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
          NEW.email,
          NEW.raw_user_meta_data->>'phone'
        )
        ON CONFLICT (auth_id) DO NOTHING;

        RETURN NEW;
      END;
      $$;
    `);

    console.log("✅ Función 'handle_new_user()' actualizada correctamente.");

  } catch (err) {
    console.error("Error actualizando función en base de datos:", err);
  } finally {
    await client.end();
  }
}

run();
