import { describe, expect, it } from "vitest";
import { computeAvailability, isSlotAvailable } from "./engine";
import type {
  CitaOcupadaInput,
  ExcepcionHorarioInput,
  HorarioSalonInput,
} from "./engine";
import { salonLocalToUtc } from "./timezone";

const TZ = "America/Guatemala";

const weekdayHorarios: HorarioSalonInput[] = [
  { dia_semana: 1, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 2, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 3, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 4, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 5, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 6, hora_inicio: "09:00", hora_fin: "14:00" },
];

function dateAt(dateKey: string, time: string): Date {
  return salonLocalToUtc(dateKey, time, TZ);
}

describe("computeAvailability", () => {
  it("returns slots for a normal weekday within opening hours", () => {
    const date = dateAt("2026-07-06", "12:00");
    const slots = computeAvailability({
      date,
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      citas: [],
    });

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].inicio).toEqual(dateAt("2026-07-06", "09:00"));
    expect(slots[slots.length - 1].inicio).toEqual(
      dateAt("2026-07-06", "17:00")
    );
  });

  it("returns no slots on a closed exception day", () => {
    const date = dateAt("2026-12-25", "12:00");
    const excepcion: ExcepcionHorarioInput = {
      fecha: "2026-12-25",
      cerrado: true,
      hora_inicio: null,
      hora_fin: null,
    };

    const slots = computeAvailability({
      date,
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion,
      citas: [],
    });

    expect(slots).toHaveLength(0);
  });

  it("uses special hours from a non-closed exception", () => {
    const date = dateAt("2026-07-04", "12:00");
    const excepcion: ExcepcionHorarioInput = {
      fecha: "2026-07-04",
      cerrado: false,
      hora_inicio: "10:00",
      hora_fin: "14:00",
    };

    const slots = computeAvailability({
      date,
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion,
      citas: [],
    });

    expect(slots[0].inicio).toEqual(dateAt("2026-07-04", "10:00"));
    expect(slots[slots.length - 1].inicio).toEqual(
      dateAt("2026-07-04", "13:00")
    );
  });

  it("subtracts existing confirmed appointments", () => {
    const citas: CitaOcupadaInput[] = [
      {
        inicio: dateAt("2026-07-07", "10:00"),
        fin: dateAt("2026-07-07", "11:00"),
        colaboradora_id: "colab-1",
        estado: "confirmada",
      },
    ];

    const slots = computeAvailability({
      date: dateAt("2026-07-07", "12:00"),
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      citas,
      colaboradoraId: "colab-1",
    });

    const hasTenAm = slots.some(
      (s) => s.inicio.getTime() === dateAt("2026-07-07", "10:00").getTime()
    );
    expect(hasTenAm).toBe(false);
    expect(slots.some((s) => s.inicio.getTime() === dateAt("2026-07-07", "09:00").getTime())).toBe(true);
    expect(slots.some((s) => s.inicio.getTime() === dateAt("2026-07-07", "11:00").getTime())).toBe(true);
  });

  it("ignores cancelled appointments", () => {
    const citas: CitaOcupadaInput[] = [
      {
        inicio: dateAt("2026-07-08", "10:00"),
        fin: dateAt("2026-07-08", "11:00"),
        colaboradora_id: "colab-1",
        estado: "cancelada",
      },
    ];

    const slots = computeAvailability({
      date: dateAt("2026-07-08", "12:00"),
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      citas,
      colaboradoraId: "colab-1",
    });

    expect(
      slots.some(
        (s) => s.inicio.getTime() === dateAt("2026-07-08", "10:00").getTime()
      )
    ).toBe(true);
  });

  it("allows different duration services without incorrect overlap", () => {
    const citas: CitaOcupadaInput[] = [
      {
        inicio: dateAt("2026-07-09", "10:00"),
        fin: dateAt("2026-07-09", "13:00"),
        colaboradora_id: "colab-1",
        estado: "confirmada",
      },
    ];

    const slots30 = computeAvailability({
      date: dateAt("2026-07-09", "12:00"),
      timezone: TZ,
      duracionMinutos: 30,
      horarios: weekdayHorarios,
      excepcion: null,
      citas,
      colaboradoraId: "colab-1",
    });

    const slots60 = computeAvailability({
      date: dateAt("2026-07-09", "12:00"),
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      citas,
      colaboradoraId: "colab-1",
    });

    expect(
      slots30.some(
        (s) => s.inicio.getTime() === dateAt("2026-07-09", "12:30").getTime()
      )
    ).toBe(false);

    expect(
      slots60.some(
        (s) => s.inicio.getTime() === dateAt("2026-07-09", "12:00").getTime()
      )
    ).toBe(false);

    expect(
      slots30.some(
        (s) => s.inicio.getTime() === dateAt("2026-07-09", "13:00").getTime()
      )
    ).toBe(true);
  });

  it("filters blocking citas by colaboradora", () => {
    const citas: CitaOcupadaInput[] = [
      {
        inicio: dateAt("2026-07-10", "10:00"),
        fin: dateAt("2026-07-10", "11:00"),
        colaboradora_id: "colab-a",
        estado: "confirmada",
      },
    ];

    const slotsA = computeAvailability({
      date: dateAt("2026-07-10", "12:00"),
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      citas,
      colaboradoraId: "colab-a",
    });

    const slotsB = computeAvailability({
      date: dateAt("2026-07-10", "12:00"),
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      citas,
      colaboradoraId: "colab-b",
    });

    expect(
      slotsA.some(
        (s) => s.inicio.getTime() === dateAt("2026-07-10", "10:00").getTime()
      )
    ).toBe(false);
    expect(
      slotsB.some(
        (s) => s.inicio.getTime() === dateAt("2026-07-10", "10:00").getTime()
      )
    ).toBe(true);
  });

  it("returns no slots when salon is closed on that weekday", () => {
    const slots = computeAvailability({
      date: dateAt("2026-07-05", "12:00"),
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      citas: [],
    });

    expect(slots).toHaveLength(0);
  });
});

describe("isSlotAvailable", () => {
  it("validates a specific slot against availability", () => {
    const citas: CitaOcupadaInput[] = [
      {
        inicio: dateAt("2026-07-11", "10:00"),
        fin: dateAt("2026-07-11", "11:00"),
        colaboradora_id: "colab-1",
        estado: "confirmada",
      },
    ];

    const base = {
      date: dateAt("2026-07-11", "12:00"),
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      citas,
      colaboradoraId: "colab-1",
    };

    expect(
      isSlotAvailable({
        ...base,
        slotInicio: dateAt("2026-07-11", "10:00"),
      })
    ).toBe(false);

    expect(
      isSlotAvailable({
        ...base,
        slotInicio: dateAt("2026-07-11", "11:00"),
      })
    ).toBe(true);
  });

  it("blocks slots during daily lunch pause", () => {
    const date = dateAt("2026-07-06", "12:00");
    const slots = computeAvailability({
      date,
      timezone: TZ,
      duracionMinutos: 60,
      horarios: weekdayHorarios,
      excepcion: null,
      pausaDiaria: {
        activa: true,
        hora_inicio: "12:00",
        hora_fin: "13:00",
      },
      citas: [],
    });

    const slotStarts = slots.map((s) => s.inicio.getTime());
    expect(slotStarts).toContain(dateAt("2026-07-06", "11:00").getTime());
    expect(slotStarts).toContain(dateAt("2026-07-06", "13:00").getTime());
    expect(slotStarts).not.toContain(dateAt("2026-07-06", "12:00").getTime());
  });
});
