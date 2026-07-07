-- CITABELLA: pausa diaria recurrente (ej. almuerzo) por salón

ALTER TABLE salones
  ADD COLUMN IF NOT EXISTS pausa_diaria_activa BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pausa_hora_inicio TIME,
  ADD COLUMN IF NOT EXISTS pausa_hora_fin TIME;

ALTER TABLE salones DROP CONSTRAINT IF EXISTS salones_pausa_diaria_check;

ALTER TABLE salones ADD CONSTRAINT salones_pausa_diaria_check CHECK (
  pausa_diaria_activa = false
  OR (
    pausa_hora_inicio IS NOT NULL
    AND pausa_hora_fin IS NOT NULL
    AND pausa_hora_fin > pausa_hora_inicio
  )
);

COMMENT ON COLUMN salones.pausa_diaria_activa IS 'Si true, bloquea slots en pausa_hora_inicio–pausa_hora_fin cada día laboral';
COMMENT ON COLUMN salones.pausa_hora_inicio IS 'Inicio pausa local del salón (TIME)';
COMMENT ON COLUMN salones.pausa_hora_fin IS 'Fin pausa local del salón (TIME)';
