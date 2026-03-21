-- ==========================================================
-- FASE 1 & 2: DDL COMPLETO - INFRAESTRUCTURA & LEDGER STYLERNOW
-- ==========================================================

-- 1. CONFIGURACIONES (CMS)
CREATE TABLE IF NOT EXISTS configuraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) UNIQUE,
    valor TEXT,
    tipo VARCHAR(20), -- 'int', 'float', 'bool', 'string', 'json'
    creado_en TIMESTAMP DEFAULT NOW()
);

-- 2. ZONAS_RIESGO
CREATE TABLE IF NOT EXISTS zonas_riesgo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ciudad VARCHAR(100),
    barrio VARCHAR(100),
    lat FLOAT8,
    lng FLOAT8,
    radio_metros INT,
    nivel INTEGER CHECK (nivel BETWEEN 1 AND 3), -- 1 bajo, 2 medio, 3 alto
    activa BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 3. CACHE_CLIMA
CREATE TABLE IF NOT EXISTS cache_clima (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lat DECIMAL,
    lng DECIMAL,
    weathercode INTEGER,
    obtenido_en TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cache_clima ON cache_clima(lat, lng, obtenido_en);

-- 4. METRICAS_DEMANDA
CREATE TABLE IF NOT EXISTS metricas_demanda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barberia_id UUID REFERENCES tenants(id), -- Usaremos 'tenants' ya que 'barberias' puede ser la tabla de detalles. Verificamos que 'tenants' existe.
    fecha DATE,
    hora INTEGER,
    total_reservas INTEGER DEFAULT 0,
    creado_en TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_demanda_barberia ON metricas_demanda(barberia_id, fecha, hora);

-- 5. TRANSACCIONES_FINANCIERAS (LEDGER)
CREATE TABLE IF NOT EXISTS transacciones_financieras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id UUID, -- Se puede REFERENCES reservas(id) si existe
    usuario_id UUID,
    barberia_id UUID,
    tipo VARCHAR(50), -- 'anticipo', 'pago_restante'
    monto DECIMAL,
    moneda VARCHAR(10) DEFAULT 'COP',
    estado VARCHAR(20) CHECK (estado IN ('pendiente','aprobado','fallido')),
    proveedor VARCHAR(50),
    referencia_externa VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP
);

-- 6. FRAUDE_FLAGS
CREATE TABLE IF NOT EXISTS fraude_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID,
    motivo TEXT,
    creado_en TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fraude_usuario ON fraude_flags(usuario_id);

-- 7. TABLAS DE REPORTES (CONSTRAINTS ANTI-DUPLICADOS)
CREATE TABLE IF NOT EXISTS reporte_financiero (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barberia_id UUID,
    fecha DATE,
    total_ingresos DECIMAL,
    total_transacciones INTEGER,
    creado_en TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_financiero UNIQUE (barberia_id, fecha)
);

CREATE TABLE IF NOT EXISTS reporte_operativo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barberia_id UUID,
    fecha DATE, -- Se añade fecha para constraint
    reservas_totales INTEGER,
    reservas_canceladas INTEGER,
    reservas_confirmadas INTEGER,
    creado_en TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_operativo UNIQUE (barberia_id, fecha)
);

CREATE TABLE IF NOT EXISTS reporte_riesgo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barberia_id UUID,
    fecha DATE, -- Se añade fecha para constraint
    usuarios_riesgo_alto INTEGER,
    zonas_bloqueadas INTEGER,
    creado_en TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_riesgo UNIQUE (barberia_id, fecha)
);

-- 8. AUDIT_EVENTOS
CREATE TABLE IF NOT EXISTS audit_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_evento VARCHAR(100),
    payload JSONB,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Indices de Performance Extra
CREATE INDEX IF NOT EXISTS idx_ledger_barberia_fecha ON transacciones_financieras(barberia_id, creado_en);
CREATE INDEX IF NOT EXISTS idx_reservas_estado_fecha ON reservas(barberia_id, estado, fecha_hora);
