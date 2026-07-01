-- CITABELLA: agenda schema (Sprint 02)
-- Tables: clientas, citas, horarios_salon, excepciones_horario

CREATE TYPE cita_estado AS ENUM (
  'pendiente',
  'pendiente_validacion',
  'confirmada',
  'cancelada',
  'completada',
  'no_show'
);

CREATE TYPE cita_creada_por AS ENUM ('admin', 'clienta', 'colaboradora');

CREATE TABLE clientas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  fecha_nacimiento DATE,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clientas_salon ON clientas(salon_id);

CREATE TABLE horarios_salon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  CHECK (hora_fin > hora_inicio)
);

CREATE INDEX idx_horarios_salon_salon ON horarios_salon(salon_id);
CREATE UNIQUE INDEX idx_horarios_salon_dia ON horarios_salon(salon_id, dia_semana);

CREATE TABLE excepciones_horario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  cerrado BOOLEAN NOT NULL DEFAULT true,
  hora_inicio TIME,
  hora_fin TIME,
  CHECK (
    (cerrado = true AND hora_inicio IS NULL AND hora_fin IS NULL)
    OR (cerrado = false AND hora_inicio IS NOT NULL AND hora_fin IS NOT NULL AND hora_fin > hora_inicio)
  )
);

CREATE INDEX idx_excepciones_salon_fecha ON excepciones_horario(salon_id, fecha);
CREATE UNIQUE INDEX idx_excepciones_salon_fecha_unique ON excepciones_horario(salon_id, fecha);

CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  clienta_id UUID NOT NULL REFERENCES clientas(id) ON DELETE RESTRICT,
  servicio_id UUID REFERENCES servicios(id) ON DELETE RESTRICT,
  paquete_id UUID REFERENCES paquetes(id) ON DELETE RESTRICT,
  colaboradora_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  inicio TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ NOT NULL,
  estado cita_estado NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  creada_por cita_creada_por NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (fin > inicio),
  CHECK (
    (servicio_id IS NOT NULL AND paquete_id IS NULL)
    OR (servicio_id IS NULL AND paquete_id IS NOT NULL)
  )
);

CREATE TRIGGER citas_updated_at
  BEFORE UPDATE ON citas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_citas_salon_inicio ON citas(salon_id, inicio);
CREATE INDEX idx_citas_colaboradora ON citas(colaboradora_id, inicio);
