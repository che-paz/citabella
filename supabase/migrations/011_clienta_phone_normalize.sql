-- CITABELLA: normalize client phone for deduplication (GT/HN/SV)

CREATE OR REPLACE FUNCTION normalize_phone_storage(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  d TEXT := regexp_replace(trim(coalesce(p_phone, '')), '[^0-9]', '', 'g');
BEGIN
  IF length(d) = 11 AND d ~ '^(502|503|504)' THEN
    RETURN d;
  END IF;

  IF length(d) = 8 THEN
    RETURN '502' || d;
  END IF;

  RETURN NULL;
END;
$$;

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
  v_phone TEXT := normalize_phone_storage(p_telefono);
BEGIN
  IF NOT is_public_salon(p_salon_id) THEN
    RAISE EXCEPTION 'Salón no disponible';
  END IF;

  IF length(trim(p_nombre)) < 2 THEN
    RAISE EXCEPTION 'Nombre inválido';
  END IF;

  IF v_phone IS NULL THEN
    RAISE EXCEPTION 'Teléfono inválido';
  END IF;

  SELECT id INTO v_id
  FROM clientas
  WHERE salon_id = p_salon_id
    AND normalize_phone_storage(telefono) = v_phone
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE clientas
    SET nombre = trim(p_nombre), telefono = v_phone
    WHERE id = v_id;
    RETURN v_id;
  END IF;

  INSERT INTO clientas (salon_id, nombre, telefono)
  VALUES (p_salon_id, trim(p_nombre), v_phone)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Normalize existing phones where possible (same salon + normalized key)
UPDATE clientas c
SET telefono = normalize_phone_storage(c.telefono)
WHERE normalize_phone_storage(c.telefono) IS NOT NULL
  AND c.telefono IS DISTINCT FROM normalize_phone_storage(c.telefono);

COMMENT ON FUNCTION normalize_phone_storage IS 'E.164 digits without + for GT/HN/SV; 8-digit locals default to 502';
