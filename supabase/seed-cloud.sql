-- CITABELLA — Seed para Supabase Cloud
-- Seguro de re-ejecutar: usa ON CONFLICT DO NOTHING en filas existentes.
--
-- PREREQUISITO: crear estos usuarios en Dashboard → Authentication → Users
--   admin@belleza-luna.test  / Admin123!  (Auto-confirm user: ON)
--   maria@belleza-luna.test  / Colab123!  (Auto-confirm user: ON)
--
-- Si ya tienes salón/catálogo y solo faltan datos de agenda,
-- ejecuta: supabase/seed-cloud-agenda.sql
-- Diagnóstico previo: supabase/diagnostics-agenda.sql

INSERT INTO salones (
  id,
  nombre,
  slug,
  plan_tipo,
  politica_reembolso
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Belleza Luna',
  'belleza-luna',
  'founder',
  'Cancelación con 24 horas de anticipación para reembolso del anticipo.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuarios (id, salon_id, email, nombre, rol)
SELECT
  u.id,
  '11111111-1111-1111-1111-111111111111',
  u.email,
  CASE u.email
    WHEN 'admin@belleza-luna.test' THEN 'Ana García'
    WHEN 'maria@belleza-luna.test' THEN 'María López'
  END,
  CASE u.email
    WHEN 'admin@belleza-luna.test' THEN 'admin_salon'::usuario_rol
    WHEN 'maria@belleza-luna.test' THEN 'colaboradora'::usuario_rol
  END
FROM auth.users u
WHERE u.email IN ('admin@belleza-luna.test', 'maria@belleza-luna.test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, salon_id, nombre, categoria, precio, duracion_minutos, descripcion) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Maquillaje social', 'maquillaje_social', 250.00, 60, 'Maquillaje para eventos y ocasiones especiales.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Maquillaje novia', 'novias', 800.00, 120, 'Look completo para el día de la boda.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Peinado elegante', 'peinado', 180.00, 45, 'Peinado para eventos.'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Diseño de cejas', 'cejas', 75.00, 30, 'Perfilado y diseño de cejas.'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Manicure gel', 'unas', 120.00, 60, 'Manicure con esmalte en gel.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO paquetes (id, salon_id, nombre, precio, duracion_minutos) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'Paquete Novia Completo', 950.00, 180)
ON CONFLICT (id) DO NOTHING;

INSERT INTO paquete_servicios (paquete_id, servicio_id, orden) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2)
ON CONFLICT (paquete_id, servicio_id) DO NOTHING;

-- ========== Agenda (Sprint 02) ==========

INSERT INTO clientas (id, salon_id, nombre, telefono, email) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Sofía Martínez', '50255501001', 'sofia@example.com'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Carmen Reyes', '50255501002', NULL),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Laura Méndez', '50255501003', 'laura@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO horarios_salon (salon_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 2, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 3, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 4, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 5, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 6, '09:00', '14:00')
ON CONFLICT (salon_id, dia_semana) DO NOTHING;

INSERT INTO excepciones_horario (salon_id, fecha, cerrado) VALUES
  ('11111111-1111-1111-1111-111111111111', '2026-12-25', true)
ON CONFLICT (salon_id, fecha) DO NOTHING;

INSERT INTO citas (id, salon_id, clienta_id, servicio_id, colaboradora_id, inicio, fin, estado, creada_por)
SELECT
  c.id,
  '11111111-1111-1111-1111-111111111111',
  c.clienta_id,
  c.servicio_id,
  u.id,
  c.inicio,
  c.fin,
  c.estado::cita_estado,
  c.creada_por::cita_creada_por
FROM (VALUES
  ('77777777-7777-7777-7777-777777777771'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2026-07-02T16:00:00Z'::timestamptz, '2026-07-02T17:00:00Z'::timestamptz, 'confirmada', 'admin'),
  ('77777777-7777-7777-7777-777777777772', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-07-02T20:00:00Z', '2026-07-02T22:00:00Z', 'pendiente', 'admin'),
  ('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2026-07-03T15:00:00Z', '2026-07-03T15:30:00Z', 'confirmada', 'colaboradora'),
  ('77777777-7777-7777-7777-777777777774', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-07-04T17:00:00Z', '2026-07-04T17:45:00Z', 'cancelada', 'admin'),
  ('77777777-7777-7777-7777-777777777775', '55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-07-05T21:00:00Z', '2026-07-05T22:00:00Z', 'pendiente_validacion', 'admin')
) AS c(id, clienta_id, servicio_id, inicio, fin, estado, creada_por)
CROSS JOIN auth.users u
WHERE u.email = 'maria@belleza-luna.test'
ON CONFLICT (id) DO NOTHING;
