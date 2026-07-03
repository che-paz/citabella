type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getLocalParts(date: Date, timezone: string): LocalParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") === 24 ? 0 : get("hour"),
    minute: get("minute"),
  };
}

export function getSalonLocalMinute(date: Date, timezone: string): number {
  return getLocalParts(date, timezone).minute;
}

export function isSalonOnTheHour(date: Date, timezone: string): boolean {
  return getSalonLocalMinute(date, timezone) === 0;
}

export function getSalonDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
}

export function getSalonDayOfWeek(date: Date, timezone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(date);

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekday] ?? 0;
}

export function salonLocalToUtc(
  dateStr: string,
  timeStr: string,
  timezone: string
): Date {
  const normalizedTime =
    timeStr.length === 5 ? `${timeStr}:00` : timeStr.slice(0, 8);
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute, second = 0] = normalizedTime.split(":").map(Number);

  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  for (let i = 0; i < 4; i++) {
    const local = getLocalParts(candidate, timezone);
    const targetMs = Date.UTC(year, month - 1, day, hour, minute, second);
    const localMs = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      0
    );
    candidate = new Date(candidate.getTime() + (targetMs - localMs));
  }

  return candidate;
}

export function formatSalonTime(date: Date, timezone: string): string {
  const parts = getLocalParts(date, timezone);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export function formatSalonDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("es-GT", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function startOfSalonDayUtc(dateKey: string, timezone: string): Date {
  return salonLocalToUtc(dateKey, "00:00:00", timezone);
}

export function endOfSalonDayUtc(dateKey: string, timezone: string): Date {
  const nextDay = addDaysToDateKey(dateKey, 1);
  return salonLocalToUtc(nextDay, "00:00:00", timezone);
}
