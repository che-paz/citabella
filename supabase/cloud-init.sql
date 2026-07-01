-- CITABELLA — Setup completo para Supabase Cloud (SQL Editor)
-- Ejecutar UNA vez en proyecto nuevo, en este orden:
--   1. Este archivo (schema + RLS)
--   2. Crear usuarios en Dashboard → Authentication → Users (ver docs abajo)
--   3. supabase/seed-cloud.sql

-- ========== 001_initial_schema.sql ==========

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE plan_tipo AS ENUM ('founder', 'trial', 'pago');
CREATE TYPE usuario_rol AS ENUM ('admin_salon', 'colaboradora', 'platform_admin');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE salones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan_tipo plan_tipo NOT NULL DEFAULT 'founder',
  plan_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  plan_fin TIMESTAMPTZ,
  moneda TEXT NOT NULL DEFAULT 'GTQ',
  timezone TEXT NOT NULL DEFAULT 'America/Guatemala',
  fri_link TEXT,
  politica_reembolso TEXT NOT NULL DEFAULT '',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER salones_updated_at
  BEFORE UPDATE ON salones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE UNIQUE INDEX idx_salones_slug ON salones(slug);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol usuario_rol NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_salon ON usuarios(salon_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);

CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  duracion_minutos INT NOT NULL CHECK (duracion_minutos > 0),
  activo BOOLEAN NOT NULL DEFAULT true,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_servicios_salon ON servicios(salon_id);
CREATE INDEX idx_servicios_salon_activo ON servicios(salon_id, activo);

CREATE TABLE paquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  duracion_minutos INT NOT NULL CHECK (duracion_minutos > 0),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paquetes_salon ON paquetes(salon_id);

CREATE TABLE paquete_servicios (
  paquete_id UUID NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  orden INT NOT NULL DEFAULT 0,
  PRIMARY KEY (paquete_id, servicio_id)
);

CREATE INDEX idx_paquete_servicios_paquete ON paquete_servicios(paquete_id);

CREATE TABLE planes_suscripcion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo plan_tipo NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  max_colaboradoras INT,
  max_citas_mes INT,
  precio_mensual DECIMAL(10, 2)
);

INSERT INTO planes_suscripcion (tipo, nombre, max_colaboradoras, max_citas_mes, precio_mensual) VALUES
  ('founder', 'Founder', NULL, NULL, 0),
  ('trial', 'Prueba', 3, 100, 0),
  ('pago', 'Plan Pro', NULL, NULL, 299);

-- ========== 002_rls_policies.sql ==========

CREATE OR REPLACE FUNCTION get_user_salon_id()
RETURNS UUID AS $$
  SELECT salon_id FROM usuarios WHERE id = auth.uid() AND activo = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS usuario_rol AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid() AND activo = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

ALTER TABLE salones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salones_select" ON salones
  FOR SELECT TO authenticated
  USING (id = get_user_salon_id());

CREATE POLICY "salones_update" ON salones
  FOR UPDATE TO authenticated
  USING (id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (id = get_user_salon_id());

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select" ON usuarios
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "usuarios_insert" ON usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "usuarios_update" ON usuarios
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicios_select" ON servicios
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "servicios_insert" ON servicios
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "servicios_update" ON servicios
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

ALTER TABLE paquetes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paquetes_select" ON paquetes
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "paquetes_insert" ON paquetes
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "paquetes_update" ON paquetes
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

ALTER TABLE paquete_servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paquete_servicios_select" ON paquete_servicios
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paquetes p
      WHERE p.id = paquete_servicios.paquete_id
        AND p.salon_id = get_user_salon_id()
    )
  );

CREATE POLICY "paquete_servicios_insert" ON paquete_servicios
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() = 'admin_salon'
    AND EXISTS (
      SELECT 1 FROM paquetes p
      WHERE p.id = paquete_servicios.paquete_id
        AND p.salon_id = get_user_salon_id()
    )
    AND EXISTS (
      SELECT 1 FROM servicios s
      WHERE s.id = paquete_servicios.servicio_id
        AND s.salon_id = get_user_salon_id()
    )
  );

CREATE POLICY "paquete_servicios_delete" ON paquete_servicios
  FOR DELETE TO authenticated
  USING (
    get_user_rol() = 'admin_salon'
    AND EXISTS (
      SELECT 1 FROM paquetes p
      WHERE p.id = paquete_servicios.paquete_id
        AND p.salon_id = get_user_salon_id()
    )
  );

ALTER TABLE planes_suscripcion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planes_suscripcion_select" ON planes_suscripcion
  FOR SELECT TO authenticated
  USING (true);
