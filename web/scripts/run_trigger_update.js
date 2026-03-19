import postgres from 'postgres'
import fs from 'fs'
import path from 'path'

// Leer .env.local
const envPath = path.resolve('.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}="([^"]+)"`))
  return match ? match[1] : null
}

const connectionString = getEnvVar('DIRECT_URL')

if (!connectionString) {
  console.error("Faltan DIRECT_URL")
  process.exit(1)
}

const sql = postgres(connectionString)

async function run() {
  try {
    // 1. Obtener valores de enum user_role
    const roles = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'user_role'::regtype;
    `
    console.log("=== ENUM user_role ===")
    console.log(roles.map(r => r.enumlabel))

    // 2. Comprobar si existe 'master' en el enum
    const hasMaster = roles.some(r => r.enumlabel === 'master')
    console.log(`¿Existe 'master'? ${hasMaster}`)

    // 3. Crear script de actualización de Trigger
    const updateTriggerSql = `
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
          'cliente'::user_role
        );

        -- Protección escalada privilegios (revisar si aplica 'master' o d_role)
        IF v_role = 'admin' THEN
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
          nombre = EXCLUDED.nombre,
          celular = EXCLUDED.celular;

        RETURN NEW;
      END;
      $$;
    `

    await sql.unsafe(updateTriggerSql)
    console.log("=== Trigger Actualizado Correctamente en DB ===")

  } catch (e) {
    console.error("Error ejecutando SQL:", e)
  } finally {
    await sql.end()
  }
}

run()
