-- Allow several clientas to share one WhatsApp (mamá + hijos).
-- Public upsert must not overwrite sibling names when phone is shared.

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
  v_nombre TEXT := trim(p_nombre);
  v_count INT;
BEGIN
  IF NOT is_public_salon(p_salon_id) THEN
    RAISE EXCEPTION 'Salón no disponible';
  END IF;

  IF length(v_nombre) < 2 THEN
    RAISE EXCEPTION 'Nombre inválido';
  END IF;

  IF v_phone IS NULL THEN
    RAISE EXCEPTION 'Teléfono inválido';
  END IF;

  -- Prefer exact phone + name match (reuse that ficha)
  SELECT id INTO v_id
  FROM clientas
  WHERE salon_id = p_salon_id
    AND normalize_phone_storage(telefono) = v_phone
    AND lower(trim(nombre)) = lower(v_nombre)
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE clientas
    SET nombre = v_nombre, telefono = v_phone
    WHERE id = v_id;
    RETURN v_id;
  END IF;

  SELECT COUNT(*)::INT INTO v_count
  FROM clientas
  WHERE salon_id = p_salon_id
    AND normalize_phone_storage(telefono) = v_phone;

  -- No ficha yet for this WhatsApp
  IF v_count = 0 THEN
    INSERT INTO clientas (salon_id, nombre, telefono)
    VALUES (p_salon_id, v_nombre, v_phone)
    RETURNING id INTO v_id;
    RETURN v_id;
  END IF;

  -- Single ficha: legacy behavior (Tutis) — update name on rebook
  IF v_count = 1 THEN
    SELECT id INTO v_id
    FROM clientas
    WHERE salon_id = p_salon_id
      AND normalize_phone_storage(telefono) = v_phone
    LIMIT 1;

    UPDATE clientas
    SET nombre = v_nombre, telefono = v_phone
    WHERE id = v_id;
    RETURN v_id;
  END IF;

  -- Shared WhatsApp (2+ fichas): never overwrite siblings — create new
  INSERT INTO clientas (salon_id, nombre, telefono)
  VALUES (p_salon_id, v_nombre, v_phone)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION upsert_clienta_public IS
  'Public booking clienta upsert; shared phones OK; does not overwrite siblings when 2+ fichas share WhatsApp';
