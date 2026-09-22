-- Prevent overlapping blocking appointments (same salon capacity rules as app engine).
-- Trigger (not EXCLUDE): applies to new writes only, so existing pilot overlaps can be fixed in UI first.

CREATE OR REPLACE FUNCTION prevent_cita_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.estado::text NOT IN ('pendiente', 'pendiente_validacion', 'confirmada') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM citas c
    WHERE c.salon_id = NEW.salon_id
      AND c.id IS DISTINCT FROM NEW.id
      AND c.estado::text IN ('pendiente', 'pendiente_validacion', 'confirmada')
      AND tstzrange(c.inicio, c.fin, '[)') && tstzrange(NEW.inicio, NEW.fin, '[)')
      AND (
        -- Public / unassigned blocks everyone; assigned blocks same stylist + unassigned
        NEW.colaboradora_id IS NULL
        OR c.colaboradora_id IS NULL
        OR c.colaboradora_id = NEW.colaboradora_id
      )
  ) THEN
    RAISE EXCEPTION 'CITA_OVERLAP: horario ocupado'
      USING ERRCODE = 'exclusion_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS citas_prevent_overlap ON citas;

CREATE TRIGGER citas_prevent_overlap
  BEFORE INSERT OR UPDATE OF inicio, fin, colaboradora_id, estado
  ON citas
  FOR EACH ROW
  EXECUTE FUNCTION prevent_cita_overlap();

COMMENT ON FUNCTION prevent_cita_overlap IS
  'Blocks overlapping citas in pendiente/pendiente_validacion/confirmada; null colaboradora = salon-wide lock';
