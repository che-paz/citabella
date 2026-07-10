import { formatAgendaDate, formatAgendaTime } from "@/lib/agenda/dates";
import { sendPushToSalon } from "@/lib/push/send";

export async function notifySalonNewReservation(params: {
  salonId: string;
  clientaNombre: string;
  beneficiarioNombre?: string | null;
  itemNombre: string;
  inicio: Date;
  timezone: string;
  metodo: string;
}): Promise<void> {
  const fecha = formatAgendaDate(params.inicio.toISOString(), params.timezone);
  const hora = formatAgendaTime(params.inicio.toISOString(), params.timezone);

  const needsValidation =
    params.metodo === "transferencia" || params.metodo === "fri";

  const quien = params.beneficiarioNombre?.trim()
    ? `${params.beneficiarioNombre.trim()} (contacto ${params.clientaNombre})`
    : params.clientaNombre;

  const result = await sendPushToSalon(params.salonId, {
    title: "Nueva reserva en línea",
    body: `${quien} · ${params.itemNombre} · ${fecha} ${hora}`,
    url: needsValidation ? "/pagos" : "/agenda",
    tag: `reserva-${Date.now()}`,
  });

  if (result.sent === 0) {
    console.error("[push] reservation notify not delivered", {
      salonId: params.salonId,
      skippedReason: result.skippedReason,
      failed: result.failed,
    });
  }
}
