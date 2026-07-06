"use client";

import { useCallback, useEffect, useState } from "react";
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

function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve(undefined);
  }
  return navigator.serviceWorker.getRegistration("/");
}

function isIosBrowserWithoutPwa(): boolean {
  if (typeof window === "undefined") return false;
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isIos && !isStandalone;
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
    currentDeviceRegistered: boolean;
    error?: string;
  } | null>(null);

  const getCurrentSubscription = useCallback(async () => {
    const reg =
      (await getServiceWorkerRegistration()) ??
      (await navigator.serviceWorker.register("/sw.js"));
    await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  }, []);

  const refreshStatus = useCallback(async () => {
    const sub = await getCurrentSubscription().catch(() => null);
    const nextStatus = await getPushStatusAction(sub?.endpoint).catch(
      () => null
    );
    setStatus(nextStatus);
  }, [getCurrentSubscription]);

  useEffect(() => {
    getVapidPublicKeyAction()
      .then(setVapidPublicKey)
      .catch(() => setVapidPublicKey(null));
  }, []);

  useEffect(() => {
    if (!supported) return;
    refreshStatus().catch(() => setStatus(null));
  }, [enabled, supported, refreshStatus]);

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

    getCurrentSubscription()
      .then((sub) => setEnabled(Boolean(sub)))
      .catch(() => setEnabled(false));
  }, [supported, getCurrentSubscription]);

  async function enableNotifications() {
    if (!vapidPublicKey) {
      setMessage("Las notificaciones aún no están configuradas en el servidor.");
      return;
    }

    if (isIosBrowserWithoutPwa()) {
      setMessage(
        "En iPhone debes abrir Gota+Check desde el icono de inicio (Safari → Compartir → Añadir a inicio), no desde Safari normal."
      );
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
      setMessage(
        "Listo en este dispositivo. Repite en cada teléfono o computadora donde quieras recibir avisos."
      );
      await refreshStatus();
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
      const reg = await getServiceWorkerRegistration();
      const sub = await reg?.pushManager.getSubscription();

      if (sub) {
        await removePushSubscriptionAction(sub.endpoint);
        await sub.unsubscribe();
      }

      setEnabled(false);
      setMessage("Notificaciones desactivadas en este dispositivo.");
      await refreshStatus();
    } catch {
      setMessage("No se pudieron desactivar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function sendTest() {
    setLoading(true);
    setMessage(null);

    const sub = await getCurrentSubscription().catch(() => null);
    if (!sub?.endpoint) {
      setMessage("No hay suscripción en este navegador. Activa notificaciones primero.");
      setLoading(false);
      return;
    }

    let pushReceived = false;
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_RECEIVED") {
        pushReceived = true;
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    const result = await sendTestPushAction(sub.endpoint);
    if (result.error) {
      navigator.serviceWorker.removeEventListener("message", onMessage);
      setMessage(result.error);
      setLoading(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2500));
    navigator.serviceWorker.removeEventListener("message", onMessage);

    if (pushReceived) {
      setMessage(
        `${result.message ?? "Enviada."} Revisa el Centro de notificaciones si no viste el banner.`
      );
    } else {
      setMessage(
        `${result.message ?? "Enviada."} Si no la ves, minimiza la app y revisa permisos de notificaciones del sistema.`
      );
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
          Activa en cada dispositivo por separado (teléfono y computadora). Las
          reservas del link público avisan a todos los dispositivos registrados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isIosBrowserWithoutPwa() && (
          <p className="text-sm text-amber-700">
            En iPhone abre Gota+Check desde el icono de inicio, no desde Safari.
          </p>
        )}

        {!vapidPublicKey && status !== null && (
          <p className="text-sm text-amber-700">
            {typeof window !== "undefined" &&
            /localhost|127\.0\.0\.1/.test(window.location.hostname)
              ? "Servidor sin claves VAPID. Copia VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y VAPID_SUBJECT desde Vercel a .env.local y reinicia npm run dev."
              : "Servidor sin claves VAPID. En Vercel agrega VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y VAPID_SUBJECT, luego Redeploy."}
          </p>
        )}

        {status?.error === "migration_012" && (
          <p className="text-sm text-destructive">
            Falta la migración 012 en Supabase (tabla push_subscriptions).
          </p>
        )}

        {status && status.subscriptionCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {status.subscriptionCount} dispositivo
            {status.subscriptionCount === 1 ? "" : "s"} registrado
            {status.subscriptionCount === 1 ? "" : "s"}
            {status.currentDeviceRegistered
              ? " · este dispositivo incluido"
              : enabled
                ? " · este dispositivo aún no está incluido"
                : ""}
          </p>
        )}

        {enabled && status && !status.currentDeviceRegistered && (
          <p className="text-sm text-amber-700">
            Este dispositivo no está guardado en el servidor. Desactiva y vuelve
            a activar.
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
              Desactivar en este dispositivo
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading || !status?.currentDeviceRegistered}
              onClick={sendTest}
            >
              Enviar prueba aquí
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            disabled={loading || !vapidPublicKey}
            onClick={enableNotifications}
          >
            {loading ? "Activando…" : "Activar en este dispositivo"}
          </Button>
        )}

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
