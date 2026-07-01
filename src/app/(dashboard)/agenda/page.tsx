import { getAuthUser } from "@/lib/auth/get-user";
import {
  addDaysToDateKey,
  getWeekStartDateKey,
  todayDateKey,
} from "@/lib/agenda/dates";
import { endOfSalonDayUtc, startOfSalonDayUtc } from "@/lib/availability/timezone";
import { createClient } from "@/lib/supabase/server";
import { AgendaView } from "@/components/agenda/AgendaView";
import type { CitaConDetalle } from "@/types/database";

type PageProps = {
  searchParams: { date?: string; view?: string };
};

export default async function AgendaPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const timezone = user.salon.timezone ?? "America/Guatemala";
  const isAdmin = user.rol === "admin_salon";

  const dateKey =
    searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
      ? searchParams.date
      : todayDateKey(timezone);

  const view = searchParams.view === "week" ? "week" : "day";
  const weekStart = getWeekStartDateKey(dateKey);
  const rangeStartKey = view === "week" ? weekStart : dateKey;
  const rangeEndKey =
    view === "week" ? addDaysToDateKey(weekStart, 6) : dateKey;

  const rangeStart = startOfSalonDayUtc(rangeStartKey, timezone).toISOString();
  const rangeEnd = endOfSalonDayUtc(rangeEndKey, timezone).toISOString();

  const [
    citasRes,
    clientasRes,
    serviciosRes,
    paquetesRes,
    colaboradorasRes,
    horariosRes,
    excepcionesRes,
  ] = await Promise.all([
    supabase
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
      .eq("salon_id", user.salon_id)
      .lt("inicio", rangeEnd)
      .gt("fin", rangeStart)
      .order("inicio"),
    supabase
      .from("clientas")
      .select("*")
      .eq("salon_id", user.salon_id)
      .order("nombre"),
    supabase
      .from("servicios")
      .select("*")
      .eq("salon_id", user.salon_id)
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("paquetes")
      .select("*")
      .eq("salon_id", user.salon_id)
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("usuarios")
      .select("id, salon_id, email, nombre, rol, activo, created_at")
      .eq("salon_id", user.salon_id)
      .eq("activo", true)
      .in("rol", ["colaboradora", "admin_salon"])
      .order("nombre"),
    supabase
      .from("horarios_salon")
      .select("*")
      .eq("salon_id", user.salon_id)
      .order("dia_semana"),
    supabase
      .from("excepciones_horario")
      .select("*")
      .eq("salon_id", user.salon_id)
      .gte("fecha", todayDateKey(timezone))
      .order("fecha"),
  ]);

  const citas: CitaConDetalle[] = (citasRes.data ?? []).map((c) => {
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
      clienta: clienta ?? { id: c.clienta_id, nombre: "Clienta", telefono: null },
      colaboradora: colaboradora ?? null,
      servicio: servicio ?? null,
      paquete: paquete ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Calendario completo del salón."
            : "Tus citas asignadas."}
        </p>
      </div>

      <AgendaView
        citas={citas}
        clientas={clientasRes.data ?? []}
        servicios={(serviciosRes.data ?? []).map((s) => ({
          ...s,
          precio: Number(s.precio),
        }))}
        paquetes={(paquetesRes.data ?? []).map((p) => ({
          ...p,
          precio: Number(p.precio),
        }))}
        colaboradoras={colaboradorasRes.data ?? []}
        horarios={horariosRes.data ?? []}
        excepciones={excepcionesRes.data ?? []}
        timezone={timezone}
        isAdmin={isAdmin}
        currentUserId={user.id}
        initialDate={dateKey}
        initialView={view}
      />
    </div>
  );
}
