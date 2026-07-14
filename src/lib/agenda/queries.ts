import { addDaysToDateKey, getMonthGridDateKeys, getMonthStartDateKey, getWeekStartDateKey } from "@/lib/agenda/dates";
import { endOfSalonDayUtc, startOfSalonDayUtc } from "@/lib/availability/timezone";
import { createClient } from "@/lib/supabase/server";
import type { CitaConDetalle } from "@/types/database";

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
