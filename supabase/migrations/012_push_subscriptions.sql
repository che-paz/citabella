-- CITABELLA: Web Push subscriptions per admin user

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_salon
  ON push_subscriptions(salon_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_select_own"
  ON push_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND salon_id = get_user_salon_id());

CREATE POLICY "push_subscriptions_insert_own"
  ON push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND salon_id = get_user_salon_id());

CREATE POLICY "push_subscriptions_delete_own"
  ON push_subscriptions FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND salon_id = get_user_salon_id());
