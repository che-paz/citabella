import { describe, expect, it } from "vitest";
import { salonLocalToUtc } from "@/lib/availability/timezone";
import {
  agendaDayUrl,
  citaReminderTag,
  formatCitaReminderBody,
  formatEventReminderBody,
} from "./format";
import {
  citaReminderKey,
  isReminderDue,
  selectDueCitaIds,
  selectDueEventIds,
  type CitaReminderCandidate,
  type EventReminderCandidate,
} from "./window";

const TZ = "America/Guatemala";
const MIN = 60 * 1000;

function at(iso: string): Date {
  return new Date(iso);
}

describe("isReminderDue", () => {
  const inicio = at("2026-10-16T16:00:00.000Z");

  it("includes a fire time at the end of the lookahead", () => {
    const now = new Date(inicio.getTime() - 30 * MIN - 5 * MIN);
    expect(
      isReminderDue({ now, inicio, minutos: 30, alreadyClaimed: false })
    ).toBe(true);
  });

  it("excludes a fire time one millisecond after the lookahead", () => {
    const now = new Date(inicio.getTime() - 30 * MIN - 5 * MIN - 1);
    expect(
      isReminderDue({ now, inicio, minutos: 30, alreadyClaimed: false })
    ).toBe(false);
  });

  it("includes a fire time at the start of the lateness window", () => {
    const now = new Date(inicio.getTime() - 30 * MIN + 5 * MIN);
    expect(
      isReminderDue({ now, inicio, minutos: 30, alreadyClaimed: false })
    ).toBe(true);
  });

  it("excludes a fire time one millisecond before the lateness window", () => {
    const now = new Date(inicio.getTime() - 30 * MIN + 5 * MIN + 1);
    expect(
      isReminderDue({ now, inicio, minutos: 30, alreadyClaimed: false })
    ).toBe(false);
  });

  it("skips an event that already started even inside the lateness window", () => {
    const now = inicio;
    expect(
      isReminderDue({ now, inicio, minutos: 1, alreadyClaimed: false })
    ).toBe(false);
  });

  it("skips a claimed reminder and a missing offset", () => {
    const now = new Date(inicio.getTime() - 30 * MIN);
    expect(
      isReminderDue({ now, inicio, minutos: 30, alreadyClaimed: true })
    ).toBe(false);
    expect(
      isReminderDue({ now, inicio, minutos: null, alreadyClaimed: false })
    ).toBe(false);
  });

  it("accepts a one-day reminder inside the window", () => {
    const now = new Date(inicio.getTime() - 1440 * MIN);
    expect(
      isReminderDue({ now, inicio, minutos: 1440, alreadyClaimed: false })
    ).toBe(true);
  });
});

describe("selectDueEventIds", () => {
  it("returns only the event whose reminder is due", () => {
    const inicio = at("2026-10-16T16:00:00.000Z");
    const now = new Date(inicio.getTime() - 30 * MIN);
    const rows: EventReminderCandidate[] = [
      { id: "due", inicio, minutos: 30, alreadyClaimed: false },
      { id: "sent", inicio, minutos: 30, alreadyClaimed: true },
      { id: "off", inicio, minutos: null, alreadyClaimed: false },
      {
        id: "later",
        inicio: new Date(inicio.getTime() + 3 * 60 * MIN),
        minutos: 30,
        alreadyClaimed: false,
      },
    ];

    expect(selectDueEventIds(now, rows)).toEqual(["due"]);
  });
});

describe("selectDueCitaIds", () => {
  const inicio = at("2026-10-16T21:00:00.000Z");
  const now = new Date(inicio.getTime() - 30 * MIN);

  function cita(
    patch: Partial<CitaReminderCandidate> & Pick<CitaReminderCandidate, "id">
  ): CitaReminderCandidate {
    return {
      inicio,
      estado: "confirmada",
      salonMinutos: 30,
      alreadySentForThisInicio: false,
      ...patch,
    };
  }

  it("keeps pending validation and confirmed appointments", () => {
    const ids = selectDueCitaIds(now, [
      cita({ id: "ok", estado: "confirmada" }),
      cita({ id: "pago", estado: "pendiente_validacion" }),
    ]);
    expect(ids).toEqual(["ok", "pago"]);
  });

  it("drops cancelled, completed, no-show, plain pending, and a salon with reminders off", () => {
    const ids = selectDueCitaIds(now, [
      cita({ id: "cancelada", estado: "cancelada" }),
      cita({ id: "completada", estado: "completada" }),
      cita({ id: "no-show", estado: "no_show" }),
      cita({ id: "pendiente", estado: "pendiente" }),
      cita({ id: "apagado", salonMinutos: null }),
    ]);
    expect(ids).toEqual([]);
  });

  it("treats a reschedule as a new reminder and keeps the old slot claimed", () => {
    const viejoInicio = new Date(now.getTime() + 30 * MIN);
    const nuevoInicio = new Date(now.getTime() + 15 * MIN);
    const sent = new Set([citaReminderKey("cita-1", viejoInicio)]);
    const ids = selectDueCitaIds(now, [
      cita({
        id: "slot-viejo",
        inicio: viejoInicio,
        salonMinutos: 30,
        alreadySentForThisInicio: sent.has(
          citaReminderKey("cita-1", viejoInicio)
        ),
      }),
      cita({
        id: "slot-nuevo",
        inicio: nuevoInicio,
        salonMinutos: 15,
        alreadySentForThisInicio: sent.has(
          citaReminderKey("cita-1", nuevoInicio)
        ),
      }),
    ]);

    expect(ids).toEqual(["slot-nuevo"]);
  });

  it("skips an appointment that already started", () => {
    const ids = selectDueCitaIds(inicio, [
      cita({ id: "ya", inicio, salonMinutos: 15 }),
    ]);
    expect(ids).toEqual([]);
  });
});

describe("reminder copy in America/Guatemala", () => {
  it("formats an event at 10:00 AM and opens that salon day", () => {
    const inicio = salonLocalToUtc("2026-10-16", "10:00", TZ);
    expect(
      formatEventReminderBody({
        titulo: "Reunión con proveedor",
        inicio,
        minutos: 30,
        timezone: TZ,
      })
    ).toBe("🔔 Reunión con proveedor · 10:00 AM (en 30 min)");
    expect(agendaDayUrl(inicio, TZ)).toBe("/agenda?date=2026-10-16");
  });

  it("formats a cita at 3:00 PM and keeps a late evening on the salon date", () => {
    const inicio = salonLocalToUtc("2026-10-16", "15:00", TZ);
    expect(
      formatCitaReminderBody({
        clientaNombre: "María López",
        servicioNombre: "Corte de cabello",
        inicio,
        minutos: 30,
        timezone: TZ,
      })
    ).toBe("📅 María López · Corte de cabello · 3:00 PM (en 30 min)");

    const noche = salonLocalToUtc("2026-10-15", "23:00", TZ);
    expect(agendaDayUrl(noche, TZ)).toBe("/agenda?date=2026-10-15");
    expect(citaReminderTag("cita-1", inicio)).toBe(
      `recordatorio-cita-cita-1-${inicio.toISOString()}`
    );
  });

  it("labels one hour and one day", () => {
    const inicio = salonLocalToUtc("2026-10-16", "10:00", TZ);
    expect(
      formatEventReminderBody({
        titulo: "Dentista",
        inicio,
        minutos: 60,
        timezone: TZ,
      })
    ).toContain("(en 1 hora)");
    expect(
      formatEventReminderBody({
        titulo: "Dentista",
        inicio,
        minutos: 1440,
        timezone: TZ,
      })
    ).toContain("(en 1 día)");
  });
});
