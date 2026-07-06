import { createClient } from "@/lib/supabase/server";
import { endOfSalonDayUtc, startOfSalonDayUtc } from "@/lib/availability/timezone";
import { getSalonDateKey } from "@/lib/availability/timezone";
import type { MovimientoContable } from "@/types/database";

export type ResumenFinanciero = {
  ingresosPagos: number;
  ingresosManuales: number;
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  mesLabel: string;
};

function monthBounds(timezone: string): {
  start: string;
  end: string;
  startDate: string;
  endDate: string;
  label: string;
} {
  const now = new Date();
  const dateKey = getSalonDateKey(now, timezone);
  const [y, m] = dateKey.split("-").map(Number);
  const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const endDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return {
    start: startOfSalonDayUtc(startDate, timezone).toISOString(),
    end: endOfSalonDayUtc(endDate, timezone).toISOString(),
    startDate,
    endDate,
    label: new Intl.DateTimeFormat("es-GT", {
      month: "long",
      year: "numeric",
      timeZone: timezone,
    }).format(now),
  };
}

export async function getResumenFinanciero(
  salonId: string,
  timezone: string
): Promise<ResumenFinanciero> {
  const supabase = await createClient();
  const { start, end, startDate, endDate, label } = monthBounds(timezone);

  const [cobradosRes, legacyRes, movimientosRes] = await Promise.all([
    supabase
      .from("pagos")
      .select("monto")
      .eq("salon_id", salonId)
      .eq("estado", "cobrado")
      .gte("cobrado_at", start)
      .lt("cobrado_at", end),
    supabase
      .from("pagos")
      .select("monto")
      .eq("salon_id", salonId)
      .eq("estado", "validado")
      .is("cobrado_at", null)
      .gte("validado_at", start)
      .lt("validado_at", end),
    supabase
      .from("movimientos_contables")
      .select("tipo, monto")
      .eq("salon_id", salonId)
      .gte("fecha", startDate)
      .lte("fecha", endDate),
  ]);

  const ingresosPagos =
    (cobradosRes.data ?? []).reduce((s, p) => s + Number(p.monto), 0) +
    (legacyRes.data ?? []).reduce((s, p) => s + Number(p.monto), 0);

  const movimientos = movimientosRes.data ?? [];
  const ingresosManuales = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((s, m) => s + Number(m.monto), 0);
  const totalGastos = movimientos
    .filter((m) => m.tipo === "egreso")
    .reduce((s, m) => s + Number(m.monto), 0);

  const totalIngresos = ingresosPagos + ingresosManuales;

  return {
    ingresosPagos,
    ingresosManuales,
    totalIngresos,
    totalGastos,
    balance: totalIngresos - totalGastos,
    mesLabel: label,
  };
}

export async function getMovimientos(
  salonId: string,
  limit = 50
): Promise<MovimientoContable[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("movimientos_contables")
    .select("*")
    .eq("salon_id", salonId)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((m) => ({
    ...m,
    monto: Number(m.monto),
  }));
}
