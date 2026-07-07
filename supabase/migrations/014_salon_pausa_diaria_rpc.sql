-- CITABELLA: lectura pública de pausa diaria (link de reserva)

CREATE OR REPLACE FUNCTION get_salon_pausa_diaria(p_salon_id UUID)
RETURNS TABLE (
  activa BOOLEAN,
  hora_inicio TIME,
  hora_fin TIME
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.pausa_diaria_activa,
    s.pausa_hora_inicio,
    s.pausa_hora_fin
  FROM salones s
  WHERE s.id = p_salon_id
    AND s.activo = true;
$$;

GRANT EXECUTE ON FUNCTION get_salon_pausa_diaria(UUID) TO anon, authenticated;
