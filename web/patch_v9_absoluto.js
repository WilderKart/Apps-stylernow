const { Client } = require('pg');

const sql = `
-- ==========================================
-- 🛡️ HARDENING ABSOLUTO V9 — STYLERNOW
-- ==========================================

--------------------------------------------
-- 🧱 1. FORCE ROW LEVEL SECURITY (BLOQUE 1)
--------------------------------------------
-- Tablas en INGLÉS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY; ALTER TABLE appointments FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY; ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY; ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY; ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY; ALTER TABLE permissions FORCE ROW LEVEL SECURITY;
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY; ALTER TABLE promo_banners FORCE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_hits ENABLE ROW LEVEL SECURITY; ALTER TABLE rate_limit_hits FORCE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY; ALTER TABLE role_permissions FORCE ROW LEVEL SECURITY;
ALTER TABLE saas_features ENABLE ROW LEVEL SECURITY; ALTER TABLE saas_features FORCE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY; ALTER TABLE schedules FORCE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY; ALTER TABLE service_catalog FORCE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY; ALTER TABLE services FORCE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY; ALTER TABLE staff FORCE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY; ALTER TABLE support_tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY; ALTER TABLE time_blocks FORCE ROW LEVEL SECURITY;
ALTER TABLE trial_registrations ENABLE ROW LEVEL SECURITY; ALTER TABLE trial_registrations FORCE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY; ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY; ALTER TABLE email_verifications FORCE ROW LEVEL SECURITY;
ALTER TABLE password_reset_log ENABLE ROW LEVEL SECURITY; ALTER TABLE password_reset_log FORCE ROW LEVEL SECURITY;

-- Tablas en ESPAÑOL
ALTER TABLE barberias ENABLE ROW LEVEL SECURITY; ALTER TABLE barberias FORCE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY; ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY; ALTER TABLE servicios FORCE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY; ALTER TABLE promociones FORCE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY; ALTER TABLE reservas FORCE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY; ALTER TABLE especialidades FORCE ROW LEVEL SECURITY;
ALTER TABLE colombia_holidays ENABLE ROW LEVEL SECURITY; ALTER TABLE colombia_holidays FORCE ROW LEVEL SECURITY;

--------------------------------------------
-- ⏳ 2. RATE LIMITING POR IP (BLOQUE 4)
--------------------------------------------
-- Actualizar función rate limit para aceptar IP
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT, INT, INT);

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID, 
  p_ip TEXT, 
  p_action TEXT, 
  p_max INT, 
  p_window_seconds INT
)
RETURNS VOID AS $$
DECLARE
  v_count INT;
BEGIN
  -- Insertar hit con IP
  INSERT INTO rate_limit_hits (user_id, ip_address, action_key) 
  VALUES (p_user_id, p_ip, p_action);

  -- Contar hits de esta IP o Usuario en la ventana
  SELECT count(*) INTO v_count 
  FROM rate_limit_hits 
  WHERE (user_id = p_user_id OR ip_address = p_ip)
    AND action_key = p_action 
    AND created_at > (now() - (p_window_seconds || ' seconds')::interval);

  IF v_count > p_max THEN
    RAISE EXCEPTION 'Rate limit exceeded for action [%]. Please wait.', p_action;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

--------------------------------------------
-- 🧱 3. POLÍTICAS RLS AISLAMIENTO (BLOQUE 1 y 2)
--------------------------------------------

-- A) TABLAS ESPAÑOLAS DIRECTAS CON barberia_id
-- RESERVAS
DROP POLICY IF EXISTS "Reservas Select" ON reservas;
CREATE POLICY "Reservas Select" ON reservas FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = auth.uid() AND m.tenant_id = reservas.barberia_id)
);

DROP POLICY IF EXISTS "Reservas Create" ON reservas;
CREATE POLICY "Reservas Create" ON reservas FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = auth.uid() AND m.tenant_id = reservas.barberia_id)
);

-- SERVICIOS (Español)
DROP POLICY IF EXISTS "Servicios Select" ON servicios;
CREATE POLICY "Servicios Select" ON servicios FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = auth.uid() AND m.tenant_id = servicios.barberia_id)
);

-- PROMOCIONES (Español)
DROP POLICY IF EXISTS "Promociones Select" ON promociones;
CREATE POLICY "Promociones Select" ON promociones FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = auth.uid() AND m.tenant_id = promociones.barberia_id)
);

-- B) TABLAS INDIRECTAS (ESPECIALIDADES)
DROP POLICY IF EXISTS "Especialidades Select" ON especialidades;
CREATE POLICY "Especialidades Select" ON especialidades FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'founder')
  OR EXISTS (
    SELECT 1 FROM staff s 
    WHERE s.id = especialidades.barbero_id 
    AND s.tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = auth.uid())
  )
);

--------------------------------------------
-- 🧾 4. TRIGGER AUDIT TOTAL (BLOQUE 6)
--------------------------------------------
-- Crear función global de auditoría si no existe
CREATE OR REPLACE FUNCTION audit_all_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, metadata)
    VALUES (auth.uid(), 'DELETE_' || TG_TABLE_NAME, jsonb_build_object('id', OLD.id));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, metadata)
    VALUES (auth.uid(), 'UPDATE_' || TG_TABLE_NAME, jsonb_build_object('id', NEW.id));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, metadata)
    VALUES (auth.uid(), 'INSERT_' || TG_TABLE_NAME, jsonb_build_object('id', NEW.id));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar a reservas y appointments
DROP TRIGGER IF EXISTS audit_reservas ON reservas;
CREATE TRIGGER audit_reservas AFTER INSERT OR UPDATE OR DELETE ON reservas FOR EACH ROW EXECUTE FUNCTION audit_all_changes();

DROP TRIGGER IF EXISTS audit_appointments ON appointments;
CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments FOR EACH ROW EXECUTE FUNCTION audit_all_changes();

--------------------------------------------
-- 🔄 5. AUTO-ESCALADO (BLOQUE 12)
--------------------------------------------
-- Prototipar el disparador de eventos para auto RLS
CREATE OR REPLACE FUNCTION auto_enable_rls()
RETURNS event_trigger AS $body$
DECLARE
    obj record;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
    LOOP
        IF obj.object_type = 'table' THEN
            EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
            EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', obj.object_identity);
        END IF;
    END LOOP;
END;
$body$ LANGUAGE plpgsql;

DROP EVENT TRIGGER IF EXISTS rls_auto_trigger;
CREATE EVENT TRIGGER rls_auto_trigger ON ddl_command_end
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION auto_enable_rls();

`;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Parche Ultimate Hardening V9 aplicado en el 100% de tablas.");
  } catch (err) {
    console.error("❌ Error aplicando parche SQL V9:", err);
  } finally {
    await client.end();
  }
}

main();
