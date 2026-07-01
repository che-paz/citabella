-- CITABELLA: development seed (Supabase local con `supabase db reset`)
-- Para Supabase Cloud usar seed-cloud.sql (usuarios creados en Dashboard)
-- Test credentials:
--   Admin: admin@belleza-luna.test / Admin123!
--   Colaboradora: maria@belleza-luna.test / Colab123!

-- Fixed UUIDs for reproducibility
-- Salon: 11111111-1111-1111-1111-111111111111
-- Admin:  22222222-2222-2222-2222-222222222222
-- Colab:  33333333-3333-3333-3333-333333333333

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'admin@belleza-luna.test',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Ana García"}',
  NOW(),
  NOW(),
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated',
  'authenticated',
  'maria@belleza-luna.test',
  crypt('Colab123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"María López"}',
  NOW(),
  NOW(),
  '', '', '', ''
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
(
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'admin@belleza-luna.test'),
  'email',
  '22222222-2222-2222-2222-222222222222',
  NOW(),
  NOW(),
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  jsonb_build_object('sub', '33333333-3333-3333-3333-333333333333', 'email', 'maria@belleza-luna.test'),
  'email',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW(),
  NOW()
);

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
);

INSERT INTO usuarios (id, salon_id, email, nombre, rol) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin@belleza-luna.test', 'Ana García', 'admin_salon'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'maria@belleza-luna.test', 'María López', 'colaboradora');

INSERT INTO servicios (id, salon_id, nombre, categoria, precio, duracion_minutos, descripcion) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Maquillaje social', 'maquillaje_social', 250.00, 60, 'Maquillaje para eventos y ocasiones especiales.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Maquillaje novia', 'novias', 800.00, 120, 'Look completo para el día de la boda.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Peinado elegante', 'peinado', 180.00, 45, 'Peinado para eventos.'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Diseño de cejas', 'cejas', 75.00, 30, 'Perfilado y diseño de cejas.'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Manicure gel', 'unas', 120.00, 60, 'Manicure con esmalte en gel.');

INSERT INTO paquetes (id, salon_id, nombre, precio, duracion_minutos) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'Paquete Novia Completo', 950.00, 180);

INSERT INTO paquete_servicios (paquete_id, servicio_id, orden) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2);

-- Clientas
INSERT INTO clientas (id, salon_id, nombre, telefono, email) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Sofía Martínez', '50255501001', 'sofia@example.com'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Carmen Reyes', '50255501002', NULL),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Laura Méndez', '50255501003', 'laura@example.com');

-- Horarios: Lun–Sáb (domingo cerrado)
INSERT INTO horarios_salon (salon_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 2, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 3, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 4, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 5, '09:00', '18:00'),
  ('11111111-1111-1111-1111-111111111111', 6, '09:00', '14:00');

-- Excepción: Navidad cerrado
INSERT INTO excepciones_horario (salon_id, fecha, cerrado) VALUES
  ('11111111-1111-1111-1111-111111111111', '2026-12-25', true);

-- Citas de prueba (America/Guatemala, colaboradora María)
INSERT INTO citas (id, salon_id, clienta_id, servicio_id, colaboradora_id, inicio, fin, estado, creada_por) VALUES
  ('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '2026-07-02T16:00:00Z', '2026-07-02T17:00:00Z', 'confirmada', 'admin'),
  ('77777777-7777-7777-7777-777777777772', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', '2026-07-02T20:00:00Z', '2026-07-02T22:00:00Z', 'pendiente', 'admin'),
  ('77777777-7777-7777-7777-777777777773', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '2026-07-03T15:00:00Z', '2026-07-03T15:30:00Z', 'confirmada', 'colaboradora'),
  ('77777777-7777-7777-7777-777777777774', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '2026-07-04T17:00:00Z', '2026-07-04T17:45:00Z', 'cancelada', 'admin'),
  ('77777777-7777-7777-7777-777777777775', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', '2026-07-05T21:00:00Z', '2026-07-05T22:00:00Z', 'pendiente_validacion', 'admin');
