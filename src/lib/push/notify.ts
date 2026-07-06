import { formatAgendaDate, formatAgendaTime } from "@/lib/agenda/dates";
import { sendPushToSalon } from "@/lib/push/send";

export async function notifySalonNewReservation(params: {
  salonId: string;
  clientaNombre: string;
  itemNombre: string;
  inicio: Date;
  timezone: string;
  metodo: string;
}): Promise<void> {
  const fecha = formatAgendaDate(params.inicio.toISOString(), params.timezone);
  const hora = formatAgendaTime(params.inicio.toISOString(), params.timezone);

  const needsValidation =
    params.metodo === "transferencia" || params.metodo === "fri";

  await sendPushToSalon(params.salonId, {
    title: "Nueva reserva en línea",
    body: `${params.clientaNombre} · ${params.itemNombre} · ${fecha} ${hora}`,
    url: needsValidation ? "/pagos" : "/agenda",
  });
}
