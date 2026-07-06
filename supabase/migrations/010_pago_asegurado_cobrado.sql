-- CITABELLA: separate payment secured (asegurado) from income recognized (cobrado)

ALTER TYPE pago_estado ADD VALUE IF NOT EXISTS 'asegurado';
ALTER TYPE pago_estado ADD VALUE IF NOT EXISTS 'cobrado';

ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS asegurado_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cobrado_at TIMESTAMPTZ;

COMMENT ON COLUMN pagos.asegurado_at IS 'When admin confirmed reservation (not income yet)';
COMMENT ON COLUMN pagos.cobrado_at IS 'When payment counted as salon income (cita completed)';
