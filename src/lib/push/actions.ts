"use server";

import { requireAdminUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export type PushActionState = {
  error?: string;
  success?: boolean;
};

export async function savePushSubscriptionAction(
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }
): Promise<PushActionState> {
  const user = await requireAdminUser();
  const supabase = await createClient();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      salon_id: user.salon_id,
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "user_id,endpoint" }
  );

  if (error) {
    return { error: "No se pudo guardar la suscripción" };
  }

  return { success: true };
}

export async function removePushSubscriptionAction(
  endpoint: string
): Promise<PushActionState> {
  const user = await requireAdminUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return { error: "No se pudo desactivar las notificaciones" };
  }

  return { success: true };
}
