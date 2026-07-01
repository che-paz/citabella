-- CITABELLA — Diagnóstico agenda (ejecutar en SQL Editor)
-- Interpreta los resultados antes de correr seed-cloud-agenda.sql

-- 1) ¿Existen las tablas de agenda?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('clientas', 'horarios_salon', 'excepciones_horario', 'citas')
ORDER BY table_name;
-- Esperado: 4 filas. Si faltan → ejecuta 003_agenda_schema.sql y 004_agenda_rls.sql

-- 2) ¿Existe el salón de prueba?
SELECT id, nombre, slug FROM salones WHERE slug = 'belleza-luna';
-- Esperado: 1 fila

-- 3) ¿Existen usuarios auth + usuarios?
SELECT u.id, u.email, u.nombre, u.rol
FROM usuarios u
WHERE u.email IN ('admin@belleza-luna.test', 'maria@belleza-luna.test');
-- Esperado: 2 filas. Si 0 → crea users en Auth y vuelve a correr seed-cloud.sql (parte usuarios)

-- 4) Conteos actuales (postgres bypass RLS)
SELECT
  (SELECT COUNT(*) FROM clientas) AS clientas,
  (SELECT COUNT(*) FROM horarios_salon) AS horarios,
  (SELECT COUNT(*) FROM excepciones_horario) AS excepciones,
  (SELECT COUNT(*) FROM citas) AS citas;
