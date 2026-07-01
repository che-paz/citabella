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

export { addDaysToDateKey, getSalonDateKey };
