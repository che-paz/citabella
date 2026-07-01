-- CITABELLA: fixes public booking upload + rollback (Sprint 02B)
-- Run after 005_public_booking_rls.sql

-- Rollback orphaned reservations when comprobante upload fails
CREATE OR REPLACE FUNCTION cancel_reserva_public(p_cita_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM citas
  WHERE id = p_cita_id
    AND creada_por = 'clienta'
    AND estado = 'pendiente_validacion';
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_reserva_public(UUID) TO anon, authenticated;

-- Public booking while logged in (e.g. admin testing /reservar/[slug])
CREATE POLICY "citas_public_insert_auth" ON citas
  FOR INSERT TO authenticated
  WITH CHECK (
    is_public_salon(salon_id)
    AND creada_por = 'clienta'
    AND estado = 'pendiente_validacion'
  );

CREATE POLICY "pagos_public_insert_auth" ON pagos
  FOR INSERT TO authenticated
  WITH CHECK (
    is_public_salon(salon_id)
    AND estado = 'pendiente'
    AND EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id = pagos.cita_id
        AND c.salon_id = pagos.salon_id
        AND c.creada_por = 'clienta'
        AND c.estado = 'pendiente_validacion'
    )
  );

CREATE POLICY "pagos_public_update" ON pagos
  FOR UPDATE TO anon, authenticated
  USING (
    estado = 'pendiente'
    AND EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id = pagos.cita_id
        AND c.salon_id = pagos.salon_id
        AND c.creada_por = 'clienta'
        AND c.estado = 'pendiente_validacion'
    )
  )
  WITH CHECK (
    estado = 'pendiente'
    AND EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id = pagos.cita_id
        AND c.salon_id = pagos.salon_id
        AND c.creada_por = 'clienta'
        AND c.estado = 'pendiente_validacion'
    )
  );

-- Storage: allow authenticated uploads (same rules as anon)
CREATE POLICY "comprobantes_insert_authenticated" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'comprobantes'
    AND EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id::text = (storage.foldername(name))[2]
        AND c.salon_id::text = (storage.foldername(name))[1]
        AND c.creada_por = 'clienta'
        AND c.estado = 'pendiente_validacion'
    )
  );

CREATE POLICY "comprobantes_delete_authenticated" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'comprobantes'
    AND EXISTS (
      SELECT 1 FROM citas c
      WHERE c.id::text = (storage.foldername(name))[2]
        AND c.salon_id::text = (storage.foldername(name))[1]
        AND c.creada_por = 'clienta'
        AND c.estado = 'pendiente_validacion'
    )
  );

-- HEIC photos from iOS
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf'
]
WHERE id = 'comprobantes';
