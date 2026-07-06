"use server";

import { requireAdminUser } from "@/lib/auth/get-user";
import { sendPushToSalon } from "@/lib/push/send";
import { isPushConfigured } from "@/lib/push/vapid";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PushActionState = {
  error?: string;
  success?: boolean;
  message?: string;
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

export async function getVapidPublicKeyAction(): Promise<string | null> {
  await requireAdminUser();
  const { getVapidPublicKey } = await import("@/lib/push/vapid");
  return getVapidPublicKey();
}

export async function getPushStatusAction(currentEndpoint?: string): Promise<{
  configured: boolean;
  subscriptionCount: number;
  currentDeviceRegistered: boolean;
  error?: string;
}> {
  const user = await requireAdminUser();
  const admin = createAdminClient();

  if (!admin) {
    return {
      configured: isPushConfigured(),
      subscriptionCount: 0,
      currentDeviceRegistered: false,
      error: "admin_client",
    };
  }

  const { data, count, error } = await admin
    .from("push_subscriptions")
    .select("endpoint", { count: "exact" })
    .eq("salon_id", user.salon_id);

  if (error) {
    return {
      configured: isPushConfigured(),
      subscriptionCount: 0,
      currentDeviceRegistered: false,
      error: error.message.includes("push_subscriptions")
        ? "migration_012"
        : "query_failed",
    };
  }

  const endpoints = (data ?? []).map((row) => row.endpoint);
  const currentDeviceRegistered = currentEndpoint
    ? endpoints.includes(currentEndpoint)
    : false;

  return {
    configured: isPushConfigured(),
    subscriptionCount: count ?? 0,
    currentDeviceRegistered,
  };
}

export async function sendTestPushAction(
  currentEndpoint?: string
): Promise<PushActionState> {
  const user = await requireAdminUser();

  if (!isPushConfigured()) {
    return {
      error:
        "Faltan variables VAPID. En local: .env.local. En producción: Vercel + Redeploy.",
    };
  }

  if (!currentEndpoint) {
    return {
      error:
        "No hay suscripción en este navegador. Desactiva y vuelve a activar notificaciones.",
    };
  }

  const result = await sendPushToSalon(
    user.salon_id,
    {
      title: "Prueba Gota+Check",
      body: "Si ves esto, las notificaciones están funcionando.",
      url: "/ajustes",
      tag: `test-${Date.now()}`,
    },
    { endpoint: currentEndpoint }
  );

  if (result.skippedReason === "endpoint_not_registered") {
    return {
      error:
        "Este dispositivo no está registrado en el servidor. Desactiva y vuelve a activar.",
    };
  }

  if (result.skippedReason === "no_subscriptions") {
    return {
      error:
        "No hay suscripción guardada. Desactiva y vuelve a activar notificaciones.",
    };
  }

  if (result.sent === 0) {
    return {
      error:
        "No se pudo entregar a este dispositivo. Desactiva, activa de nuevo y prueba otra vez.",
    };
  }

  return {
    success: true,
    message: "Notificación enviada a este dispositivo.",
  };
}
