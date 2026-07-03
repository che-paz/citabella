"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import {
  rechazarPagoAction,
  validarPagoAction,
} from "@/lib/pagos/actions";
import { formatAgendaDate, formatAgendaTime } from "@/lib/agenda/dates";
import { formatQuetzales } from "@/lib/utils/format";
import { formatGuatemalaPhoneDisplay } from "@/lib/utils/phone";
import {
  buildCitaConfirmadaWhatsAppUrl,
  buildCitaRechazadaWhatsAppUrl,
} from "@/lib/whatsapp/messages";
import type { PagoPendiente } from "@/lib/pagos/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Check, ExternalLink, MessageCircle, X } from "lucide-react";

const METODO_LABELS: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo en salón",
  fri: "Fri / QR",
};

type ValidacionColaProps = {
  pagos: PagoPendiente[];
  timezone: string;
  salonNombre: string;
  comprobanteUrls: Record<string, string | null>;
};

export function ValidacionCola({
  pagos,
  timezone,
  salonNombre,
  comprobanteUrls,
}: ValidacionColaProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAction(
    action: (id: string) => Promise<{ error?: string; success?: boolean }>,
    pagoId: string
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action(pagoId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (pagos.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No hay pagos pendientes de validación.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {pagos.map((pago) => {
        const servicioNombre =
          pago.cita.servicio?.nombre ?? pago.cita.paquete?.nombre ?? "Servicio";
        const comprobanteUrl = pago.comprobante_url
          ? comprobanteUrls[pago.comprobante_url]
          : null;

        const whatsappCtx = {
          salonNombre,
          clientaNombre: pago.cita.clienta.nombre,
          telefono: pago.cita.clienta.telefono,
          servicioNombre,
          inicioIso: pago.cita.inicio,
          timezone,
        };
        const whatsappConfirmUrl = buildCitaConfirmadaWhatsAppUrl(whatsappCtx);
        const whatsappRejectUrl = buildCitaRechazadaWhatsAppUrl(whatsappCtx);
        const telefonoDisplay = pago.cita.clienta.telefono
          ? formatGuatemalaPhoneDisplay(pago.cita.clienta.telefono)
          : "Sin teléfono";

        return (
          <Card key={pago.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    {pago.cita.clienta.nombre}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {telefonoDisplay}
                  </p>
                </div>
                <Badge variant="secondary">Pendiente</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Servicio: </span>
                  {servicioNombre}
                </div>
                <div>
                  <span className="text-muted-foreground">Monto: </span>
                  <span className="font-medium">
                    {formatQuetzales(pago.monto)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha: </span>
                  {formatAgendaDate(pago.cita.inicio, timezone)}
                </div>
                <div>
                  <span className="text-muted-foreground">Hora: </span>
                  {formatAgendaTime(pago.cita.inicio, timezone)} –{" "}
                  {formatAgendaTime(pago.cita.fin, timezone)}
                </div>
                <div>
                  <span className="text-muted-foreground">Método: </span>
                  {METODO_LABELS[pago.metodo] ?? pago.metodo}
                </div>
              </div>

              {comprobanteUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={comprobanteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver comprobante
                  </Link>
                </Button>
              )}

              {pago.metodo === "efectivo" && !pago.comprobante_url && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Pago en efectivo — confirma cuando la clienta pague en salón.
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => handleAction(validarPagoAction, pago.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {pago.metodo === "efectivo" ? "Confirmar cita" : "Aprobar pago"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => handleAction(rechazarPagoAction, pago.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Rechazar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-3">
                {whatsappConfirmUrl ? (
                  <Button size="sm" variant="secondary" asChild>
                    <a
                      href={whatsappConfirmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp — confirmada
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sin teléfono válido para WhatsApp — llama a la clienta para
                    avisar.
                  </p>
                )}
                {whatsappRejectUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={whatsappRejectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp — rechazada
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Primero aprueba o rechaza en el sistema, luego envía el aviso por
                WhatsApp. Rechazar cancela la cita y libera el horario.
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
