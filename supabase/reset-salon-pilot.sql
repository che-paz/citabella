-- CITABELLA / Gota+Check — Reset datos transaccionales de UN salón
-- Conserva: salón, usuarios, horarios, catálogo.
-- Borra: citas, pagos, clientas, movimientos contables.
--
-- SEGURIDAD (S1.4):
--   1. Pon el slug SOLO del salón que quieres limpiar.
--   2. Tutis y Galaxy están BLOQUEADOS por defecto.
--   3. Solo si realmente debes resetear un founder, pon
--      v_allow_protected := true  (casi nunca).
--
-- Ejemplo seguro: gota-prueba-s13

DO $$
DECLARE
  v_salon_id UUID;
  -- ← slug del salón a limpiar (NO dejar founders aquí)
  v_slug TEXT := 'gota-prueba-s13';
  -- ← true SOLO para forzar reset de slug protegido (Tutis / Galaxy)
  v_allow_protected BOOLEAN := false;
  v_protected TEXT[] := ARRAY[
    'salon-tutis',
    'galaxy-barberia-infantil'
  ];
BEGIN
  IF v_slug IS NULL OR btrim(v_slug) = '' THEN
    RAISE EXCEPTION 'v_slug vacío. Indica el slug del salón a resetear.';
  END IF;

  IF v_slug = ANY (v_protected) AND NOT v_allow_protected THEN
    RAISE EXCEPTION
      'Slug protegido (%). Refusando reset para no borrar citas de founders. Si es intencional, pon v_allow_protected := true.',
      v_slug;
  END IF;

  SELECT id INTO v_salon_id FROM salones WHERE slug = v_slug;
  IF v_salon_id IS NULL THEN
    RAISE EXCEPTION 'Salón no encontrado: %', v_slug;
  END IF;

  DELETE FROM pagos WHERE salon_id = v_salon_id;
  DELETE FROM citas WHERE salon_id = v_salon_id;
  DELETE FROM clientas WHERE salon_id = v_salon_id;
  DELETE FROM movimientos_contables WHERE salon_id = v_salon_id;

  RAISE NOTICE 'Reset completo para salón % (id %)', v_slug, v_salon_id;
END $$;
