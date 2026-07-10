-- CITABELLA: reserva para otra persona (contacto ≠ quien asiste)

ALTER TABLE salones
  ADD COLUMN IF NOT EXISTS permite_reserva_otra_persona BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN salones.permite_reserva_otra_persona IS
  'Si true, el link público muestra checkbox para reservar a nombre de otra persona';

ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS beneficiario_nombre TEXT;

COMMENT ON COLUMN citas.beneficiario_nombre IS
  'Nombre de quien asiste si difiere de la clienta de contacto; NULL = la clienta asiste';

-- Galaxy (barbería infantil): activar por defecto
UPDATE salones
SET permite_reserva_otra_persona = true
WHERE slug = 'galaxy-barberia-infantil';
