/** Misma ventana que claim_* en supabase/migrations/021_recordatorios.sql. */
export const REMINDER_LOOKAHEAD_MS = 5 * 60 * 1000;
export const REMINDER_LATENESS_MS = 5 * 60 * 1000;

export const EVENT_REMINDER_MINUTES = [15, 30, 60, 1440] as const;
export const CITA_REMINDER_MINUTES = [15, 30, 60] as const;

export const CITA_REMINDER_ESTADOS = [
  "pendiente_validacion",
  "confirmada",
] as const;

export type EventReminderCandidate = {
  id: string;
  inicio: Date;
  minutos: number | null;
  alreadyClaimed: boolean;
};

export type CitaReminderCandidate = {
  id: string;
  inicio: Date;
  estado: string;
  salonMinutos: number | null;
  alreadySentForThisInicio: boolean;
};

export function reminderFireAt(inicio: Date, minutos: number): Date {
  return new Date(inicio.getTime() - minutos * 60 * 1000);
}

export function isReminderDue(params: {
  now: Date;
  inicio: Date;
  minutos: number | null;
  alreadyClaimed: boolean;
}): boolean {
  if (params.minutos == null || params.alreadyClaimed) return false;
  if (params.inicio.getTime() <= params.now.getTime()) return false;

  const fireAt = reminderFireAt(params.inicio, params.minutos).getTime();
  const nowMs = params.now.getTime();
  if (fireAt > nowMs + REMINDER_LOOKAHEAD_MS) return false;
  if (fireAt < nowMs - REMINDER_LATENESS_MS) return false;
  return true;
}

export function isCitaReminderEligible(params: {
  now: Date;
  inicio: Date;
  estado: string;
  salonMinutos: number | null;
  alreadySentForThisInicio: boolean;
}): boolean {
  if (
    !CITA_REMINDER_ESTADOS.includes(
      params.estado as (typeof CITA_REMINDER_ESTADOS)[number]
    )
  ) {
    return false;
  }

  return isReminderDue({
    now: params.now,
    inicio: params.inicio,
    minutos: params.salonMinutos,
    alreadyClaimed: params.alreadySentForThisInicio,
  });
}

export function selectDueEventIds(
  now: Date,
  rows: EventReminderCandidate[]
): string[] {
  return rows
    .filter((row) =>
      isReminderDue({
        now,
        inicio: row.inicio,
        minutos: row.minutos,
        alreadyClaimed: row.alreadyClaimed,
      })
    )
    .map((row) => row.id);
}

export function selectDueCitaIds(
  now: Date,
  rows: CitaReminderCandidate[]
): string[] {
  return rows
    .filter((row) =>
      isCitaReminderEligible({
        now,
        inicio: row.inicio,
        estado: row.estado,
        salonMinutos: row.salonMinutos,
        alreadySentForThisInicio: row.alreadySentForThisInicio,
      })
    )
    .map((row) => row.id);
}

export function citaReminderKey(citaId: string, inicio: Date): string {
  return `${citaId}|${inicio.toISOString()}`;
}

export function maxEventInicio(now: Date): Date {
  const maxLead = Math.max(...EVENT_REMINDER_MINUTES);
  return new Date(now.getTime() + maxLead * 60 * 1000 + REMINDER_LOOKAHEAD_MS);
}

export function maxCitaInicio(now: Date): Date {
  const maxLead = Math.max(...CITA_REMINDER_MINUTES);
  return new Date(now.getTime() + maxLead * 60 * 1000 + REMINDER_LOOKAHEAD_MS);
}

export function parseEventReminderField(
  value: string | null,
  mode: "create" | "edit"
): number | null | "invalid" {
  if (value == null) return mode === "create" ? 30 : null;
  if (value === "") return null;
  const parsed = Number(value);
  if ((EVENT_REMINDER_MINUTES as readonly number[]).includes(parsed)) {
    return parsed;
  }
  return "invalid";
}

export function parseCitaReminderField(
  value: string | null
): number | null | "invalid" {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if ((CITA_REMINDER_MINUTES as readonly number[]).includes(parsed)) {
    return parsed;
  }
  return "invalid";
}
