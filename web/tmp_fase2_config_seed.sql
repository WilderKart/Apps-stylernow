-- ==========================================================
-- SEED CONFIGURACIONES INICIALES (CMS)
-- ==========================================================

INSERT INTO configuraciones (clave, valor, tipo) VALUES
('pricing_dinamico_activo', 'true', 'bool'),
('clima_activo', 'true', 'bool'),
('max_multiplicador', '1.5', 'float'),
('domicilios_activos', 'true', 'bool'),
('porcentaje_anticipo', '0.15', 'float')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;
