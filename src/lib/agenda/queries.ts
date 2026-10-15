import { addDaysToDateKey, getMonthGridDateKeys, getMonthStartDateKey, getWeekStartDateKey } from "@/lib/agenda/dates";
import { endOfSalonDayUtc, startOfSalonDayUtc } from "@/lib/availability/timezone";
import { createClient } from "@/lib/supabase/server";
import type { BloqueoAgenda, CitaConDetalle } from "@/types/database";

function mapCitaRow(c: Record<string, unknown>): CitaConDetalle {
  const clienta = Array.isArray(c.clienta) ? c.clienta[0] : c.clienta;
  const colaboradora = Array.isArray(c.colaboradora)
    ? c.colaboradora[0]
    : c.colaboradora;
  const servicio = Array.isArray(c.servicio) ? c.servicio[0] : c.servicio;
  const paquete = Array.isArray(c.paquete) ? c.paquete[0] : c.paquete;
  const pagosRaw = Array.isArray(c.pagos) ? c.pagos : c.pagos ? [c.pagos] : [];
  const pago = pagosRaw[0] ?? null;

  return {
    id: c.id as string,
    salon_id: c.salon_id as string,
    clienta_id: c.clienta_id as string,
    servicio_id: c.servicio_id as string | null,
    paquete_id: c.paquete_id as string | null,
    colaboradora_id: c.colaboradora_id as string | null,
    inicio: c.inicio as string,
    fin: c.fin as string,
    estado: c.estado as CitaConDetalle["estado"],
    notas: c.notas as string | null,
    beneficiario_nombre: (c.beneficiario_nombre as string | null) ?? null,
    creada_por: c.creada_por as CitaConDetalle["creada_por"],
    created_at: c.created_at as string,
    updated_at: c.updated_at as string,
    clienta: (clienta as CitaConDetalle["clienta"]) ?? {
      id: c.clienta_id as string,
      nombre: "Clienta",
      telefono: null,
    },
    colaboradora: (colaboradora as CitaConDetalle["colaboradora"]) ?? null,
    servicio: (servicio as CitaConDetalle["servicio"]) ?? null,
    paquete: (paquete as CitaConDetalle["paquete"]) ?? null,
    pago: pago
      ? {
          metodo: pago.metodo as NonNullable<CitaConDetalle["pago"]>["metodo"],
          estado: pago.estado as NonNullable<CitaConDetalle["pago"]>["estado"],
        }
      : null,
  };
}

export async function getAgendaCitas(
  salonId: string,
  dateKey: string,
  view: "day" | "week" | "month",
  timezone: string
): Promise<CitaConDetalle[]> {
  const supabase = await createClient();
  const weekStart = getWeekStartDateKey(dateKey);
  const monthStart = getMonthStartDateKey(dateKey);
  const monthGrid = getMonthGridDateKeys(monthStart);

  let rangeStartKey: string;
  let rangeEndKey: string;

  if (view === "week") {
    rangeStartKey = weekStart;
    rangeEndKey = addDaysToDateKey(weekStart, 6);
  } else if (view === "month") {
    rangeStartKey = monthGrid[0];
    rangeEndKey = monthGrid[monthGrid.length - 1];
  } else {
    rangeStartKey = dateKey;
    rangeEndKey = dateKey;
  }

  const rangeStart = startOfSalonDayUtc(rangeStartKey, timezone).toISOString();
  const rangeEnd = endOfSalonDayUtc(rangeEndKey, timezone).toISOString();

  const { data } = await supabase
    .from("citas")
    .select(
      `
      *,
      clienta:clientas ( id, nombre, telefono ),
      colaboradora:usuarios ( id, nombre ),
      servicio:servicios ( id, nombre, duracion_minutos ),
      paquete:paquetes ( id, nombre, duracion_minutos ),
      pagos ( metodo, estado )
    `
    )
    .eq("salon_id", salonId)
    .neq("estado", "cancelada")
    .lt("inicio", rangeEnd)
    .gt("fin", rangeStart)
    .order("inicio");

  return (data ?? []).map((c) => mapCitaRow(c as Record<string, unknown>));
}

function mapBloqueoRow(row: Record<string, unknown>): BloqueoAgenda {
  const colaboradora = Array.isArray(row.colaboradora)
    ? row.colaboradora[0]
    : row.colaboradora;

  return {
    id: row.id as string,
    salon_id: row.salon_id as string,
    colaboradora_id: (row.colaboradora_id as string | null) ?? null,
    inicio: row.inicio as string,
    fin: row.fin as string,
    titulo: row.titulo as string,
    notas: (row.notas as string | null) ?? null,
    creado_por: row.creado_por as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    recordatorio_minutos: (row.recordatorio_minutos as number | null) ?? null,
    recordatorio_enviado_at:
      (row.recordatorio_enviado_at as string | null) ?? null,
    colaboradora: (colaboradora as BloqueoAgenda["colaboradora"]) ?? null,
  };
}

export async function getAgendaBloqueos(
  salonId: string,
  dateKey: string,
  view: "day" | "week" | "month",
  timezone: string
): Promise<{ bloqueos: BloqueoAgenda[]; error: boolean }> {
  const supabase = await createClient();
  const weekStart = getWeekStartDateKey(dateKey);
  const monthStart = getMonthStartDateKey(dateKey);
  const monthGrid = getMonthGridDateKeys(monthStart);

  let rangeStartKey: string;
  let rangeEndKey: string;

  if (view === "week") {
    rangeStartKey = weekStart;
    rangeEndKey = addDaysToDateKey(weekStart, 6);
  } else if (view === "month") {
    rangeStartKey = monthGrid[0];
    rangeEndKey = monthGrid[monthGrid.length - 1];
  } else {
    rangeStartKey = dateKey;
    rangeEndKey = dateKey;
  }

  const rangeStart = startOfSalonDayUtc(rangeStartKey, timezone).toISOString();
  const rangeEnd = endOfSalonDayUtc(rangeEndKey, timezone).toISOString();

  const { data, error } = await supabase
    .from("bloqueos_agenda")
    .select(
      `
      id,
      salon_id,
      colaboradora_id,
      inicio,
      fin,
      titulo,
      notas,
      creado_por,
      created_at,
      updated_at,
      recordatorio_minutos,
      recordatorio_enviado_at,
      colaboradora:usuarios!bloqueos_agenda_colaboradora_id_fkey ( id, nombre )
    `
    )
    .eq("salon_id", salonId)
    .lt("inicio", rangeEnd)
    .gt("fin", rangeStart)
    .order("inicio");

  if (error) {
    console.error("[agenda] bloqueos query failed", error.message);
    return { bloqueos: [], error: true };
  }

  return {
    bloqueos: (data ?? []).map((row) =>
      mapBloqueoRow(row as Record<string, unknown>)
    ),
    error: false,
  };
}
