"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  getPushStatusAction,
  getVapidPublicKeyAction,
  removePushSubscriptionAction,
  savePushSubscriptionAction,
  sendTestPushAction,
} from "@/lib/push/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function PushNotificationsCard() {
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    configured: boolean;
    subscriptionCount: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    getVapidPublicKeyAction().then(setVapidPublicKey).catch(() => setVapidPublicKey(null));
  }, []);

  useEffect(() => {
    getPushStatusAction().then(setStatus).catch(() => setStatus(null));
  }, [enabled]);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
  }, []);

  useEffect(() => {
    if (!supported) return;

    async function checkSubscription() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        setEnabled(Boolean(sub));
      } catch {
        setEnabled(false);
      }
    }

    checkSubscription();
  }, [supported]);

  async function enableNotifications() {
    if (!vapidPublicKey) {
      setMessage("Las notificaciones aún no están configuradas en el servidor.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Debes permitir notificaciones en tu navegador o teléfono.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            vapidPublicKey
          ) as BufferSource,
        });
      }

      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setMessage("No se pudo crear la suscripción.");
        return;
      }

      const result = await savePushSubscriptionAction({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });

      if (result.error) {
        setMessage(result.error);
        return;
      }

      setEnabled(true);
      setMessage("Listo. Te avisaremos cuando llegue una reserva nueva.");
      getPushStatusAction().then(setStatus).catch(() => undefined);
    } catch {
      setMessage("No se pudieron activar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function disableNotifications() {
    setLoading(true);
    setMessage(null);

    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();

      if (sub) {
        await removePushSubscriptionAction(sub.endpoint);
        await sub.unsubscribe();
      }

      setEnabled(false);
      setMessage("Notificaciones desactivadas.");
    } catch {
      setMessage("No se pudieron desactivar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function sendTest() {
    setLoading(true);
    setMessage(null);
    const result = await sendTestPushAction();
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage(result.message ?? "Notificación de prueba enviada.");
    }
    setLoading(false);
  }

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Tu navegador no soporta notificaciones push. En iPhone, instala
            Gota+Check en la pantalla de inicio (Safari → Compartir → Añadir a
            inicio) y usa iOS 16.4 o superior.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          Notificaciones de reservas
        </CardTitle>
        <CardDescription>
          Recibe un aviso en tu teléfono o computadora cuando una clienta reserve
          por tu link público (con o sin comprobante).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!vapidPublicKey && status !== null && (
          <p className="text-sm text-amber-700">
            Servidor sin claves VAPID. En Vercel agrega VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY y VAPID_SUBJECT, luego Redeploy.
          </p>
        )}

        {status?.error === "migration_012" && (
          <p className="text-sm text-destructive">
            Falta la migración 012 en Supabase (tabla push_subscriptions).
          </p>
        )}

        {status && status.subscriptionCount === 0 && enabled && (
          <p className="text-sm text-amber-700">
            El navegador está suscrito pero no hay registro en el servidor.
            Desactiva y vuelve a activar.
          </p>
        )}

        {enabled ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={disableNotifications}
            >
              Desactivar notificaciones
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={sendTest}
            >
              Enviar prueba
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            disabled={loading || !vapidPublicKey}
            onClick={enableNotifications}
          >
            {loading ? "Activando…" : "Activar notificaciones"}
          </Button>
        )}

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
