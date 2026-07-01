export type TimeRange = {
  inicio: Date;
  fin: Date;
};

export const DEFAULT_SLOT_STEP_MINUTES = 15;

export const BLOCKING_CITA_ESTADOS = [
  "pendiente",
  "pendiente_validacion",
  "confirmada",
] as const;

export type BlockingCitaEstado = (typeof BLOCKING_CITA_ESTADOS)[number];

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.inicio < b.fin && b.inicio < a.fin;
}

export function subtractBusyRanges(
  available: TimeRange[],
  busy: TimeRange[]
): TimeRange[] {
  let result = [...available];

  for (const block of busy) {
    const next: TimeRange[] = [];

    for (const range of result) {
      if (!rangesOverlap(range, block)) {
        next.push(range);
        continue;
      }

      if (block.inicio > range.inicio) {
        next.push({ inicio: range.inicio, fin: block.inicio });
      }

      if (block.fin < range.fin) {
        next.push({ inicio: block.fin, fin: range.fin });
      }
    }

    result = next.filter((r) => r.fin > r.inicio);
  }

  return result.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}

export function findSlotsInRanges(
  ranges: TimeRange[],
  durationMinutes: number,
  stepMinutes: number = DEFAULT_SLOT_STEP_MINUTES
): TimeRange[] {
  const durationMs = durationMinutes * 60_000;
  const stepMs = stepMinutes * 60_000;
  const slots: TimeRange[] = [];

  for (const range of ranges) {
    let start = range.inicio.getTime();
    const end = range.fin.getTime();

    while (start + durationMs <= end) {
      slots.push({
        inicio: new Date(start),
        fin: new Date(start + durationMs),
      });
      start += stepMs;
    }
  }

  return slots;
}

export function filterBlockingCitas<T extends { estado: string }>(
  citas: T[]
): T[] {
  return citas.filter((c) =>
    BLOCKING_CITA_ESTADOS.includes(c.estado as BlockingCitaEstado)
  );
}
