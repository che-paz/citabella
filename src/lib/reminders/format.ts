import { formatSalonTime, getSalonDateKey } from "@/lib/availability/timezone";

export function reminderLeadLabel(minutos: number): string {
  if (minutos === 1440) return "en 1 día";
  if (minutos === 60) return "en 1 hora";
  return `en ${minutos} min`;
}

export function agendaDayUrl(inicio: Date, timezone: string): string {
  return `/agenda?date=${getSalonDateKey(inicio, timezone)}`;
}

export function formatEventReminderBody(params: {
  titulo: string;
  inicio: Date;
  minutos: number;
  timezone: string;
}): string {
  const hora = formatSalonTime(params.inicio, params.timezone);
  return `🔔 ${params.titulo} · ${hora} (${reminderLeadLabel(params.minutos)})`;
}

export function formatCitaReminderBody(params: {
  clientaNombre: string;
  servicioNombre: string;
  inicio: Date;
  minutos: number;
  timezone: string;
}): string {
  const hora = formatSalonTime(params.inicio, params.timezone);
  const servicio = params.servicioNombre.trim() || "Cita";
  return `📅 ${params.clientaNombre} · ${servicio} · ${hora} (${reminderLeadLabel(params.minutos)})`;
}

export function eventReminderTag(eventoId: string): string {
  return `recordatorio-evento-${eventoId}`;
}

export function citaReminderTag(citaId: string, inicio: Date): string {
  return `recordatorio-cita-${citaId}-${inicio.toISOString()}`;
}
