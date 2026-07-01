-- CITABELLA: RLS policies (multi-tenant by salon_id)

-- Helper: current user's salon_id
CREATE OR REPLACE FUNCTION get_user_salon_id()
RETURNS UUID AS $$
  SELECT salon_id FROM usuarios WHERE id = auth.uid() AND activo = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS usuario_rol AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid() AND activo = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- salones
ALTER TABLE salones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salones_select" ON salones
  FOR SELECT TO authenticated
  USING (id = get_user_salon_id());

CREATE POLICY "salones_update" ON salones
  FOR UPDATE TO authenticated
  USING (id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (id = get_user_salon_id());

-- usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select" ON usuarios
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "usuarios_insert" ON usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "usuarios_update" ON usuarios
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

-- servicios
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicios_select" ON servicios
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "servicios_insert" ON servicios
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "servicios_update" ON servicios
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

-- paquetes
ALTER TABLE paquetes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paquetes_select" ON paquetes
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "paquetes_insert" ON paquetes
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "paquetes_update" ON paquetes
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

-- paquete_servicios (scoped via paquete → salon)
ALTER TABLE paquete_servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paquete_servicios_select" ON paquete_servicios
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paquetes p
      WHERE p.id = paquete_servicios.paquete_id
        AND p.salon_id = get_user_salon_id()
    )
  );

CREATE POLICY "paquete_servicios_insert" ON paquete_servicios
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() = 'admin_salon'
    AND EXISTS (
      SELECT 1 FROM paquetes p
      WHERE p.id = paquete_servicios.paquete_id
        AND p.salon_id = get_user_salon_id()
    )
    AND EXISTS (
      SELECT 1 FROM servicios s
      WHERE s.id = paquete_servicios.servicio_id
        AND s.salon_id = get_user_salon_id()
    )
  );

CREATE POLICY "paquete_servicios_delete" ON paquete_servicios
  FOR DELETE TO authenticated
  USING (
    get_user_rol() = 'admin_salon'
    AND EXISTS (
      SELECT 1 FROM paquetes p
      WHERE p.id = paquete_servicios.paquete_id
        AND p.salon_id = get_user_salon_id()
    )
  );

-- planes_suscripcion (read-only catalog for authenticated users)
ALTER TABLE planes_suscripcion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planes_suscripcion_select" ON planes_suscripcion
  FOR SELECT TO authenticated
  USING (true);
