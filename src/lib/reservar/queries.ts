import { createAnonymousClient } from "@/lib/supabase/anon";
import type { ReservaItem, SalonPublico } from "@/types/database";

/**
 * Public booking reads always run as `anon`: a visitor logged into another
 * salon would otherwise be filtered by `authenticated` RLS and see a 404.
 * Throws on DB errors so outages show a retry page instead of "no encontrado".
 */
export async function getSalonBySlug(
  slug: string
): Promise<SalonPublico | null> {
  const supabase = createAnonymousClient();
  const { data, error } = await supabase
    .from("salones")
    .select(
      "id, nombre, slug, moneda, timezone, fri_link, politica_reembolso, logo_url, slot_step_minutes, pausa_diaria_activa, pausa_hora_inicio, pausa_hora_fin, permite_reserva_otra_persona"
    )
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    console.error("[reservar] salon lookup failed", error.message);
    throw new Error("SALON_LOOKUP_FAILED");
  }

  return data;
}

export async function getCatalogoPublico(
  salonId: string
): Promise<ReservaItem[]> {
  const supabase = createAnonymousClient();

  const [serviciosRes, paquetesRes] = await Promise.all([
    supabase
      .from("servicios")
      .select("id, nombre, categoria, precio, duracion_minutos")
      .eq("salon_id", salonId)
      .eq("activo", true)
      .order("categoria")
      .order("nombre"),
    supabase
      .from("paquetes")
      .select(
        `
        id,
        nombre,
        precio,
        duracion_minutos,
        paquete_servicios (
          orden,
          servicios ( nombre )
        )
      `
      )
      .eq("salon_id", salonId)
      .eq("activo", true)
      .order("nombre"),
  ]);

  if (serviciosRes.error || paquetesRes.error) {
    console.error(
      "[reservar] catalog query failed",
      serviciosRes.error?.message ?? paquetesRes.error?.message
    );
    throw new Error("CATALOGO_LOOKUP_FAILED");
  }

  const servicios: ReservaItem[] = (serviciosRes.data ?? []).map((s) => ({
    tipo: "servicio" as const,
    id: s.id,
    nombre: s.nombre,
    precio: Number(s.precio),
    duracion_minutos: s.duracion_minutos,
    categoria: s.categoria,
  }));

  const paquetes: ReservaItem[] = (paquetesRes.data ?? []).map((p) => {
    const junction = p.paquete_servicios as Array<{
      orden: number;
      servicios: { nombre: string } | { nombre: string }[] | null;
    }>;

    return {
      tipo: "paquete" as const,
      id: p.id,
      nombre: p.nombre,
      precio: Number(p.precio),
      duracion_minutos: p.duracion_minutos,
      servicios: junction
        .sort((a, b) => a.orden - b.orden)
        .map((j) => {
          const servicio = Array.isArray(j.servicios)
            ? j.servicios[0]
            : j.servicios;
          return { nombre: servicio?.nombre ?? "Servicio" };
        }),
    };
  });

  return [...servicios, ...paquetes];
}

export type ConfirmacionReserva = {
  citaId: string;
  salonNombre: string;
  timezone: string;
  itemNombre: string;
  precio: number;
  inicio: string;
  fin: string;
  metodo: string;
  estado: string;
};

export async function getConfirmacionReserva(
  slug: string,
  citaId: string
): Promise<ConfirmacionReserva | null> {
  const supabase = createAnonymousClient();

  const salon = await getSalonBySlug(slug);
  if (!salon) return null;

  const { data: cita } = await supabase
    .from("citas")
    .select(
      `
      id,
      inicio,
      fin,
      estado,
      servicio:servicios ( nombre ),
      paquete:paquetes ( nombre ),
      pagos ( metodo, monto )
    `
    )
    .eq("id", citaId)
    .eq("salon_id", salon.id)
    .eq("creada_por", "clienta")
    .maybeSingle();

  if (!cita) return null;

  const servicio = Array.isArray(cita.servicio) ? cita.servicio[0] : cita.servicio;
  const paquete = Array.isArray(cita.paquete) ? cita.paquete[0] : cita.paquete;
  const pagos = cita.pagos as Array<{ metodo: string; monto: number }> | null;
  const pago = pagos?.[0];

  return {
    citaId: cita.id,
    salonNombre: salon.nombre,
    timezone: salon.timezone,
    itemNombre: servicio?.nombre ?? paquete?.nombre ?? "Servicio",
    precio: Number(pago?.monto ?? 0),
    inicio: cita.inicio,
    fin: cita.fin,
    metodo: pago?.metodo ?? "efectivo",
    estado: cita.estado,
  };
}
