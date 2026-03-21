-- ==========================================================
-- FASE 3: RPC - CREACIÓN SEGURA DE RESERVAS CON PESSIMISTIC LOCKING
-- ==========================================================

CREATE OR REPLACE FUNCTION crear_reserva_segura(
    p_usuario_id UUID,
    p_barberia_id UUID,
    p_barbero_id UUID,
    p_servicio_id UUID,
    p_fecha_hora TIMESTAMPTZ,
    p_monto_total DECIMAL,
    p_tipo_servicio VARCHAR,
    p_monto_anticipo DECIMAL
)
RETURNS UUID AS $$
DECLARE
    v_reserva_id UUID;
    v_conflicto BOOLEAN;
BEGIN
    -- 1. BLOQUEO PESIMISTA (PESSIMISTIC LOCKING)
    -- Evitar que dos transacciones paralelas ocupen el mismo slot del barbero
    PERFORM 1 
    FROM reservas 
    WHERE barbero_id = p_barbero_id 
      AND fecha_hora = p_fecha_hora 
      AND estado IN ('pendiente', 'confirmada')
    FOR UPDATE;

    -- 2. VALIDAR DISPONIBILIDAD
    SELECT EXISTS (
        SELECT 1 
        FROM reservas 
        WHERE barbero_id = p_barbero_id 
          AND fecha_hora = p_fecha_hora 
          AND estado IN ('pendiente', 'confirmada')
    ) INTO v_conflicto;

    IF v_conflicto THEN
        RAISE EXCEPTION 'El horario seleccionado ya se encuentra ocupado.';
    END IF;

    -- 3. INSERTAR RESERVA CON IDEMPOTENCIA
    INSERT INTO reservas (
        usuario_id,
        barberia_id,
        barbero_id,
        servicio_id,
        fecha_hora,
        monto_total,
        tipo_servicio,
        monto_anticipo,
        estado,
        creado_en
    ) VALUES (
        p_usuario_id,
        p_barberia_id,
        p_barbero_id,
        p_servicio_id,
        p_fecha_hora,
        p_monto_total,
        p_tipo_servicio,
        p_monto_anticipo,
        'pendiente',
        NOW()
    ) RETURNING id INTO v_reserva_id;

    RETURN v_reserva_id;

EXCEPTION
    WHEN OTHERS THEN
        -- El ROLLBACK es automático en excepciones de bloque PL/pgSQL
        RAISE;
END;
$$ LANGUAGE plpgsql;
