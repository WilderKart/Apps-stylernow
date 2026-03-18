-- ============================================================
-- TRIGGER ZERO TRUST: Auto-crear perfil al registrarse en Supabase Auth
-- Este trigger corre en el backend (Postgres), nunca en el cliente.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Corre con privilegios del dueño (bypassea RLS)
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Leer el rol desde los metadatos del usuario (enviados desde el frontend en auth.signUp)
  -- Si no se especifica, default es 'cliente'
  v_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'cliente'
  );

  -- VALIDACIÓN ZERO TRUST: no permitir que el cliente declame ser 'admin' o 'master'
  IF v_role IN ('admin', 'master') THEN
    v_role := 'cliente'; -- Forzar degradación si intentan escalada de privilegio
  END IF;

  INSERT INTO public.usuarios (
    auth_id,
    role,
    nombre,
    email,
    celular
  ) VALUES (
    NEW.id,
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (auth_id) DO NOTHING; -- Idempotente: no duplicar si ya existe

  RETURN NEW;
END;
$$;

-- Registrar el trigger en auth.users
-- (Supabase permite triggers en el schema auth para esto)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ===========================================================
-- POLÍTICA RLS para usuarios
-- Los usuarios solo leen y editan su propio perfil.
-- Admins pueden ver todo.
-- ===========================================================

-- Permitir que el trigger (SECURITY DEFINER) haga INSERTs sin restricción
-- (La función ya tiene SECURITY DEFINER, esto es por si se requiere permiso explícito)

-- SELECT: Cada usuario ve solo su propio registro
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own"
  ON public.usuarios
  FOR SELECT
  USING (auth_id = auth.uid());

-- UPDATE: Cada usuario edita solo su propio registro
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
CREATE POLICY "usuarios_update_own"
  ON public.usuarios
  FOR UPDATE
  USING (auth_id = auth.uid());

-- INSERT: Nadie inserta directamente. Solo el trigger SECURITY DEFINER puede hacerlo.
DROP POLICY IF EXISTS "usuarios_no_direct_insert" ON public.usuarios;
CREATE POLICY "usuarios_no_direct_insert"
  ON public.usuarios
  FOR INSERT
  WITH CHECK (false); -- Bloquear inserts directos del cliente
