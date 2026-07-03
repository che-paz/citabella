-- CITABELLA: configurable booking slot interval per salon
-- 15 = every 15 min (default), 60 = on-the-hour only (:00)

ALTER TABLE salones
  ADD COLUMN IF NOT EXISTS slot_step_minutes INT NOT NULL DEFAULT 15;

ALTER TABLE salones
  DROP CONSTRAINT IF EXISTS salones_slot_step_minutes_check;

ALTER TABLE salones
  ADD CONSTRAINT salones_slot_step_minutes_check
  CHECK (slot_step_minutes IN (15, 30, 60));

-- Piloto founders: reservas solo en hora exacta
UPDATE salones
SET slot_step_minutes = 60
WHERE slug IN ('salon-tutis', 'galaxy-barberia-infantil');
