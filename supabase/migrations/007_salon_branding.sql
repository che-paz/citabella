-- CITABELLA: salon branding + profile self-update (founders pilot)

ALTER TABLE salones
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Staff can update their own display name
CREATE POLICY "usuarios_update_self" ON usuarios
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND salon_id = get_user_salon_id()
  );

-- Public logos bucket (read via public URL; write admin only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos-salon',
  'logos-salon',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "logos_salon_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'logos-salon'
    AND (storage.foldername(name))[1] = get_user_salon_id()::text
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "logos_salon_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'logos-salon'
    AND (storage.foldername(name))[1] = get_user_salon_id()::text
    AND get_user_rol() = 'admin_salon'
  );

CREATE POLICY "logos_salon_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'logos-salon'
    AND (storage.foldername(name))[1] = get_user_salon_id()::text
    AND get_user_rol() = 'admin_salon'
  );
