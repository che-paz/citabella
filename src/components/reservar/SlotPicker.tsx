"use client";

import { useEffect, useMemo, useState } from "react";
import { getMonthStartDateKey, maxBookingDateKey, todayDateKey } from "@/lib/agenda/dates";
import { formatAgendaTime } from "@/lib/agenda/dates";
import { getPublicFullDaysAction, getPublicSlotsAction } from "@/lib/reservar/actions";
import type { ReservaItem } from "@/types/database";
import { MonthCalendar, type MonthDaySummary } from "@/components/ui/month-calendar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type SlotPickerProps = {
  slug: string;
  timezone: string;
  item: ReservaItem;
  fecha: string;
  slotInicio: string;
  onFechaChange: (fecha: string) => void;
  onSlotChange: (inicio: string, horaLocal: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function SlotPicker({
  slug,
  timezone,
  item,
  fecha,
  slotInicio,
  onFechaChange,
  onSlotChange,
  onBack,
  onContinue,
}: SlotPickerProps) {
  const [slots, setSlots] = useState<{ inicio: string; fin: string }[]>([]);
  const [fullDays, setFullDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = todayDateKey(timezone);
  const maxDate = maxBookingDateKey(timezone, 3);
  const monthStart = getMonthStartDateKey(fecha);

  const daySummaries = useMemo(() => {
    const summaries = new Map<string, MonthDaySummary>();
    for (const day of fullDays) {
      summaries.set(day, { count: 0, labels: [], full: true });
    }
    return summaries;
  }, [fullDays]);

  useEffect(() => {
    let cancelled = false;

    async function loadFullDays() {
      const result = await getPublicFullDaysAction({
        slug,
        fecha: monthStart,
        servicioId: item.tipo === "servicio" ? item.id : undefined,
        paqueteId: item.tipo === "paquete" ? item.id : undefined,
      });
      if (cancelled) return;
      setFullDays(result.error ? [] : result.fullDays);
    }

    loadFullDays();
    return () => {
      cancelled = true;
    };
  }, [slug, monthStart, item]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const result = await getPublicSlotsAction({
        slug,
        fecha,
        servicioId: item.tipo === "servicio" ? item.id : undefined,
        paqueteId: item.tipo === "paquete" ? item.id : undefined,
      });

      if (cancelled) return;

      if (result.error) {
        setError(result.error);
        setSlots([]);
      } else {
        setSlots(result.slots);
        if (result.slots.length === 0) {
          setError("No hay horarios disponibles este día");
        }
        // Limpiar selección si el slot ya no está en la lista actual
        if (
          slotInicio &&
          !result.slots.some((s) => s.inicio === slotInicio)
        ) {
          onSlotChange("", "");
        }
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, fecha, item, slotInicio, onSlotChange]);

  const slotStillValid = slots.some((s) => s.inicio === slotInicio);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Elige fecha y hora</h2>
        <p className="text-sm text-muted-foreground">
          {item.nombre} · {item.duracion_minutos} min
        </p>
      </div>

      <MonthCalendar
        timezone={timezone}
        selectedDateKey={fecha}
        onSelectDate={(next) => {
          onFechaChange(next);
          onSlotChange("", "");
        }}
        daySummaries={daySummaries}
        disableFullDays
        minDate={today}
        maxDate={maxDate}
        className="rounded-lg border p-3"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error && slots.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">{error}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((slot) => {
            const hora = formatAgendaTime(slot.inicio, timezone);
            const selected = slotInicio === slot.inicio;
            return (
              <button
                key={slot.inicio}
                type="button"
                onClick={() => onSlotChange(slot.inicio, hora)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {hora}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Atrás
        </Button>
        <Button
          type="button"
          className="reservar-cta flex-1"
          disabled={!slotInicio || !slotStillValid}
          onClick={onContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
