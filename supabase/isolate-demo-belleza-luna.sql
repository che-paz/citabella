-- CITABELLA / Gota+Check — Aislar demo Belleza Luna (S1.4)
-- Seguro de re-ejecutar.
-- Efecto: el link público /reservar/belleza-luna deja de resolver
-- (get_salon_id_by_slug exige activo = true). Login demo puede seguir
-- existiendo para pruebas internas; no usar para clientas reales.

UPDATE salones
SET
  activo = false,
  nombre = CASE
    WHEN nombre LIKE '%[DEMO]%' THEN nombre
    ELSE nombre || ' [DEMO]'
  END,
  updated_at = NOW()
WHERE slug = 'belleza-luna';

-- Confirmación
SELECT slug, nombre, activo, plan_tipo
FROM salones
WHERE slug = 'belleza-luna';
