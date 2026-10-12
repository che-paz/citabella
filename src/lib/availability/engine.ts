import {
  DEFAULT_SLOT_STEP_MINUTES,
  filterBlockingCitas,
  findSlotsInRanges,
  subtractBusyRanges,
  type TimeRange,
} from "./slots";
import {
  endOfSalonDayUtc,
  getSalonDateKey,
  getSalonDayOfWeek,
  isSalonOnTheHour,
  salonLocalToUtc,
  startOfSalonDayUtc,
} from "./timezone";

export type HorarioSalonInput = {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
};

export type ExcepcionHorarioInput = {
  fecha: string;
  cerrado: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
};

export type PausaDiariaInput = {
  activa: boolean;
  hora_inicio: string;
  hora_fin: string;
};

export type CitaOcupadaInput = {
  id?: string;
  inicio: Date;
  fin: Date;
  colaboradora_id: string | null;
  estado: string;
};

/** Evento personal. Ocupa la agenda igual que una cita bloqueante. */
export type BloqueoOcupadoInput = {
  id?: string;
  inicio: Date;
  fin: Date;
  colaboradora_id: string | null;
};

export type SalonDayStatus = "closed" | "full" | "open";

export type AvailabilityInput = {
  date: Date;
  timezone: string;
  duracionMinutos: number;
  horarios: HorarioSalonInput[];
  excepcion: ExcepcionHorarioInput | null;
  pausaDiaria?: PausaDiariaInput | null;
  citas: CitaOcupadaInput[];
  bloqueos?: BloqueoOcupadoInput[];
  colaboradoraId?: string;
  excludeCitaId?: string;
  slotStepMinutes?: number;
};

function applyPausaDiaria(
  dateKey: string,
  timezone: string,
  ranges: TimeRange[],
  pausaDiaria?: PausaDiariaInput | null
): TimeRange[] {
  if (!pausaDiaria?.activa || ranges.length === 0) {
    return ranges;
  }

  const pauseRange: TimeRange = {
    inicio: salonLocalToUtc(dateKey, pausaDiaria.hora_inicio, timezone),
    fin: salonLocalToUtc(dateKey, pausaDiaria.hora_fin, timezone),
  };

  return subtractBusyRanges(ranges, [pauseRange]);
}

function buildWorkingRanges(
  dateKey: string,
  timezone: string,
  horarios: HorarioSalonInput[],
  excepcion: ExcepcionHorarioInput | null,
  dayOfWeek: number
): TimeRange[] {
  if (excepcion) {
    if (excepcion.cerrado) return [];
    if (excepcion.hora_inicio && excepcion.hora_fin) {
      return [
        {
          inicio: salonLocalToUtc(dateKey, excepcion.hora_inicio, timezone),
          fin: salonLocalToUtc(dateKey, excepcion.hora_fin, timezone),
        },
      ];
    }
    return [];
  }

  const dayHorario = horarios.find((h) => h.dia_semana === dayOfWeek);
  if (!dayHorario) return [];

  return [
    {
      inicio: salonLocalToUtc(dateKey, dayHorario.hora_inicio, timezone),
      fin: salonLocalToUtc(dateKey, dayHorario.hora_fin, timezone),
    },
  ];
}

function ocupacionBlocksColaboradora(
  ocupadaColaboradoraId: string | null,
  colaboradoraId?: string
): boolean {
  if (!colaboradoraId) return true;
  if (ocupadaColaboradoraId === null) return true;
  return ocupadaColaboradoraId === colaboradoraId;
}

function workingRangesForDay(input: AvailabilityInput): TimeRange[] {
  const dateKey = getSalonDateKey(input.date, input.timezone);
  const dayOfWeek = getSalonDayOfWeek(input.date, input.timezone);
  const matchingExcepcion =
    input.excepcion && input.excepcion.fecha.slice(0, 10) === dateKey
      ? input.excepcion
      : null;

  const ranges = buildWorkingRanges(
    dateKey,
    input.timezone,
    input.horarios,
    matchingExcepcion,
    dayOfWeek
  );

  return applyPausaDiaria(dateKey, input.timezone, ranges, input.pausaDiaria);
}

