-- Recordatorios v1. Solo aditivo.
-- No hay UPDATE ni DELETE de filas existentes.
-- bloqueos_agenda.recordatorio_minutos queda NULL: los eventos ya creados no avisan.
-- salones.recordatorio_citas_minutos queda NULL: citas apagadas en todos los salones.
-- citas no cambia de columnas. Un reagendado avisa otra vez porque la clave
-- de recordatorios_enviados incluye inicio_programado.

ALTER TABLE bloqueos_agenda
  ADD COLUMN recordatorio_minutos INT NULL,
  ADD COLUMN recordatorio_enviado_at TIMESTAMPTZ NULL;

ALTER TABLE bloqueos_agenda
  ADD CONSTRAINT bloqueos_agenda_recordatorio_minutos_check
  CHECK (
    recordatorio_minutos IS NULL
    OR recordatorio_minutos IN (15, 30, 60, 1440)
  );

ALTER TABLE salones
  ADD COLUMN recordatorio_citas_minutos INT NULL;

ALTER TABLE salones
  ADD CONSTRAINT salones_recordatorio_citas_minutos_check
  CHECK (
    recordatorio_citas_minutos IS NULL
    OR recordatorio_citas_minutos IN (15, 30, 60)
  );

CREATE INDEX idx_bloqueos_agenda_recordatorio_pendiente
  ON bloqueos_agenda (inicio)
  WHERE recordatorio_minutos IS NOT NULL
    AND recordatorio_enviado_at IS NULL;

CREATE TABLE recordatorios_enviados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
  inicio_programado TIMESTAMPTZ NOT NULL,
  minutos INT NOT NULL,
  enviado_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recordatorios_enviados_minutos_check
    CHECK (minutos IN (15, 30, 60)),
  CONSTRAINT recordatorios_enviados_cita_inicio_key
    UNIQUE (cita_id, inicio_programado)
);

CREATE INDEX idx_recordatorios_enviados_salon
  ON recordatorios_enviados (salon_id);

CREATE TRIGGER recordatorios_enviados_updated_at
  BEFORE UPDATE ON recordatorios_enviados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE recordatorios_enviados IS
  'Avisos de citas ya reclamados. UNIQUE (cita_id, inicio_programado): un reagendado puede avisar de nuevo. No guarda columnas en citas.';

COMMENT ON COLUMN salones.recordatorio_citas_minutos IS
  'Minutos de anticipación del push de citas. NULL = apagado.';

COMMENT ON COLUMN bloqueos_agenda.recordatorio_minutos IS
  'Minutos antes del inicio. NULL = sin aviso. 1440 = 1 día.';

ALTER TABLE recordatorios_enviados ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE recordatorios_enviados FROM anon, PUBLIC;

CREATE POLICY "recordatorios_enviados_select"
  ON recordatorios_enviados FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

-- El panel no escribe el registro. Solo el service role (cron), que salta RLS.
CREATE POLICY "recordatorios_enviados_insert"
  ON recordatorios_enviados FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "recordatorios_enviados_update"
  ON recordatorios_enviados FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "recordatorios_enviados_delete"
  ON recordatorios_enviados FOR DELETE TO authenticated
  USING (false);

-- Reclamo atómico. La ventana (5 min atrás, 5 min adelante) es la misma que
-- src/lib/reminders/window.ts. Solo devuelve filas que esta llamada marcó.

