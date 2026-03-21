-- ==========================================================
-- FASE 2: TRIGGERS & FUNCIONES - AUTOMATIZACIÓN STYLERNOW
-- ==========================================================

-- 1. HELPER TIMEZONE CANÓNICO (America/Bogota)
CREATE OR REPLACE FUNCTION tz_now()
RETURNS TIMESTAMPTZ AS $$
SELECT (NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'America/Bogota';
$$ LANGUAGE sql STABLE;

-- 2. TRIGGER ACTUALIZAR METRICAS DEMANDA
CREATE OR REPLACE FUNCTION trigger_actualizar_demanda()
RETURNS trigger AS $$
BEGIN
    INSERT INTO metricas_demanda (barberia_id, fecha, hora, total_reservas)
    VALUES (
        NEW.barberia_id,
        DATE(tz_now()),
        EXTRACT(HOUR FROM NEW.fecha_hora),
        1
    )
    ON CONFLICT (barberia_id, fecha, hora)
    DO UPDATE SET total_reservas = metricas_demanda.total_reservas + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reserva_confirmada ON reservas;
CREATE TRIGGER trg_reserva_confirmada
AFTER UPDATE ON reservas
FOR EACH ROW
WHEN (NEW.estado = 'confirmada' AND (OLD.estado IS DISTINCT FROM 'confirmada'))
EXECUTE FUNCTION trigger_actualizar_demanda();

-- 3. TRIGGER INMUTABILIDAD LEDGER (transacciones_financieras)
CREATE OR REPLACE FUNCTION trigger_inmutabilidad_ledger()
RETURNS trigger AS $$
BEGIN
    IF (NEW.monto IS DISTINCT FROM OLD.monto) OR
       (NEW.referencia_externa IS DISTINCT FROM OLD.referencia_externa) OR
       (NEW.reserva_id IS DISTINCT FROM OLD.reserva_id) THEN
        RAISE EXCEPTION 'Operación denegada: El Ledger es inmutable y no permite modificaciones de transacciones.';
    END IF;

    -- Control de Transicion de Estados
    IF OLD.estado IN ('aprobado', 'fallido') AND NEW.estado IS DISTINCT FROM OLD.estado THEN
        RAISE EXCEPTION 'Operación denegada: Un estado financiero aprobado/fallido no puede revertirse.';
    END IF;

    NEW.actualizado_en := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_inmutable ON transacciones_financieras;
CREATE TRIGGER trg_ledger_inmutable
BEFORE UPDATE ON transacciones_financieras
FOR EACH ROW
EXECUTE FUNCTION trigger_inmutabilidad_ledger();
