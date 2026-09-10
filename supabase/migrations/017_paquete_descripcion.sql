-- Optional description on packages (parity with servicios.descripcion)
ALTER TABLE paquetes
  ADD COLUMN IF NOT EXISTS descripcion TEXT;
