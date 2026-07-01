-- CITABELLA — Seed SOLO agenda (Supabase Cloud)
-- Ejecutar DESPUÉS de 003_agenda_schema.sql + 004_agenda_rls.sql
-- No duplica salón ni catálogo. Resuelve salon_id por slug.
--
-- Si algo falla, ejecuta diagnostics-agenda.sql primero.

DO $$
DECLARE
  v_salon_id UUID;
  v_colab_id UUID;
  v_inserted INT;
BEGIN
  SELECT id INTO v_salon_id
  FROM salones
  WHERE slug = 'belleza-luna'
  LIMIT 1;

  IF v_salon_id IS NULL THEN
    RAISE EXCEPTION 'Salón belleza-luna no encontrado. Corre seed-cloud.sql (parte salón) primero.';
  END IF;

  SELECT id INTO v_colab_id
  FROM usuarios
  WHERE email = 'maria@belleza-luna.test'
    AND salon_id = v_salon_id
  LIMIT 1;

  IF v_colab_id IS NULL THEN
    RAISE WARNING 'Colaboradora maria@belleza-luna.test no encontrada en usuarios. Citas se crearán sin colaboradora_id.';
  END IF;

  -- Clientas
  INSERT INTO clientas (id, salon_id, nombre, telefono, email)
  SELECT v.id, v_salon_id, v.nombre, v.telefono, v.email
  FROM (VALUES
    ('44444444-4444-4444-4444-444444444444'::uuid, 'Sofía Martínez', '50255501001', 'sofia@example.com'),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'Carmen Reyes', '50255501002', NULL::text),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'Laura Méndez', '50255501003', 'laura@example.com')
  ) AS v(id, nombre, telefono, email)
  WHERE NOT EXISTS (SELECT 1 FROM clientas c WHERE c.id = v.id);
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Clientas insertadas: %', v_inserted;

  -- Horarios Lun–Sáb
  INSERT INTO horarios_salon (salon_id, dia_semana, hora_inicio, hora_fin)
  SELECT v_salon_id, v.dia_semana, v.hora_inicio::time, v.hora_fin::time
  FROM (VALUES
    (1, '09:00', '18:00'),
    (2, '09:00', '18:00'),
    (3, '09:00', '18:00'),
    (4, '09:00', '18:00'),
    (5, '09:00', '18:00'),
    (6, '09:00', '14:00')
  ) AS v(dia_semana, hora_inicio, hora_fin)
  WHERE NOT EXISTS (
    SELECT 1 FROM horarios_salon h
    WHERE h.salon_id = v_salon_id AND h.dia_semana = v.dia_semana
  );
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Horarios insertados: %', v_inserted;

  -- Excepción Navidad
  INSERT INTO excepciones_horario (salon_id, fecha, cerrado)
  SELECT v_salon_id, '2026-12-25'::date, true
  WHERE NOT EXISTS (
    SELECT 1 FROM excepciones_horario e
    WHERE e.salon_id = v_salon_id AND e.fecha = '2026-12-25'
  );
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Excepciones insertadas: %', v_inserted;

  -- Citas de prueba
  INSERT INTO citas (id, salon_id, clienta_id, servicio_id, colaboradora_id, inicio, fin, estado, creada_por)
  SELECT
    v.id,
    v_salon_id,
    v.clienta_id,
    v.servicio_id,
    v_colab_id,
    v.inicio,
    v.fin,
    v.estado::cita_estado,
    v.creada_por::cita_creada_por
  FROM (VALUES
    ('77777777-7777-7777-7777-777777777771'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2026-07-02T16:00:00Z'::timestamptz, '2026-07-02T17:00:00Z'::timestamptz, 'confirmada', 'admin'),
    ('77777777-7777-7777-7777-777777777772'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2026-07-02T20:00:00Z'::timestamptz, '2026-07-02T22:00:00Z'::timestamptz, 'pendiente', 'admin'),
    ('77777777-7777-7777-7777-777777777773'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '2026-07-03T15:00:00Z'::timestamptz, '2026-07-03T15:30:00Z'::timestamptz, 'confirmada', 'colaboradora'),
    ('77777777-7777-7777-7777-777777777774'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '2026-07-04T17:00:00Z'::timestamptz, '2026-07-04T17:45:00Z'::timestamptz, 'cancelada', 'admin'),
    ('77777777-7777-7777-7777-777777777775'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '2026-07-05T21:00:00Z'::timestamptz, '2026-07-05T22:00:00Z'::timestamptz, 'pendiente_validacion', 'admin')
  ) AS v(id, clienta_id, servicio_id, inicio, fin, estado, creada_por)
  WHERE NOT EXISTS (SELECT 1 FROM citas c WHERE c.id = v.id);
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Citas insertadas: %', v_inserted;

  RAISE NOTICE 'Listo. Verifica: SELECT COUNT(*) FROM clientas; (esperado 3)';
END $$;

-- Verificación final
SELECT
  (SELECT COUNT(*) FROM clientas) AS clientas,
  (SELECT COUNT(*) FROM horarios_salon) AS horarios,
  (SELECT COUNT(*) FROM excepciones_horario) AS excepciones,
  (SELECT COUNT(*) FROM citas) AS citas;
