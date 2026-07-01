import { createClient } from "@/lib/supabase/server";
import {
  computeAvailability,
  type AvailabilityInput,
  type CitaOcupadaInput,
} from "./engine";
import { BLOCKING_CITA_ESTADOS } from "./slots";
import { getSalonDateKey, startOfSalonDayUtc, endOfSalonDayUtc } from "./timezone";
import type { TimeRange } from "./slots";

export async function fetchAvailabilitySlots(params: {
  salonId: string;
  date: Date;
  timezone: string;
  duracionMinutos: number;
  colaboradoraId?: string;
  excludeCitaId?: string;
}): Promise<TimeRange[]> {
  const supabase = await createClient();
  const dateKey = getSalonDateKey(params.date, params.timezone);
  const dayStart = startOfSalonDayUtc(dateKey, params.timezone).toISOString();
  const dayEnd = endOfSalonDayUtc(dateKey, params.timezone).toISOString();

  const [horariosRes, excepcionRes, citasRes] = await Promise.all([
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
  ]);

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
    citas,
    colaboradoraId: params.colaboradoraId,
    excludeCitaId: params.excludeCitaId,
  };

  return computeAvailability(input);
}
