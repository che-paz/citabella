import { todayDateKey, getDayBoundsIso } from "@/lib/agenda/dates";
import { createClient } from "@/lib/supabase/server";
import type { CitaConDetalle, CitaEstado } from "@/types/database";

const ACTIVE_ESTADOS: CitaEstado[] = [
  "pendiente",
  "pendiente_validacion",
  "confirmada",
  "completada",
];

export async function getCitasHoy(
  salonId: string,
  timezone: string
): Promise<CitaConDetalle[]> {
  const supabase = await createClient();
  const dateKey = todayDateKey(timezone);
  const { start, end } = getDayBoundsIso(dateKey, timezone);

  const { data } = await supabase
    .from("citas")
    .select(
      `
      *,
      clienta:clientas ( id, nombre, telefono ),
      colaboradora:usuarios ( id, nombre ),
      servicio:servicios ( id, nombre, duracion_minutos ),
      paquete:paquetes ( id, nombre, duracion_minutos )
    `
    )
    .eq("salon_id", salonId)
    .gte("inicio", start)
    .lt("inicio", end)
    .in("estado", ACTIVE_ESTADOS)
    .order("inicio");

  return (data ?? []).map((c) => {
    const clienta = Array.isArray(c.clienta) ? c.clienta[0] : c.clienta;
    const colaboradora = Array.isArray(c.colaboradora)
      ? c.colaboradora[0]
      : c.colaboradora;
    const servicio = Array.isArray(c.servicio) ? c.servicio[0] : c.servicio;
    const paquete = Array.isArray(c.paquete) ? c.paquete[0] : c.paquete;

    return {
      id: c.id,
      salon_id: c.salon_id,
      clienta_id: c.clienta_id,
      servicio_id: c.servicio_id,
      paquete_id: c.paquete_id,
      colaboradora_id: c.colaboradora_id,
      inicio: c.inicio,
      fin: c.fin,
      estado: c.estado,
      notas: c.notas,
      creada_por: c.creada_por,
      created_at: c.created_at,
      updated_at: c.updated_at,
      clienta: clienta ?? {
        id: c.clienta_id,
        nombre: "Clienta",
        telefono: null,
      },
      colaboradora: colaboradora ?? null,
      servicio: servicio ?? null,
      paquete: paquete ?? null,
    };
  });
}

export async function getPagosPendientesCount(salonId: string): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("pagos")
    .select("id", { count: "exact", head: true })
    .eq("salon_id", salonId)
    .eq("estado", "pendiente");

  return count ?? 0;
}

export async function getIngresosHoy(
  salonId: string,
  timezone: string
): Promise<number> {
  const supabase = await createClient();
  const dateKey = todayDateKey(timezone);
  const { start, end } = getDayBoundsIso(dateKey, timezone);

  const { data } = await supabase
    .from("pagos")
    .select("monto")
    .eq("salon_id", salonId)
    .eq("estado", "validado")
    .gte("validado_at", start)
    .lt("validado_at", end);

  return (data ?? []).reduce((sum, p) => sum + Number(p.monto), 0);
}
