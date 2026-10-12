import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  computeAvailability,
  type AvailabilityInput,
  type BloqueoOcupadoInput,
  type CitaOcupadaInput,
  type ExcepcionHorarioInput,
  type HorarioSalonInput,
  type PausaDiariaInput,
} from "./engine";
import { fetchSalonPausaDiaria } from "./pausa";
import { BLOCKING_CITA_ESTADOS, DEFAULT_SLOT_STEP_MINUTES } from "./slots";
import { getSalonDateKey, startOfSalonDayUtc, endOfSalonDayUtc } from "./timezone";
import type { TimeRange } from "./slots";

export type FetchAvailabilityResult =
  | { ok: true; slots: TimeRange[] }
  | { ok: false; error: string };

/** True when Postgres rejected a cita that overlaps another cita or an evento personal. */
export function isCitaOverlapDbError(error: {
  code?: string;
  message?: string;
} | null): boolean {
  if (!error) return false;
  const message = error.message ?? "";
  if (message.includes("CITA_BLOQUEO") || message.includes("CITA_OVERLAP")) {
    return true;
  }
  if (message.includes("BLOQUEO_CITA")) return false;
  return error.code === "23P01";
}

type OccupancyOk = {
  ok: true;
  horarios: HorarioSalonInput[];
  excepciones: ExcepcionHorarioInput[];
  citas: CitaOcupadaInput[];
  bloqueos: BloqueoOcupadoInput[];
  pausaDiaria: PausaDiariaInput | null;
};

function mapBloqueoRows(
  rows: { inicio: string; fin: string; colaboradora_id: string | null }[]
): BloqueoOcupadoInput[] {
  return rows.map((row) => ({
    inicio: new Date(row.inicio),
    fin: new Date(row.fin),
    colaboradora_id: row.colaboradora_id,
  }));
}

async function fetchBloqueosOcupados(
  supabase: SupabaseClient,
  params: {
    salonId: string;
    rangeStartIso: string;
    rangeEndIso: string;
    publicBooking?: boolean;
  }
): Promise<{ ok: true; bloqueos: BloqueoOcupadoInput[] } | { ok: false; error: string }> {
  if (params.publicBooking) {
    const { data, error } = await supabase.rpc("get_salon_bloqueos_ocupados", {
      p_salon_id: params.salonId,
      p_desde: params.rangeStartIso,
      p_hasta: params.rangeEndIso,
    });

    if (error) {
      console.error("[availability] bloqueos rpc failed", error.message);
      return { ok: false, error: "No se pudo verificar la disponibilidad" };
    }

    return {
      ok: true,
      bloqueos: mapBloqueoRows(
        (data ?? []) as {
          inicio: string;
          fin: string;
          colaboradora_id: string | null;
        }[]
      ),
    };
  }

  const { data, error } = await supabase
    .from("bloqueos_agenda")
    .select("inicio, fin, colaboradora_id")
    .eq("salon_id", params.salonId)
    .lt("inicio", params.rangeEndIso)
    .gt("fin", params.rangeStartIso);

  if (error) {
    console.error("[availability] bloqueos query failed", error.message);
    return { ok: false, error: "No se pudo verificar la disponibilidad" };
  }

  return { ok: true, bloqueos: mapBloqueoRows(data ?? []) };
}

/** Citas, horarios y eventos personales de un rango. Falla cerrado si alguna lectura falla. */
export async function fetchOccupancyForRange(params: {
  salonId: string;
  rangeStartIso: string;
  rangeEndIso: string;
  dateStartKey: string;
  dateEndKey: string;
  publicBooking?: boolean;
  client?: SupabaseClient;
  pausaDiaria?: PausaDiariaInput | null;
}): Promise<OccupancyOk | { ok: false; error: string }> {
  const supabase = params.client ?? (await createClient());

  const [horariosRes, excepcionRes, citasRes, bloqueosResult, pausaDiaria] =
    await Promise.all([
      supabase
        .from("horarios_salon")
        .select("dia_semana, hora_inicio, hora_fin")
        .eq("salon_id", params.salonId),
      supabase
        .from("excepciones_horario")
        .select("fecha, cerrado, hora_inicio, hora_fin")
        .eq("salon_id", params.salonId)
        .gte("fecha", params.dateStartKey)
        .lte("fecha", params.dateEndKey),
      supabase
        .from("citas")
        .select("id, inicio, fin, colaboradora_id, estado")
        .eq("salon_id", params.salonId)
        .in("estado", [...BLOCKING_CITA_ESTADOS])
        .lt("inicio", params.rangeEndIso)
        .gt("fin", params.rangeStartIso),
      fetchBloqueosOcupados(supabase, {
        salonId: params.salonId,
        rangeStartIso: params.rangeStartIso,
        rangeEndIso: params.rangeEndIso,
        publicBooking: params.publicBooking,
      }),
      fetchSalonPausaDiaria(params.salonId, params.pausaDiaria),
    ]);

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

  if (!bloqueosResult.ok) return bloqueosResult;

  const citas: CitaOcupadaInput[] = (citasRes.data ?? []).map((c) => ({
    id: c.id,
    inicio: new Date(c.inicio),
    fin: new Date(c.fin),
    colaboradora_id: c.colaboradora_id,
    estado: c.estado,
  }));

  const excepciones: ExcepcionHorarioInput[] = (excepcionRes.data ?? []).map(
    (row) => ({
      fecha: String(row.fecha).slice(0, 10),
      cerrado: row.cerrado,
      hora_inicio: row.hora_inicio,
      hora_fin: row.hora_fin,
    })
  );

  return {
    ok: true,
    horarios: horariosRes.data ?? [],
    excepciones,
    citas,
    bloqueos: bloqueosResult.bloqueos,
    pausaDiaria,
  };
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
  /** Public booking reads blocks through the RPC (inicio/fin only). */
  publicBooking?: boolean;
  /** Public booking passes an anon client; dashboard uses the session. */
  client?: SupabaseClient;
}): Promise<FetchAvailabilityResult> {
  const dateKey = getSalonDateKey(params.date, params.timezone);
  const dayStart = startOfSalonDayUtc(dateKey, params.timezone).toISOString();
  const dayEnd = endOfSalonDayUtc(dateKey, params.timezone).toISOString();

  const occupancy = await fetchOccupancyForRange({
    salonId: params.salonId,
    rangeStartIso: dayStart,
    rangeEndIso: dayEnd,
    dateStartKey: dateKey,
    dateEndKey: dateKey,
    publicBooking: params.publicBooking,
    client: params.client,
    pausaDiaria: params.pausaDiaria,
  });

  if (!occupancy.ok) return occupancy;

  const input: AvailabilityInput = {
    date: params.date,
    timezone: params.timezone,
    duracionMinutos: params.duracionMinutos,
    horarios: occupancy.horarios,
    excepcion:
      occupancy.excepciones.find((item) => item.fecha === dateKey) ?? null,
    pausaDiaria: occupancy.pausaDiaria,
    citas: occupancy.citas,
    bloqueos: occupancy.bloqueos,
    colaboradoraId: params.colaboradoraId,
    excludeCitaId: params.excludeCitaId,
    slotStepMinutes: params.slotStepMinutes ?? DEFAULT_SLOT_STEP_MINUTES,
  };

  return { ok: true, slots: computeAvailability(input) };
}