CREATE OR REPLACE FUNCTION claim_evento_recordatorios(p_ids jsonb)
RETURNS TABLE (
  id UUID,
  salon_id UUID,
  titulo TEXT,
  inicio TIMESTAMPTZ,
  recordatorio_minutos INT,
  timezone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  IF p_ids IS NULL
    OR jsonb_typeof(p_ids) <> 'array'
    OR jsonb_array_length(p_ids) = 0 THEN
    RETURN;
  END IF;

  IF jsonb_array_length(p_ids) > 500 THEN
    RAISE EXCEPTION 'claim_evento_recordatorios: demasiados ids';
  END IF;

  RETURN QUERY
  WITH ids AS (
    SELECT DISTINCT value::uuid AS id
    FROM jsonb_array_elements_text(p_ids) AS t(value)
  ),
  claimed AS (
    UPDATE bloqueos_agenda b
    SET recordatorio_enviado_at = now()
    WHERE b.id IN (SELECT ids.id FROM ids)
      AND b.recordatorio_minutos IS NOT NULL
      AND b.recordatorio_enviado_at IS NULL
      AND b.inicio > now()
      AND (b.inicio - make_interval(mins => b.recordatorio_minutos))
          <= now() + interval '5 minutes'
      AND (b.inicio - make_interval(mins => b.recordatorio_minutos))
          >= now() - interval '5 minutes'
    RETURNING
      b.id,
      b.salon_id,
      b.titulo,
      b.inicio,
      b.recordatorio_minutos
  )
  SELECT
    c.id,
    c.salon_id,
    c.titulo,
    c.inicio,
    c.recordatorio_minutos,
    s.timezone
  FROM claimed c
  JOIN salones s ON s.id = c.salon_id;
END;
$$;

CREATE OR REPLACE FUNCTION claim_cita_recordatorios(p_rows jsonb)
RETURNS TABLE (
  salon_id UUID,
  cita_id UUID,
  inicio_programado TIMESTAMPTZ,
  minutos INT,
  timezone TEXT,
  clienta_nombre TEXT,
  servicio_nombre TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  IF p_rows IS NULL
    OR jsonb_typeof(p_rows) <> 'array'
    OR jsonb_array_length(p_rows) = 0 THEN
    RETURN;
  END IF;

  IF jsonb_array_length(p_rows) > 500 THEN
    RAISE EXCEPTION 'claim_cita_recordatorios: demasiadas citas';
  END IF;

  RETURN QUERY
  WITH input AS (
    SELECT DISTINCT
      (row->>'cita_id')::uuid AS cita_id,
      (row->>'inicio')::timestamptz AS inicio_programado
    FROM jsonb_array_elements(p_rows) AS t(row)
  ),
  claimed AS (
    INSERT INTO recordatorios_enviados (
      salon_id,
      cita_id,
      inicio_programado,
      minutos
    )
    SELECT
      c.salon_id,
      c.id,
      c.inicio,
      s.recordatorio_citas_minutos
    FROM input i
    JOIN citas c
      ON c.id = i.cita_id
     AND c.inicio = i.inicio_programado
    JOIN salones s ON s.id = c.salon_id
    WHERE c.estado::text IN ('pendiente_validacion', 'confirmada')
      AND c.inicio > now()
      AND s.recordatorio_citas_minutos IS NOT NULL
      AND (c.inicio - make_interval(mins => s.recordatorio_citas_minutos))
          <= now() + interval '5 minutes'
      AND (c.inicio - make_interval(mins => s.recordatorio_citas_minutos))
          >= now() - interval '5 minutes'
    ON CONFLICT (cita_id, inicio_programado) DO NOTHING
    RETURNING
      recordatorios_enviados.salon_id,
      recordatorios_enviados.cita_id,
      recordatorios_enviados.inicio_programado,
      recordatorios_enviados.minutos
  )
  SELECT
    clm.salon_id,
    clm.cita_id,
    clm.inicio_programado,
    clm.minutos,
    s.timezone,
    cl.nombre,
    COALESCE(sv.nombre, pq.nombre, 'Cita')
  FROM claimed clm
  JOIN citas c
    ON c.id = clm.cita_id
   AND c.inicio = clm.inicio_programado
   AND c.estado::text IN ('pendiente_validacion', 'confirmada')
   AND c.inicio > now()
  JOIN salones s ON s.id = clm.salon_id
  JOIN clientas cl ON cl.id = c.clienta_id
  LEFT JOIN servicios sv ON sv.id = c.servicio_id
  LEFT JOIN paquetes pq ON pq.id = c.paquete_id;
END;
$$;

REVOKE ALL ON FUNCTION claim_evento_recordatorios(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION claim_cita_recordatorios(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_evento_recordatorios(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION claim_cita_recordatorios(jsonb) TO service_role;

NOTIFY pgrst, 'reload schema';
