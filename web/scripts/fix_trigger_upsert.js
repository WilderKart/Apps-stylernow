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
    console.log("=== 🛠️ ACTUALIZANDO TRIGGER INICIO ===");

    const sql = `
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

      -- Validar escalada de privilegios
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
      ON CONFLICT (auth_id) DO UPDATE SET 
        role = EXCLUDED.role,
        nombre = COALESCE(EXCLUDED.nombre, usuarios.nombre);

      RETURN NEW;
    END;
    $$;
    `;

    await client.query(sql);
    console.log("✅ Trigger 'handle_new_user' actualizado para actualizar en conflicto.");

  } catch (err) {
    console.error("Error actualizando de trigger:", err);
  } finally {
    await client.end();
  }
}

run();
