import { getAuthUser } from "@/lib/auth/get-user";
import { getAgendaCitas } from "@/lib/agenda/queries";
import { todayDateKey } from "@/lib/agenda/dates";
import { createClient } from "@/lib/supabase/server";
import { AgendaView } from "@/components/agenda/AgendaView";

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

  const view =
    searchParams.view === "week"
      ? "week"
      : searchParams.view === "month"
        ? "month"
        : "day";

  const [
    citas,
    clientasRes,
    serviciosRes,
    paquetesRes,
    colaboradorasRes,
    horariosRes,
    excepcionesRes,
  ] = await Promise.all([
    getAgendaCitas(user.salon_id, dateKey, view, timezone),
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
