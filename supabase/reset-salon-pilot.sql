-- CITABELLA — Reset datos transaccionales de un salón (piloto founders)
-- Conserva: salón, usuarios, horarios, catálogo configurado.
-- Borra: citas, pagos, clientas, movimientos contables.
--
-- Uso: reemplaza :salon_slug antes de ejecutar en SQL Editor.
-- Ejemplo slug: salon-tutis | galaxy-barberia-infantil

DO $$
DECLARE
  v_salon_id UUID;
  v_slug TEXT := 'salon-tutis'; -- ← cambiar slug aquí
BEGIN
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
