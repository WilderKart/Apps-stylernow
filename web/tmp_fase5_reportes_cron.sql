-- ==========================================================
-- FASE 5: RPC - GENERACIÓN DE REPORTES (SNAPSHOTS) CON LOCKS
-- ==========================================================

-- 1. DETECTAR ANOMALÍAS
CREATE OR REPLACE FUNCTION detectar_anomalias()
RETURNS VOID AS $$
DECLARE
    v_rec RECORD;
BEGIN
    -- A) Pagos sin Reserva asociada
    FOR v_rec IN 
        SELECT id, referencia_externa, monto FROM transacciones_financieras 
        WHERE reserva_id IS NULL AND estado = 'aprobado'
    LOOP
        INSERT INTO audit_eventos (tipo_evento, payload, creado_en)
        VALUES ('anomaly_pago_sin_reserva', jsonb_build_object('transaccion_id', v_rec.id, 'referencia', v_rec.referencia_externa, 'monto', v_rec.monto), NOW());
    END LOOP;

    -- B) Reservas con anticipo pero sin transacción aprobada en Ledger
    FOR v_rec IN 
        SELECT r.id, r.usuario_id FROM reservas r
        WHERE r.estado = 'confirmada'
          AND NOT EXISTS (SELECT 1 FROM transacciones_financieras t WHERE t.reserva_id = r.id AND t.estado = 'aprobado')
    LOOP
        INSERT INTO audit_eventos (tipo_evento, payload, creado_en)
        VALUES ('anomaly_reserva_sin_ledger', jsonb_build_object('reserva_id', v_rec.id, 'usuario_id', v_rec.usuario_id), NOW());
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. GENERAR REPORTE FINANCIERO (UPSERT)
CREATE OR REPLACE FUNCTION generar_reporte_financiero()
RETURNS VOID AS $$
BEGIN
    -- advisory lock 123456
    PERFORM pg_advisory_lock(123456);

    INSERT INTO reporte_financiero (barberia_id, fecha, total_ingresos, total_transacciones, creado_en)
    SELECT 
        barberia_id,
        DATE(tz_now()),
        COALESCE(SUM(monto), 0),
        COUNT(*),
        NOW()
    FROM transacciones_financieras
    WHERE estado = 'aprobado' AND DATE(creado_en) = DATE(tz_now())
    GROUP BY barberia_id
    ON CONFLICT (barberia_id, fecha)
    DO UPDATE SET 
        total_ingresos = EXCLUDED.total_ingresos,
        total_transacciones = EXCLUDED.total_transacciones,
        creado_en = NOW();

    PERFORM pg_advisory_unlock(123456);
END;
$$ LANGUAGE plpgsql;

-- 3. GENERAR REPORTE OPERATIVO (UPSERT)
CREATE OR REPLACE FUNCTION generar_reporte_operativo()
RETURNS VOID AS $$
BEGIN
    PERFORM pg_advisory_lock(123457);

    INSERT INTO reporte_operativo (barberia_id, fecha, reservas_totales, reservas_canceladas, reservas_confirmadas, creado_en)
    SELECT 
        barberia_id,
        DATE(tz_now()),
        COUNT(*),
        COUNT(*) FILTER (WHERE estado = 'cancelada'),
        COUNT(*) FILTER (WHERE estado = 'confirmada'),
        NOW()
    FROM reservas
    WHERE DATE(fecha_hora) = DATE(tz_now())
    GROUP BY barberia_id
    ON CONFLICT (barberia_id, fecha)
    DO UPDATE SET 
        reservas_totales = EXCLUDED.reservas_totales,
        reservas_canceladas = EXCLUDED.reservas_canceladas,
        reservas_confirmadas = EXCLUDED.reservas_confirmadas,
        creado_en = NOW();

    PERFORM pg_advisory_unlock(123457);
END;
$$ LANGUAGE plpgsql;
