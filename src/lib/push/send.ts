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
): Promise<void> {
  const vapid = getVapidConfig();
  const admin = createAdminClient();

  if (!vapid || !admin) {
    return;
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("salon_id", salonId);

  if (!subscriptions?.length) {
    return;
  }

  const body = JSON.stringify(payload);
  const staleIds: string[] = [];

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
      } catch (error) {
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
}
