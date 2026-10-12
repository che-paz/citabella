import { formatSalonTime } from "@/lib/availability/timezone";

/** Turns the DB exception into the Spanish warning shown in the panel. */
export function bloqueoCitaConflictMessage(
  message: string | undefined,
  timezone: string
): string | null {
  if (!message?.includes("BLOQUEO_CITA:")) return null;

  const payload = message.slice(message.indexOf("BLOQUEO_CITA:") + "BLOQUEO_CITA:".length).trim();
  const parts = payload.split("|");
  if (parts.length < 3) {
    return "Esa hora ya tiene una cita. No se guardó el evento.";
  }

  const finRaw = parts.pop()!.trim();
  const inicioRaw = parts.pop()!.trim();
  const nombre = parts.join("|").trim() || "una clienta";
  const inicio = new Date(inicioRaw);
  const fin = new Date(finRaw);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return `Esa hora ya tiene cita con ${nombre}. No se guardó el evento.`;
  }

  return `Esa hora ya tiene cita con ${nombre} (${formatSalonTime(inicio, timezone)} – ${formatSalonTime(fin, timezone)}). No se guardó el evento.`;
}
