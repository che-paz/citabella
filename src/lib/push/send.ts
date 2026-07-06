import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVapidConfig } from "@/lib/push/vapid";

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

type StoredSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushSendResult = {
  sent: number;
  failed: number;
  skippedReason?: string;
};

async function deliverPush(
  subscriptions: StoredSubscription[],
  payload: PushPayload
): Promise<PushSendResult> {
  const vapid = getVapidConfig();
  const admin = createAdminClient();

  if (!vapid) {
    return { sent: 0, failed: 0, skippedReason: "vapid_not_configured" };
  }

  if (!admin) {
    return { sent: 0, failed: 0, skippedReason: "admin_client_missing" };
  }

  if (!subscriptions.length) {
    return { sent: 0, failed: 0, skippedReason: "no_subscriptions" };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const body = JSON.stringify(payload);
  const staleIds: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
        sent += 1;
      } catch (error) {
        failed += 1;
        console.error("[push] send failed", {
          status: (error as { statusCode?: number }).statusCode,
          endpoint: sub.endpoint.slice(0, 48),
        });
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          staleIds.push(sub.id);
        }
      }
    })
  );

  if (staleIds.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", staleIds);
  }

  return { sent, failed };
}

async function fetchSalonSubscriptions(
  salonId: string,
  endpoint?: string
): Promise<{ subscriptions: StoredSubscription[]; error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { subscriptions: [], error: "admin_client_missing" };
  }

  let query = admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("salon_id", salonId);

  if (endpoint) {
    query = query.eq("endpoint", endpoint);
  }

  const { data: subscriptions, error } = await query;

  if (error) {
    console.error("[push] subscription query failed", error.message);
    return { subscriptions: [], error: "subscription_query_failed" };
  }

  return { subscriptions: subscriptions ?? [] };
}

export async function sendPushToSalon(
  salonId: string,
  payload: PushPayload,
  options?: { endpoint?: string }
): Promise<PushSendResult> {
  const { subscriptions, error } = await fetchSalonSubscriptions(
    salonId,
    options?.endpoint
  );

  if (error) {
    return { sent: 0, failed: 0, skippedReason: error };
  }

  if (!subscriptions.length) {
    return {
      sent: 0,
      failed: 0,
      skippedReason: options?.endpoint
        ? "endpoint_not_registered"
        : "no_subscriptions",
    };
  }

  return deliverPush(subscriptions, payload);
}
