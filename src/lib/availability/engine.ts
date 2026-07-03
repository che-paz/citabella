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

export type CitaOcupadaInput = {
  id?: string;
  inicio: Date;
  fin: Date;
  colaboradora_id: string | null;
  estado: string;
};

export type AvailabilityInput = {
  date: Date;
  timezone: string;
  duracionMinutos: number;
  horarios: HorarioSalonInput[];
  excepcion: ExcepcionHorarioInput | null;
  citas: CitaOcupadaInput[];
  colaboradoraId?: string;
  excludeCitaId?: string;
  slotStepMinutes?: number;
};

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

function citasBlockColaboradora(
  cita: CitaOcupadaInput,
  colaboradoraId?: string
): boolean {
  if (!colaboradoraId) return true;
  if (cita.colaboradora_id === null) return true;
  return cita.colaboradora_id === colaboradoraId;
}

export function computeAvailability(input: AvailabilityInput): TimeRange[] {
  const {
    date,
    timezone,
    duracionMinutos,
    horarios,
    excepcion,
    citas,
    colaboradoraId,
    excludeCitaId,
    slotStepMinutes = DEFAULT_SLOT_STEP_MINUTES,
  } = input;

  const dateKey = getSalonDateKey(date, timezone);
  const dayOfWeek = getSalonDayOfWeek(date, timezone);
  const dayStart = startOfSalonDayUtc(dateKey, timezone);
  const dayEnd = endOfSalonDayUtc(dateKey, timezone);

  const matchingExcepcion =
    excepcion && excepcion.fecha === dateKey ? excepcion : null;

  const workingRanges = buildWorkingRanges(
    dateKey,
    timezone,
    horarios,
    matchingExcepcion,
    dayOfWeek
  );

  if (workingRanges.length === 0) return [];

  const blockingCitas = filterBlockingCitas(citas).filter((cita) => {
    if (excludeCitaId && cita.id === excludeCitaId) {
      return false;
    }
    if (!citasBlockColaboradora(cita, colaboradoraId)) return false;
    return cita.fin > dayStart && cita.inicio < dayEnd;
  });

  const busyRanges: TimeRange[] = blockingCitas.map((c) => ({
    inicio: c.inicio,
    fin: c.fin,
  }));

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

export function validateNoOverlap(
  newRange: TimeRange,
  citas: CitaOcupadaInput[],
  colaboradoraId: string | null,
  excludeCitaId?: string
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

  return !blocking.some((c) =>
    rangesOverlap(newRange, { inicio: c.inicio, fin: c.fin })
  );
}

function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.inicio < b.fin && b.inicio < a.fin;
}
