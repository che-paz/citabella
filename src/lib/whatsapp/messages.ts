import { formatAgendaDate, formatAgendaTime } from "@/lib/agenda/dates";
import { phoneToWhatsAppDigits } from "@/lib/utils/phone";

export type CitaWhatsAppContext = {
  salonNombre: string;
  clientaNombre: string;
  telefono: string | null;
  servicioNombre: string;
  inicioIso: string;
  timezone: string;
};

function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

export function buildCitaConfirmadaWhatsAppUrl(
  ctx: CitaWhatsAppContext
): string | null {
  const phone = phoneToWhatsAppDigits(ctx.telefono);
  if (!phone) return null;

  const fecha = formatAgendaDate(ctx.inicioIso, ctx.timezone);
  const hora = formatAgendaTime(ctx.inicioIso, ctx.timezone);

  const message =
    `Hola ${ctx.clientaNombre}, te escribo de *${ctx.salonNombre}*. ` +
    `Tu cita de *${ctx.servicioNombre}* quedó *confirmada* para el ${fecha} a las ${hora}. ` +
    `¡Te esperamos!`;

  return buildWhatsAppUrl(phone, message);
}

export function buildCitaRechazadaWhatsAppUrl(
  ctx: CitaWhatsAppContext
): string | null {
  const phone = phoneToWhatsAppDigits(ctx.telefono);
  if (!phone) return null;

  const fecha = formatAgendaDate(ctx.inicioIso, ctx.timezone);
  const hora = formatAgendaTime(ctx.inicioIso, ctx.timezone);

  const message =
    `Hola ${ctx.clientaNombre}, te escribo de *${ctx.salonNombre}*. ` +
    `Lamentamos informarte que tu solicitud de cita de *${ctx.servicioNombre}* ` +
    `para el ${fecha} a las ${hora} *no pudo ser confirmada*. ` +
    `Si deseas reagendar, contáctanos por este medio.`;

  return buildWhatsAppUrl(phone, message);
}