export function computeAvailability(input: AvailabilityInput): TimeRange[] {
  const {
    date,
    timezone,
    duracionMinutos,
    citas,
    bloqueos = [],
    colaboradoraId,
    excludeCitaId,
    slotStepMinutes = DEFAULT_SLOT_STEP_MINUTES,
  } = input;

  const dateKey = getSalonDateKey(date, timezone);
  const dayStart = startOfSalonDayUtc(dateKey, timezone);
  const dayEnd = endOfSalonDayUtc(dateKey, timezone);
  const workingRanges = workingRangesForDay(input);

  if (workingRanges.length === 0) return [];

  const blockingCitas = filterBlockingCitas(citas).filter((cita) => {
    if (excludeCitaId && cita.id === excludeCitaId) {
      return false;
    }
    if (!ocupacionBlocksColaboradora(cita.colaboradora_id, colaboradoraId)) {
      return false;
    }
    return cita.fin > dayStart && cita.inicio < dayEnd;
  });

  const blockingBloqueos = bloqueos.filter((bloqueo) => {
    if (!ocupacionBlocksColaboradora(bloqueo.colaboradora_id, colaboradoraId)) {
      return false;
    }
    return bloqueo.fin > dayStart && bloqueo.inicio < dayEnd;
  });

  const busyRanges: TimeRange[] = [
    ...blockingCitas.map((c) => ({ inicio: c.inicio, fin: c.fin })),
    ...blockingBloqueos.map((b) => ({ inicio: b.inicio, fin: b.fin })),
  ];

  const available = subtractBusyRanges(workingRanges, busyRanges);
  let slots = findSlotsInRanges(available, duracionMinutos, slotStepMinutes);

  if (slotStepMinutes >= 60) {
    slots = slots.filter((s) => isSalonOnTheHour(s.inicio, timezone));
  }

  return slots;
}

export function isSlotAvailable(
  input: AvailabilityInput & { slotInicio: Date }
): boolean {
  const slots = computeAvailability(input);
  const target = input.slotInicio.getTime();

  return slots.some((s) => s.inicio.getTime() === target);
}

export function getSalonDayStatus(
  input: AvailabilityInput & { now?: Date }
): SalonDayStatus {
  if (workingRangesForDay(input).length === 0) return "closed";

  let slots = computeAvailability(input);
  if (input.now) {
    const dateKey = getSalonDateKey(input.date, input.timezone);
    const nowKey = getSalonDateKey(input.now, input.timezone);
    if (dateKey === nowKey) {
      const nowMs = input.now.getTime();
      slots = slots.filter((slot) => slot.inicio.getTime() > nowMs);
    }
  }

  return slots.length === 0 ? "full" : "open";
}

export function listFullDateKeys(
  dateKeys: string[],
  input: Omit<AvailabilityInput, "date" | "excepcion"> & {
    excepciones: ExcepcionHorarioInput[];
    now?: Date;
  }
): string[] {
  const full: string[] = [];

  for (const dateKey of dateKeys) {
    const excepcion =
      input.excepciones.find((item) => item.fecha.slice(0, 10) === dateKey) ??
      null;
    const status = getSalonDayStatus({
      ...input,
      date: salonLocalToUtc(dateKey, "12:00", input.timezone),
      excepcion,
    });
    if (status === "full") full.push(dateKey);
  }

  return full;
}

export function validateNoOverlap(
  newRange: TimeRange,
  citas: CitaOcupadaInput[],
  colaboradoraId: string | null,
  excludeCitaId?: string,
  bloqueos: BloqueoOcupadoInput[] = []
): boolean {
  const blocking = filterBlockingCitas(citas).filter((c) => {
    if (excludeCitaId && c.id === excludeCitaId) return false;
    if (colaboradoraId) {
      if (c.colaboradora_id !== null && c.colaboradora_id !== colaboradoraId) {
        return false;
      }
    }
    return true;
  });

  const citaConflict = blocking.some((c) =>
    rangesOverlap(newRange, { inicio: c.inicio, fin: c.fin })
  );
  if (citaConflict) return false;

  return !bloqueos.some((bloqueo) => {
    if (
      colaboradoraId &&
      bloqueo.colaboradora_id !== null &&
      bloqueo.colaboradora_id !== colaboradoraId
    ) {
      return false;
    }
    return rangesOverlap(newRange, {
      inicio: bloqueo.inicio,
      fin: bloqueo.fin,
    });
  });
}

function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.inicio < b.fin && b.inicio < a.fin;
}
