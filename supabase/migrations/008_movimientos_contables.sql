-- CITABELLA: expense tracking for founders (balance MVP)

DO $$ BEGIN
  CREATE TYPE movimiento_tipo AS ENUM ('ingreso', 'egreso');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS movimientos_contables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  tipo movimiento_tipo NOT NULL,
  categoria TEXT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_salon_fecha
  ON movimientos_contables(salon_id, fecha DESC);

ALTER TABLE movimientos_contables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movimientos_select" ON movimientos_contables
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "movimientos_insert" ON movimientos_contables
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "movimientos_update" ON movimientos_contables
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

CREATE POLICY "movimientos_delete" ON movimientos_contables
  FOR DELETE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon');
