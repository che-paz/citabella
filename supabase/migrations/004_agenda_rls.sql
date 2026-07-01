-- CITABELLA: RLS for agenda tables (Sprint 02)

ALTER TABLE clientas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientas_select" ON clientas
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "clientas_insert" ON clientas
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "clientas_update" ON clientas
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

ALTER TABLE horarios_salon ENABLE ROW LEVEL SECURITY;

CREATE POLICY "horarios_salon_select" ON horarios_salon
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "horarios_salon_insert" ON horarios_salon
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "horarios_salon_update" ON horarios_salon
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

CREATE POLICY "horarios_salon_delete" ON horarios_salon
  FOR DELETE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon');

ALTER TABLE excepciones_horario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "excepciones_horario_select" ON excepciones_horario
  FOR SELECT TO authenticated
  USING (salon_id = get_user_salon_id());

CREATE POLICY "excepciones_horario_insert" ON excepciones_horario
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "excepciones_horario_update" ON excepciones_horario
  FOR UPDATE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon')
  WITH CHECK (salon_id = get_user_salon_id());

CREATE POLICY "excepciones_horario_delete" ON excepciones_horario
  FOR DELETE TO authenticated
  USING (salon_id = get_user_salon_id() AND get_user_rol() = 'admin_salon');

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "citas_select" ON citas
  FOR SELECT TO authenticated
  USING (
    salon_id = get_user_salon_id()
    AND (
      get_user_rol() = 'admin_salon'
      OR colaboradora_id = auth.uid()
    )
  );

CREATE POLICY "citas_insert" ON citas
  FOR INSERT TO authenticated
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND (
      get_user_rol() = 'admin_salon'
      OR (get_user_rol() = 'colaboradora' AND colaboradora_id = auth.uid())
    )
  );

CREATE POLICY "citas_update" ON citas
  FOR UPDATE TO authenticated
  USING (
    salon_id = get_user_salon_id()
    AND (
      get_user_rol() = 'admin_salon'
      OR colaboradora_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id = get_user_salon_id()
    AND (
      get_user_rol() = 'admin_salon'
      OR colaboradora_id = auth.uid()
    )
  );
