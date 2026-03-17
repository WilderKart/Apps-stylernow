-- ==========================================
-- POLÍTICAS RLS ZERO TRUST - DESBLOQUEO BASE
-- ==========================================

-- 1. Tabla: usuarios
-- Permitir que cualquier usuario autenticado LEA su propio registro de perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON usuarios FOR SELECT 
USING (auth_id = auth.uid());

-- Permitir que el usuario edite sus propios datos básicos
CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON usuarios FOR UPDATE 
USING (auth_id = auth.uid());

-- Permitir que el Administrador Global (SuperAdmin) vea todos los perfiles
CREATE POLICY "Admins pueden ver todos los perfiles" 
ON usuarios FOR SELECT 
USING (
  (SELECT role FROM usuarios WHERE auth_id = auth.uid()) = 'admin'
);


-- 2. Tabla: barberias
-- Permitir que TODO EL MUNDO (incluyendo clientes no registrados) vea las barberías
CREATE POLICY "Cualquiera puede ver las barberías" 
ON barberias FOR SELECT 
USING (true);

-- Permitir que un Master edite su propia barbería
CREATE POLICY "Masters pueden editar su barbería" 
ON barberias FOR UPDATE 
USING (
  id = (SELECT barberia_id FROM usuarios WHERE auth_id = auth.uid() AND role = 'master')
);


-- 3. Tabla: servicios
-- Permitir que TODO EL MUNDO vea los servicios de las barberías
CREATE POLICY "Cualquiera puede ver los servicios" 
ON servicios FOR SELECT 
USING (true);

-- Permitir que un Master/Manager edite los servicios de su barbería
CREATE POLICY "Staff puede editar servicios" 
ON servicios FOR ALL 
USING (
  barberia_id = (SELECT barberia_id FROM usuarios WHERE auth_id = auth.uid() AND (role = 'master' OR role = 'manager'))
);


-- 4. Tabla: reservas
-- Permitir que el cliente vea y cree sus propias reservas
CREATE POLICY "Clientes ven sus propias reservas" 
ON reservas FOR SELECT 
USING (cliente_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

CREATE POLICY "Clientes crean sus propias reservas" 
ON reservas FOR INSERT 
WITH CHECK (cliente_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- Permitir que Barberos vean las reservas asignadas
CREATE POLICY "Barberos ven sus reservas asignadas" 
ON reservas FOR SELECT 
USING (barbero_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- Permitir que Master/Manager vea todas las reservas de su barbería
CREATE POLICY "Staff ve todas las reservas de la barbería" 
ON reservas FOR SELECT 
USING (
  barberia_id = (SELECT barberia_id FROM usuarios WHERE auth_id = auth.uid() AND (role = 'master' OR role = 'manager'))
);
