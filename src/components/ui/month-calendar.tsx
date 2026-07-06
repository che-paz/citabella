"use client";

import {
  addMonthsToDateKey,
  formatDayOfMonth,
  formatMonthYearLabel,
  formatWeekdayShort,
  getMonthEndDateKey,
  getMonthGridDateKeys,
  getMonthStartDateKey,
  getSalonDateKey,
  isDateInMonth,
  todayDateKey,
} from "@/lib/agenda/dates";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_HEADERS = [0, 1, 2, 3, 4, 5, 6] as const;

export type MonthDaySummary = {
  count: number;
  labels: string[];
};

type MonthCalendarProps = {
  timezone: string;
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  daySummaries?: Map<string, MonthDaySummary>;
  minDate?: string;
  maxDate?: string;
  className?: string;
};

export function MonthCalendar({
  timezone,
  selectedDateKey,
  onSelectDate,
  daySummaries,
  minDate,
  maxDate,
  className,
}: MonthCalendarProps) {
  const monthStart = getMonthStartDateKey(selectedDateKey);
  const gridDays = getMonthGridDateKeys(monthStart);
  const today = todayDateKey(timezone);

  function shiftMonth(delta: number) {
    const nextMonthStart = addMonthsToDateKey(monthStart, delta);
    const lastDay = Number(getMonthEndDateKey(nextMonthStart).slice(8, 10));
    const targetDay = Math.min(Number(selectedDateKey.slice(8, 10)), lastDay);
    const nextDate = `${nextMonthStart.slice(0, 7)}-${String(targetDay).padStart(2, "0")}`;
    if (minDate && nextDate < minDate) return;
    if (maxDate && nextDate > maxDate) return;
    onSelectDate(nextDate);
  }

  const canPrev = !minDate || monthStart > getMonthStartDateKey(minDate);
  const canNext = !maxDate || monthStart < getMonthStartDateKey(maxDate);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canPrev}
          onClick={() => shiftMonth(-1)}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-medium capitalize">
          {formatMonthYearLabel(monthStart, timezone)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canNext}
          onClick={() => shiftMonth(1)}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_HEADERS.map((offset) => {
          const dayKey = gridDays[offset];
          return (
            <div key={offset} className="py-1 font-medium capitalize">
              {formatWeekdayShort(dayKey, timezone).replace(".", "")}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((dayKey) => {
          const inMonth = isDateInMonth(dayKey, monthStart);
          const isSelected = dayKey === selectedDateKey;
          const isToday = dayKey === today;
          const disabled =
            Boolean(minDate && dayKey < minDate) ||
            Boolean(maxDate && dayKey > maxDate);
          const summary = daySummaries?.get(dayKey);
          const hasCitas = (summary?.count ?? 0) > 0;

          return (
            <button
              key={dayKey}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(dayKey)}
              className={cn(
                "relative flex min-h-[3.25rem] flex-col items-stretch rounded-md p-1 text-left text-sm transition-colors md:min-h-[5.5rem]",
                !inMonth && "text-muted-foreground/50",
                disabled && "cursor-not-allowed opacity-40",
                hasCitas && !isSelected && "bg-primary/10 ring-1 ring-primary/20",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && !disabled && !hasCitas && "hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "self-center text-sm font-medium",
                  isToday && !isSelected && "rounded-full bg-primary/15 px-1.5"
                )}
              >
                {formatDayOfMonth(dayKey)}
              </span>

              {hasCitas && (
                <div className="mt-0.5 flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <span
                    className={cn(
                      "mx-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {summary!.count}
                  </span>
                  <div className="hidden md:block">
                    {summary!.labels.slice(0, 2).map((label) => (
                      <p
                        key={label}
                        className={cn(
                          "truncate text-[10px] leading-tight",
                          isSelected
                            ? "text-primary-foreground/90"
                            : "text-foreground/80"
                        )}
                      >
                        {label}
                      </p>
                    ))}
                    {summary!.count > 2 && (
                      <p
                        className={cn(
                          "text-[10px] leading-tight",
                          isSelected
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        +{summary!.count - 2} más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function buildMonthSummariesFromCitas(
  citas: { inicio: string; clienta: { nombre: string } }[],
  timezone: string
): Map<string, MonthDaySummary> {
  const summaries = new Map<string, MonthDaySummary>();

  for (const cita of citas) {
    const key = getSalonDateKey(new Date(cita.inicio), timezone);
    const existing = summaries.get(key) ?? { count: 0, labels: [] };
    existing.count += 1;
    const firstName = cita.clienta.nombre.split(/\s+/)[0] ?? cita.clienta.nombre;
    if (!existing.labels.includes(firstName)) {
      existing.labels.push(firstName);
    }
    summaries.set(key, existing);
  }

  return summaries;
}

/** @deprecated Use buildMonthSummariesFromCitas */
export function buildMarkedDatesFromCitas(
  citas: { inicio: string }[],
  timezone: string
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const cita of citas) {
    const key = getSalonDateKey(new Date(cita.inicio), timezone);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
