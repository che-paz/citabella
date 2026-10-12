-- Eventos personales (reunión, dentista). Ocupan la agenda sin tocar citas.
-- Aditivo: no altera columnas ni filas existentes. Los triggers corren solo en escrituras nuevas.
-- Con la tabla vacía, una cita nueva sigue el mismo camino de hoy.

CREATE TABLE bloqueos_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  colaboradora_id UUID NULL,
  inicio TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ NOT NULL,
  titulo TEXT NOT NULL,
  notas TEXT NULL,
  creado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bloqueos_agenda_colaboradora_id_fkey
    FOREIGN KEY (colaboradora_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT bloqueos_agenda_creado_por_fkey
    FOREIGN KEY (creado_por) REFERENCES usuarios(id),
  CONSTRAINT bloqueos_agenda_fin_after_inicio CHECK (fin > inicio),
  CONSTRAINT bloqueos_agenda_titulo_len CHECK (char_length(btrim(titulo)) BETWEEN 1 AND 120)
);

CREATE INDEX idx_bloqueos_agenda_salon_inicio
  ON bloqueos_agenda (salon_id, inicio);

CREATE TRIGGER bloqueos_agenda_updated_at
  BEFORE UPDATE ON bloqueos_agenda
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE bloqueos_agenda IS
  'Eventos personales. Ocupan la agenda. El link público solo ve inicio/fin vía get_salon_bloqueos_ocupados.';

-- La colaboradora borrada se lleva su evento (no se vuelve bloqueo de todo el salón).

CREATE OR REPLACE FUNCTION bloqueos_agenda_same_salon()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.colaboradora_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = NEW.colaboradora_id AND u.salon_id = NEW.salon_id
  ) THEN
    RAISE EXCEPTION 'BLOQUEO_SALON: colaboradora de otro salón'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = NEW.creado_por AND u.salon_id = NEW.salon_id
  ) THEN
    RAISE EXCEPTION 'BLOQUEO_SALON: creado_por de otro salón'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER bloqueos_agenda_same_salon
  BEFORE INSERT OR UPDATE OF salon_id, colaboradora_id, creado_por
  ON bloqueos_agenda
  FOR EACH ROW EXECUTE FUNCTION bloqueos_agenda_same_salon();

-- Cita nueva encima de un evento. SECURITY DEFINER: el link anónimo no puede leer la tabla.
CREATE OR REPLACE FUNCTION prevent_cita_on_bloqueo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.estado::text NOT IN ('pendiente', 'pendiente_validacion', 'confirmada') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM bloqueos_agenda b
    WHERE b.salon_id = NEW.salon_id
      AND tstzrange(b.inicio, b.fin, '[)') && tstzrange(NEW.inicio, NEW.fin, '[)')
      AND (
        NEW.colaboradora_id IS NULL
        OR b.colaboradora_id IS NULL
        OR b.colaboradora_id = NEW.colaboradora_id
      )
  ) THEN
    RAISE EXCEPTION 'CITA_BLOQUEO: horario bloqueado'
      USING ERRCODE = 'exclusion_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER citas_prevent_bloqueo
  BEFORE INSERT OR UPDATE OF inicio, fin, colaboradora_id, estado
  ON citas
  FOR EACH ROW EXECUTE FUNCTION prevent_cita_on_bloqueo();

-- Evento encima de una cita bloqueante. El mensaje lleva nombre y hora para el panel.
CREATE OR REPLACE FUNCTION prevent_bloqueo_on_cita()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre TEXT;
  v_inicio TIMESTAMPTZ;
  v_fin TIMESTAMPTZ;
BEGIN
  SELECT cl.nombre, c.inicio, c.fin
    INTO v_nombre, v_inicio, v_fin
  FROM citas c
  JOIN clientas cl ON cl.id = c.clienta_id
  WHERE c.salon_id = NEW.salon_id
    AND c.estado::text IN ('pendiente', 'pendiente_validacion', 'confirmada')
    AND tstzrange(c.inicio, c.fin, '[)') && tstzrange(NEW.inicio, NEW.fin, '[)')
    AND (
      NEW.colaboradora_id IS NULL
      OR c.colaboradora_id IS NULL
      OR c.colaboradora_id = NEW.colaboradora_id
    )
  ORDER BY c.inicio
  LIMIT 1;

  IF v_nombre IS NOT NULL THEN
    RAISE EXCEPTION 'BLOQUEO_CITA: %|%|%', v_nombre, v_inicio, v_fin
      USING ERRCODE = 'exclusion_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER bloqueos_agenda_prevent_cita
  BEFORE INSERT OR UPDATE OF inicio, fin, colaboradora_id
  ON bloqueos_agenda
  FOR EACH ROW EXECUTE FUNCTION prevent_bloqueo_on_cita();

-- Link público: solo ocupación. Salón inactivo no aparece.
CREATE OR REPLACE FUNCTION get_salon_bloqueos_ocupados(
  p_salon_id UUID,
  p_desde TIMESTAMPTZ,
  p_hasta TIMESTAMPTZ
)
RETURNS TABLE (
  inicio TIMESTAMPTZ,
  fin TIMESTAMPTZ,
  colaboradora_id UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.inicio, b.fin, b.colaboradora_id
  FROM bloqueos_agenda b
  JOIN salones s ON s.id = b.salon_id
  WHERE b.salon_id = p_salon_id
    AND s.activo = true
    AND b.inicio < p_hasta
    AND b.fin > p_desde;
$$;

REVOKE ALL ON FUNCTION get_salon_bloqueos_ocupados(UUID, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_salon_bloqueos_ocupados(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;

ALTER TABLE bloqueos_agenda ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE bloqueos_agenda FROM anon, PUBLIC;

CREATE POLICY "bloqueos_agenda_select" ON bloqueos_agenda
  FOR SELECT TO authenticated
  USING (
    salon_id = get_user_salon_id()
    AND (
      get_user_rol() = 'admin_salon'
      OR colaboradora_id IS NULL
      OR colaboradora_id = auth.uid()
    )
  );

CREATE POLICY "bloqueos_agenda_insert" ON bloqueos_agenda
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND creado_por = auth.uid()
    AND (
      get_user_rol() = 'admin_salon'
      OR (get_user_rol() = 'colaboradora' AND colaboradora_id = auth.uid())
    )
  );

CREATE POLICY "bloqueos_agenda_update" ON bloqueos_agenda
  FOR UPDATE TO authenticated
  USING (
    salon_id = get_user_salon_id()
    AND (
      get_user_rol() = 'admin_salon'
      OR colaboradora_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND (
      get_user_rol() = 'admin_salon'
      OR (get_user_rol() = 'colaboradora' AND colaboradora_id = auth.uid())
    )
  );

CREATE POLICY "bloqueos_agenda_delete" ON bloqueos_agenda
  FOR DELETE TO authenticated
  USING (
    salon_id = get_user_salon_id()
    AND (
      get_user_rol() = 'admin_salon'
      OR colaboradora_id = auth.uid()
    )
  );
