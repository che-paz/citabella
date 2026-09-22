import { createClient } from "@/lib/supabase/server";
import {
  computeAvailability,
  type AvailabilityInput,
  type CitaOcupadaInput,
  type PausaDiariaInput,
} from "./engine";
import { fetchSalonPausaDiaria } from "./pausa";
import { BLOCKING_CITA_ESTADOS, DEFAULT_SLOT_STEP_MINUTES } from "./slots";
import { getSalonDateKey, startOfSalonDayUtc, endOfSalonDayUtc } from "./timezone";
import type { TimeRange } from "./slots";

export type FetchAvailabilityResult =
  | { ok: true; slots: TimeRange[] }
  | { ok: false; error: string };

/** True when Postgres trigger/constraint rejected an overlapping cita. */
export function isCitaOverlapDbError(error: {
  code?: string;
  message?: string;
} | null): boolean {
  if (!error) return false;
  if (error.code === "23P01") return true;
  return (error.message ?? "").includes("CITA_OVERLAP");
}

export async function fetchAvailabilitySlots(params: {
  salonId: string;
  date: Date;
  timezone: string;
  duracionMinutos: number;
  colaboradoraId?: string;
  excludeCitaId?: string;
  slotStepMinutes?: number;
  pausaDiaria?: PausaDiariaInput | null;
}): Promise<FetchAvailabilityResult> {
  const supabase = await createClient();
  const dateKey = getSalonDateKey(params.date, params.timezone);
  const dayStart = startOfSalonDayUtc(dateKey, params.timezone).toISOString();
  const dayEnd = endOfSalonDayUtc(dateKey, params.timezone).toISOString();

  const [horariosRes, excepcionRes, citasRes, pausaDiaria] = await Promise.all([
    supabase
      .from("horarios_salon")
      .select("dia_semana, hora_inicio, hora_fin")
      .eq("salon_id", params.salonId),
    supabase
      .from("excepciones_horario")
      .select("fecha, cerrado, hora_inicio, hora_fin")
      .eq("salon_id", params.salonId)
      .eq("fecha", dateKey)
      .maybeSingle(),
    supabase
      .from("citas")
      .select("id, inicio, fin, colaboradora_id, estado")
      .eq("salon_id", params.salonId)
      .in("estado", [...BLOCKING_CITA_ESTADOS])
      .lt("inicio", dayEnd)
      .gt("fin", dayStart),
    fetchSalonPausaDiaria(params.salonId, params.pausaDiaria),
  ]);

  // Fail closed: never treat a failed citas/horarios read as an empty free day.
  if (horariosRes.error) {
    console.error("[availability] horarios query failed", horariosRes.error.message);
    return { ok: false, error: "No se pudo verificar la disponibilidad" };
  }

  if (citasRes.error) {
    console.error("[availability] citas query failed", citasRes.error.message);
    return { ok: false, error: "No se pudo verificar la disponibilidad" };
  }

  if (excepcionRes.error) {
    console.error(
      "[availability] excepcion query failed",
      excepcionRes.error.message
    );
    return { ok: false, error: "No se pudo verificar la disponibilidad" };
  }

  const citas: CitaOcupadaInput[] = (citasRes.data ?? []).map((c) => ({
    id: c.id,
    inicio: new Date(c.inicio),
    fin: new Date(c.fin),
    colaboradora_id: c.colaboradora_id,
    estado: c.estado,
  }));

  const input: AvailabilityInput = {
    date: params.date,
    timezone: params.timezone,
    duracionMinutos: params.duracionMinutos,
    horarios: horariosRes.data ?? [],
    excepcion: excepcionRes.data,
    pausaDiaria,
    citas,
    colaboradoraId: params.colaboradoraId,
    excludeCitaId: params.excludeCitaId,
    slotStepMinutes: params.slotStepMinutes ?? DEFAULT_SLOT_STEP_MINUTES,
  };

  return { ok: true, slots: computeAvailability(input) };
}
