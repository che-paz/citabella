-- CITABELLA — Founders pilot (Ruth + Andrea)
-- Seguro de re-ejecutar con ON CONFLICT / upsert donde aplica.
--
-- PREREQUISITO: usuarios en Supabase Auth (o ejecutar scripts/provision-founders-pilot.mjs)
--   ruth@gmail.com   → Ruth Guzman / Salón Tutis
--   andrea@gmail.com → Andrea Juarez / Galaxy Barberia Infantil
--
-- Horarios por defecto: Lun–Vie 09:00–18:00, Sáb 09:00–14:00
-- Catálogo y citas: vacíos (ellas lo arman en /catalogo)

INSERT INTO salones (id, nombre, slug, plan_tipo, politica_reembolso, slot_step_minutes) VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    'Salón Tutis',
    'salon-tutis',
    'founder',
    'Cancelación con 24 horas de anticipación para reembolso del anticipo.',
    60
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Galaxy Barberia Infantil',
    'galaxy-barberia-infantil',
    'founder',
    'Cancelación con 24 horas de anticipación para reembolso del anticipo.',
    60
  )
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  slug = EXCLUDED.slug,
  plan_tipo = EXCLUDED.plan_tipo,
  politica_reembolso = EXCLUDED.politica_reembolso,
  slot_step_minutes = EXCLUDED.slot_step_minutes;

INSERT INTO usuarios (id, salon_id, email, nombre, rol)
SELECT
  u.id,
  CASE u.email
    WHEN 'ruth@gmail.com' THEN '22222222-2222-2222-2222-222222222201'::uuid
    WHEN 'andrea@gmail.com' THEN '22222222-2222-2222-2222-222222222202'::uuid
  END,
  u.email,
  CASE u.email
    WHEN 'ruth@gmail.com' THEN 'Ruth Guzman'
    WHEN 'andrea@gmail.com' THEN 'Andrea Juarez'
  END,
  'admin_salon'::usuario_rol
FROM auth.users u
WHERE u.email IN ('ruth@gmail.com', 'andrea@gmail.com')
ON CONFLICT (id) DO UPDATE SET
  salon_id = EXCLUDED.salon_id,
  email = EXCLUDED.email,
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol;

INSERT INTO horarios_salon (salon_id, dia_semana, hora_inicio, hora_fin)
SELECT s.id, h.dia_semana, h.hora_inicio, h.hora_fin
FROM salones s
CROSS JOIN (VALUES
  (1, '09:00', '18:00'),
  (2, '09:00', '18:00'),
  (3, '09:00', '18:00'),
  (4, '09:00', '18:00'),
  (5, '09:00', '18:00'),
  (6, '09:00', '14:00')
) AS h(dia_semana, hora_inicio, hora_fin)
WHERE s.slug IN ('salon-tutis', 'galaxy-barberia-infantil')
ON CONFLICT (salon_id, dia_semana) DO UPDATE SET
  hora_inicio = EXCLUDED.hora_inicio,
  hora_fin = EXCLUDED.hora_fin;
