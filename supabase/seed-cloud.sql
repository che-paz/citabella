-- CITABELLA — Seed para Supabase Cloud
-- PREREQUISITO: crear estos usuarios en Dashboard → Authentication → Users
--   admin@belleza-luna.test  / Admin123!  (Auto-confirm user: ON)
--   maria@belleza-luna.test  / Colab123!  (Auto-confirm user: ON)

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
WHERE u.email IN ('admin@belleza-luna.test', 'maria@belleza-luna.test');

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
