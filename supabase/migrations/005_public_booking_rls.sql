-- CITABELLA: public booking (Sprint 02 Parte B)
-- pagos table, storage bucket, RLS for anonymous reservation flow

CREATE TYPE pago_metodo AS ENUM ('transferencia', 'efectivo', 'fri');
CREATE TYPE pago_estado AS ENUM ('pendiente', 'validado', 'rechazado');

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
  monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
  metodo pago_metodo NOT NULL,
  comprobante_url TEXT,
  estado pago_estado NOT NULL DEFAULT 'pendiente',
  validado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  validado_at TIMESTAMPTZ,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pagos_salon_estado ON pagos(salon_id, estado);
CREATE INDEX idx_pagos_cita ON pagos(cita_id);

-- Helpers for public booking (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_public_salon(p_salon_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM salones WHERE id = p_salon_id AND activo = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_salon_id_by_slug(p_slug TEXT)
RETURNS UUID AS $$
  SELECT id FROM salones WHERE slug = p_slug AND activo = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION upsert_clienta_public(
  p_salon_id UUID,
  p_nombre TEXT,
  p_telefono TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT is_public_salon(p_salon_id) THEN
    RAISE EXCEPTION 'Salón no disponible';
  END IF;

  IF length(trim(p_nombre)) < 2 THEN
    RAISE EXCEPTION 'Nombre inválido';
  END IF;

  IF length(trim(p_telefono)) < 8 THEN
    RAISE EXCEPTION 'Teléfono inválido';
  END IF;

  SELECT id INTO v_id
  FROM clientas
  WHERE salon_id = p_salon_id AND telefono = trim(p_telefono)
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE clientas SET nombre = trim(p_nombre) WHERE id = v_id;
    RETURN v_id;
  END IF;

  INSERT INTO clientas (salon_id, nombre, telefono)
  VALUES (p_salon_id, trim(p_nombre), trim(p_telefono))
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_clienta_public(UUID, TEXT, TEXT) TO anon, authenticated;

-- Public read: salon info by slug
CREATE POLICY "salones_public_select" ON salones
  FOR SELECT TO anon
  USING (activo = true);

-- Public read: active catalog
CREATE POLICY "servicios_public_select" ON servicios
  FOR SELECT TO anon
  USING (
    activo = true
    AND is_public_salon(salon_id)
  );

CREATE POLICY "paquetes_public_select" ON paquetes
  FOR SELECT TO anon
  USING (
    activo = true
    AND is_public_salon(salon_id)
  );

CREATE POLICY "paquete_servicios_public_select" ON paquete_servicios
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM paquetes p
      WHERE p.id = paquete_servicios.paquete_id
        AND p.activo = true
        AND is_public_salon(p.salon_id)
    )
  );

-- Public read: schedule + availability data
CREATE POLICY "horarios_salon_public_select" ON horarios_salon
  FOR SELECT TO anon
  USING (is_public_salon(salon_id));

CREATE POLICY "excepciones_horario_public_select" ON excepciones_horario
  FOR SELECT TO anon
  USING (is_public_salon(salon_id));

CREATE POLICY "citas_public_select" ON citas
  FOR SELECT TO anon
  USING (is_public_salon(salon_id));

-- Public insert: reservations scoped to active salon
CREATE POLICY "citas_public_insert" ON citas
  FOR INSERT TO anon
  WITH CHECK (
    is_public_salon(salon_id)
    AND creada_por = 'clienta'
    AND estado = 'pendiente_validacion'
  );

-- pagos RLS
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos_select" ON pagos
  FOR SELECT TO authenticated
  USING (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "pagos_update" ON pagos
  FOR UPDATE TO authenticated
  USING (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  )
  WITH CHECK (salon_id = get_user_salon_id());

CREATE POLICY "pagos_public_insert" ON pagos
  FOR INSERT TO anon
  WITH CHECK (
    is_public_salon(salon_id)
    AND estado = 'pendiente'
    AND EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id = pagos.cita_id
        AND c.salon_id = pagos.salon_id
        AND c.creada_por = 'clienta'
        AND c.estado = 'pendiente_validacion'
    )
  );

CREATE POLICY "pagos_public_select" ON pagos
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id = pagos.cita_id
        AND c.salon_id = pagos.salon_id
        AND c.creada_por = 'clienta'
    )
  );

-- Storage: private comprobantes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprobantes',
  'comprobantes',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "comprobantes_insert_anon" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'comprobantes'
    AND EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id::text = (storage.foldername(name))[2]
        AND c.salon_id::text = (storage.foldername(name))[1]
        AND c.creada_por = 'clienta'
        AND c.estado = 'pendiente_validacion'
    )
  );

CREATE POLICY "comprobantes_select_admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'comprobantes'
    AND (storage.foldername(name))[1] = get_user_salon_id()::text
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "comprobantes_update_anon" ON storage.objects
  FOR UPDATE TO anon
  USING (
    bucket_id = 'comprobantes'
    AND EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id::text = (storage.foldername(name))[2]
        AND c.salon_id::text = (storage.foldername(name))[1]
        AND c.creada_por = 'clienta'
        AND c.estado = 'pendiente_validacion'
    )
  );
