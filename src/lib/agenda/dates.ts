import {
  addDaysToDateKey,
  formatSalonDate,
  formatSalonTime,
  getSalonDateKey,
  salonLocalToUtc,
  startOfSalonDayUtc,
  endOfSalonDayUtc,
} from "@/lib/availability/timezone";

export function getWeekStartDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDaysToDateKey(dateKey, diff);
}

export function getWeekDateKeys(startDateKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysToDateKey(startDateKey, i));
}

export function formatAgendaTime(iso: string, timezone: string): string {
  return formatSalonTime(new Date(iso), timezone);
}

export function formatAgendaDate(iso: string, timezone: string): string {
  return formatSalonDate(new Date(iso), timezone);
}

export function formatDateKeyLabel(dateKey: string, timezone: string): string {
  const date = salonLocalToUtc(dateKey, "12:00", timezone);
  return formatSalonDate(date, timezone);
}

export function getDayBoundsIso(
  dateKey: string,
  timezone: string
): { start: string; end: string } {
  return {
    start: startOfSalonDayUtc(dateKey, timezone).toISOString(),
    end: endOfSalonDayUtc(dateKey, timezone).toISOString(),
  };
}

export function todayDateKey(timezone: string): string {
  return getSalonDateKey(new Date(), timezone);
}

/** Última fecha reservable: hoy + N meses calendario (default 3). */
export function maxBookingDateKey(
  timezone: string,
  monthsAhead = 3
): string {
  const todayKey = todayDateKey(timezone);
  const [y, m, d] = todayKey.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1 + monthsAhead, d));
  return next.toISOString().slice(0, 10);
}

/** Primer día del mes (YYYY-MM-01) para una fecha. */
export function getMonthStartDateKey(dateKey: string): string {
  return `${dateKey.slice(0, 7)}-01`;
}

/** Último día del mes para una fecha. */
export function getMonthEndDateKey(dateKey: string): string {
  const [y, m] = dateKey.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0));
  return last.toISOString().slice(0, 10);
}

export function addMonthsToDateKey(dateKey: string, months: number): string {
  const monthStart = getMonthStartDateKey(dateKey);
  const [y, m] = monthStart.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1 + months, 1));
  return next.toISOString().slice(0, 10);
}

function mondayOffset(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return weekday === 0 ? 6 : weekday - 1;
}

/** 42 celdas (6 semanas) para grilla mensual; semana empieza lunes. */
export function getMonthGridDateKeys(monthStartKey: string): string[] {
  const gridStart = addDaysToDateKey(monthStartKey, -mondayOffset(monthStartKey));
  return Array.from({ length: 42 }, (_, i) => addDaysToDateKey(gridStart, i));
}

export function isDateInMonth(dateKey: string, monthStartKey: string): boolean {
  return dateKey.slice(0, 7) === monthStartKey.slice(0, 7);
}

export function formatMonthYearLabel(dateKey: string, timezone: string): string {
  const date = salonLocalToUtc(getMonthStartDateKey(dateKey), "12:00", timezone);
  return new Intl.DateTimeFormat("es-GT", {
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(date);
}

export function formatWeekdayShort(dateKey: string, timezone: string): string {
  const date = salonLocalToUtc(dateKey, "12:00", timezone);
  return new Intl.DateTimeFormat("es-GT", {
    weekday: "short",
    timeZone: timezone,
  }).format(date);
}

export function formatDayOfMonth(dateKey: string): string {
  return String(Number(dateKey.slice(8, 10)));
}

export { addDaysToDateKey, getSalonDateKey };
