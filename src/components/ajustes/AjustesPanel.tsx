"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import {
  removeSalonLogoAction,
  updatePasswordAction,
  updatePerfilAction,
  updateSalonAction,
  uploadSalonLogoAction,
} from "@/lib/ajustes/actions";
import { getSalonLogoPublicUrl } from "@/lib/storage/logos";
import { getPublicBookingUrl } from "@/lib/utils/site-url";
import type { AuthUser } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PushNotificationsCard } from "@/components/push/PushNotificationsCard";

type SalonSettings = {
  nombre: string;
  slug: string;
  logo_url: string | null;
  politica_reembolso: string;
  slot_step_minutes?: number | null;
};

type AjustesPanelProps = {
  user: AuthUser;
  salon?: SalonSettings | null;
  vapidPublicKey?: string | null;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : label}
    </Button>
  );
}

function StatusMessage({ state }: { state: { error?: string; message?: string } }) {
  if (state.error) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }
  if (state.message) {
    return <p className="text-sm text-green-600">{state.message}</p>;
  }
  return null;
}

export function AjustesPanel({ user, salon, vapidPublicKey }: AjustesPanelProps) {
  const router = useRouter();
  const isAdmin = user.rol === "admin_salon";
  const [perfilState, perfilAction] = useFormState(updatePerfilAction, {});
  const [passwordState, passwordAction] = useFormState(updatePasswordAction, {});
  const [salonState, salonAction] = useFormState(updateSalonAction, {});
  const [logoState, logoAction] = useFormState(uploadSalonLogoAction, {});
  const [logoPreview, setLogoPreview] = useState<string | null>(
    getSalonLogoPublicUrl(salon?.logo_url ?? user.salon.logo_url)
  );
  const [removePending, startRemove] = useTransition();

  useEffect(() => {
    if (perfilState.success || salonState.success) {
      router.refresh();
    }
  }, [perfilState.success, salonState.success, router]);

  useEffect(() => {
    if (logoState.success) {
      router.refresh();
    }
  }, [logoState.success, router]);

  const reservaUrl = getPublicBookingUrl(user.salon.slug);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
          <CardDescription>
            Tu nombre visible en el panel y la información de acceso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={perfilAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="perfil-nombre">Tu nombre</Label>
              <Input
                id="perfil-nombre"
                name="nombre"
                defaultValue={user.nombre}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                El correo no se puede cambiar desde aquí.
              </p>
            </div>
            <StatusMessage state={perfilState} />
            <SubmitButton label="Guardar perfil" />
          </form>

          <form action={passwordAction} className="space-y-4 border-t pt-6">
            <div>
              <h3 className="font-medium">Cambiar contraseña</h3>
              <p className="text-sm text-muted-foreground">
                Usa al menos 8 caracteres.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmacion">Confirmar contraseña</Label>
              <Input
                id="confirmacion"
                name="confirmacion"
                type="password"
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <StatusMessage state={passwordState} />
            <SubmitButton label="Actualizar contraseña" />
          </form>
        </CardContent>
      </Card>

      {isAdmin && salon && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Identidad del salón</CardTitle>
              <CardDescription>
                Personaliza cómo ven tus clientas tu negocio en el panel y el
                link de reserva.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={salonAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salon-nombre">Nombre del salón</Label>
                  <Input
                    id="salon-nombre"
                    name="nombre"
                    defaultValue={salon.nombre}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Link de reserva</Label>
                  <Input
                    id="slug"
                    value={reservaUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    El enlace público usa el identificador{" "}
                    <code className="rounded bg-muted px-1">{salon.slug}</code>.
                    Compártelo desde Inicio.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot_step_minutes">
                    Intervalo entre citas en reserva
                  </Label>
                  <select
                    id="slot_step_minutes"
                    name="slot_step_minutes"
                    defaultValue={String(salon.slot_step_minutes ?? 60)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="60">Cada hora exacta (9:00, 10:00…)</option>
                    <option value="30">Cada 30 minutos</option>
                    <option value="15">Cada 15 minutos</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Define cómo aparecen los horarios en tu link de reserva y al
                    crear citas.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="politica_reembolso">
                    Política de reembolso
                  </Label>
                  <Textarea
                    id="politica_reembolso"
                    name="politica_reembolso"
                    defaultValue={salon.politica_reembolso}
                    placeholder="Ej. Cancelaciones con 24 h de anticipación…"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Visible para clientas al reservar en línea.
                  </p>
                </div>
                <StatusMessage state={salonState} />
                <SubmitButton label="Guardar salón" />
              </form>

              <div className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="font-medium">Logo del salón</h3>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG o WebP. Máximo 2 MB. Aparece en tu panel y en el
                    link de reserva.
                  </p>
                </div>

                {logoPreview && (
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-white">
                      <Image
                        src={logoPreview}
                        alt="Vista previa del logo"
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={removePending}
                      onClick={() => {
                        startRemove(async () => {
                          const result = await removeSalonLogoAction();
                          if (!result.error) {
                            setLogoPreview(null);
                            router.refresh();
                          }
                        });
                      }}
                    >
                      Quitar logo
                    </Button>
                  </div>
                )}

                <form
                  action={logoAction}
                  className="space-y-4"
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement;
                    if (input.type === "file" && input.files?.[0]) {
                      setLogoPreview(URL.createObjectURL(input.files[0]));
                    }
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="logo">Subir logo</Label>
                    <Input
                      id="logo"
                      name="logo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                    />
                  </div>
                  <StatusMessage state={logoState} />
                  <SubmitButton label="Subir logo" />
                </form>
              </div>
            </CardContent>
          </Card>

          <PushNotificationsCard vapidPublicKey={vapidPublicKey ?? null} />
        </>
      )}
    </div>
  );
}
