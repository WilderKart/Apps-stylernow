const postgres = require('postgres')

const dbUrl = "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
const sql = postgres(dbUrl)

async function run() {
  try {
    console.log("--- CORRIGIENDO RPC: insert_services_batch ---")

    await sql`
      CREATE OR REPLACE FUNCTION public.insert_services_batch(p_tenant_id uuid, p_services jsonb)
       RETURNS void
       LANGUAGE plpgsql
       SECURITY DEFINER
       SET search_path TO 'public'
      AS $function$
      DECLARE
        svc JSONB;
        v_normalized_name TEXT;
      BEGIN
        -- 1. Candado de Concurrencia (Advisory Lock)
        PERFORM pg_advisory_xact_lock(hashtext(p_tenant_id::text));

        -- 2. Validación de Autorización mediante Memberships / Founder
        IF NOT EXISTS (
          SELECT 1 FROM memberships m
          JOIN role_permissions rp ON rp.role = m.role
          WHERE m.user_id = auth.uid()
          AND m.tenant_id = p_tenant_id
          AND rp.permission = 'services.create'
        ) AND NOT (
          auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
        ) THEN
          RAISE EXCEPTION 'Unauthorized: El usuario no tiene permisos para crear servicios.';
        END IF;

        -- 3. Validación de límite de lote (Anti-Spam)
        IF jsonb_typeof(p_services) != 'array' THEN
          RAISE EXCEPTION 'Payload inválido: se esperaba un array.';
        END IF;

        IF jsonb_array_length(p_services) > 50 THEN
          RAISE EXCEPTION 'Batch demasiado grande (máximo 50).';
        END IF;

        -- 4. Bucle de Inserción y Validación Individual
        FOR svc IN SELECT * FROM jsonb_array_elements(p_services) LOOP
          
          -- Validaciones exhaustivas de tipo y rango en DB
          IF (svc->>'name') IS NULL OR trim(svc->>'name') = '' THEN
            RAISE EXCEPTION 'Falta el nombre del servicio.';
          END IF;

          IF (svc->>'price')::numeric <= 0 OR (svc->>'price')::numeric > 20000000 THEN
            RAISE EXCEPTION 'Precio inválido para el servicio: %', svc->>'name';
          END IF;

          IF (svc->>'duration_minutes')::integer < 15 OR (svc->>'duration_minutes')::integer > 480 THEN
            RAISE EXCEPTION 'Duración inválida para el servicio: %', svc->>'name';
          END IF;

          -- v_normalized_name ya no es necesario insertarlo manualmente porque es GENERATED ALWAYS AS
          INSERT INTO services (
             tenant_id, 
             name, 
             category, 
             price, 
             duration_minutes, 
             description, 
             image_url
          ) VALUES (
             p_tenant_id,
             svc->>'name',
             COALESCE(svc->>'category', 'corte'),
             (svc->>'price')::numeric,
             (svc->>'duration_minutes')::integer,
             svc->>'description',
             svc->>'image_url'
          );

        END LOOP;

      END;
      $function$
    `

    console.log("RPC `insert_services_batch` corregido exitosamente")

  } catch (err) {
    console.error("Error al corregir el RPC:", err)
  } finally {
    await sql.end()
  }
}

run()
