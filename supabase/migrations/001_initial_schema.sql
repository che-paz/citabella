-- CITABELLA: initial schema (Sprint 01)
-- Tables: salones, usuarios, servicios, paquetes, paquete_servicios, planes_suscripcion

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE plan_tipo AS ENUM ('founder', 'trial', 'pago');
CREATE TYPE usuario_rol AS ENUM ('admin_salon', 'colaboradora', 'platform_admin');

-- Helper: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tenant root
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

-- Salon staff (linked to auth.users)
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

-- Services catalog
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

-- Packages
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

-- Package ↔ services junction
CREATE TABLE paquete_servicios (
  paquete_id UUID NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  orden INT NOT NULL DEFAULT 0,
  PRIMARY KEY (paquete_id, servicio_id)
);

CREATE INDEX idx_paquete_servicios_paquete ON paquete_servicios(paquete_id);

-- Subscription plan catalog (platform-wide, no salon_id)
CREATE TABLE planes_suscripcion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo plan_tipo NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  max_colaboradoras INT,
  max_citas_mes INT,
  precio_mensual DECIMAL(10, 2)
);

-- Seed platform plans
INSERT INTO planes_suscripcion (tipo, nombre, max_colaboradoras, max_citas_mes, precio_mensual) VALUES
  ('founder', 'Founder', NULL, NULL, 0),
  ('trial', 'Prueba', 3, 100, 0),
  ('pago', 'Plan Pro', NULL, NULL, 299);
