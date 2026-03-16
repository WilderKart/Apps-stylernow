-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum para roles
CREATE TYPE user_role AS ENUM ('cliente', 'master', 'manager', 'barbero', 'admin');

-- Enum para planes
CREATE TYPE suscripcion_plan AS ENUM ('essential', 'studio', 'prestige', 'signature');

-- Tabla de Barberías (Tenants)
CREATE TABLE barberias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    plan suscripcion_plan DEFAULT 'essential',
    activa BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Perfiles/Usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Lazo con autenticación (ej: Supabase Auth)
    barberia_id UUID REFERENCES barberias(id) ON DELETE CASCADE, -- NULL si es cliente o admin general
    role user_role NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    experiencia_anos INTEGER DEFAULT 0, -- Rango para Insignias (Artesano, Pro, Expert)
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Especialidades de Barberos
CREATE TABLE especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbero_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL, -- Fade, Barba, Clásico, etc.
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catálogo de Servicios
CREATE TABLE servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barberia_id UUID REFERENCES barberias(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promociones Sugeridas e Inteligentes (Gestión Master)
CREATE TABLE promociones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barberia_id UUID REFERENCES barberias(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    porcentaje_descuento DECIMAL(5,2),
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    activa BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservas / Citas
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barberia_id UUID REFERENCES barberias(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    barbero_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    servicio_id UUID REFERENCES servicios(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, confirmada, en_curso, terminada, cancelada
    anticipo_pagado BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLÍTICAS ZERO TRUST (Row Level Security - RLS)
ALTER TABLE barberias ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Ejemplo Política: Un Master solo puede ver datos de su propia Barbería
-- CREATE POLICY master_ve_su_barberia ON barberias FOR SELECT USING (id = (SELECT barberia_id FROM usuarios WHERE auth_id = auth.uid() AND role = 'master'));
