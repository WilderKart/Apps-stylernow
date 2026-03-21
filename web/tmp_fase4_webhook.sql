-- ==========================================================
-- FASE 4: RPC - WEBHOOK MERCADO PAGO ATÓMICO (TRANSACCIÓN)
-- ==========================================================

CREATE OR REPLACE FUNCTION procesar_pago_webhook(
    p_payment_id VARCHAR,
    p_monto DECIMAL,
    p_reserva_id UUID,
    p_idempotency_key VARCHAR,
    p_usuario_id UUID,
    p_barberia_id UUID,
    p_tipo VARCHAR -- 'anticipo' o 'pago_restante'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_ya_procesado BOOLEAN;
    v_reserva_monto_anticipo DECIMAL;
    v_reserva_estado VARCHAR;
BEGIN
    -- 1. CONTROL DE IDEMPOTENCIA / DOUBLE SPEND
    SELECT EXISTS (
        SELECT 1 FROM transacciones_financieras 
        WHERE idempotency_key = p_idempotency_key 
           OR referencia_externa = p_payment_id
    ) INTO v_ya_procesado;

    IF v_ya_procesado THEN
        RAISE EXCEPTION 'Idempotencia Activa: Pago ya procesado previamente.';
    END IF;

    -- 2. VALIDAR ESTADO DE LA RESERVA
    SELECT estado, monto_anticipo INTO v_reserva_estado, v_reserva_monto_anticipo
    FROM reservas WHERE id = p_reserva_id;

    IF v_reserva_estado IS NULL THEN
        RAISE EXCEPTION 'Reserva no encontrada.';
    END IF;

    IF v_reserva_estado = 'confirmada' THEN
        RAISE EXCEPTION 'La reserva ya se encuentra confirmada.';
    END IF;

    -- 3. VALIDAR MONTO EXACTO (Optional, pero recomendado para Zero Trust)
    IF p_monto < (v_reserva_monto_anticipo - 1.0) THEN -- Margen de error 1 COP por redondeo
        RAISE EXCEPTION 'Monto insuficiente para liquidar anticipo.';
    END IF;

    -- 4. INSERTAR EN LEDGER FINANCIERO (INMUTABLE)
    INSERT INTO transacciones_financieras (
        reserva_id,
        usuario_id,
        barberia_id,
        tipo,
        monto,
        estado,
        proveedor,
        referencia_externa,
        idempotency_key,
        creado_en
    ) VALUES (
        p_reserva_id,
        p_usuario_id,
        p_barberia_id,
        p_tipo,
        p_monto,
        'aprobado',
        'mercadopago',
        p_payment_id,
        p_idempotency_key,
        NOW()
    );

    -- 5. ACTUALIZAR RESERVA
    UPDATE reservas 
    SET estado = 'confirmada'
    WHERE id = p_reserva_id;

    -- 6. REGISTRAR EVENTO DE AUDITORÍA
    INSERT INTO audit_eventos (tipo_evento, payload, creado_en)
    VALUES (
        'pago_aprobado_webhook',
        jsonb_build_object(
            'reserva_id', p_reserva_id,
            'payment_id', p_payment_id,
            'monto', p_monto,
            'barberia_id', p_barberia_id
        ),
        NOW()
    );

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql;
