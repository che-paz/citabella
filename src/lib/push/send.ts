import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVapidConfig } from "@/lib/push/vapid";

export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

type StoredSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPushToSalon(
  salonId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number; skippedReason?: string }> {
  const vapid = getVapidConfig();
  const admin = createAdminClient();

  if (!vapid) {
    return { sent: 0, failed: 0, skippedReason: "vapid_not_configured" };
  }

  if (!admin) {
    return { sent: 0, failed: 0, skippedReason: "admin_client_missing" };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("salon_id", salonId);

  if (error) {
    console.error("[push] subscription query failed", error.message);
    return { sent: 0, failed: 0, skippedReason: "subscription_query_failed" };
  }

  if (!subscriptions?.length) {
    return { sent: 0, failed: 0, skippedReason: "no_subscriptions" };
  }

  const body = JSON.stringify(payload);
  const staleIds: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub: StoredSubscription) => {
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
