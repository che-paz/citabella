import { createClient } from "@/lib/supabase/server";
import type { Clienta, CitaConDetalle } from "@/types/database";

export async function searchClientas(
  salonId: string,
  query?: string
): Promise<Clienta[]> {
  const supabase = await createClient();

  let builder = supabase
    .from("clientas")
    .select("*")
    .eq("salon_id", salonId)
    .order("nombre");

  const q = query?.trim();
  if (q) {
    const pattern = `%${q}%`;
    builder = builder.or(`nombre.ilike.${pattern},telefono.ilike.${pattern}`);
  }

  const { data } = await builder;
  return data ?? [];
}

export async function getClientaById(
  salonId: string,
  clientaId: string
): Promise<Clienta | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("clientas")
    .select("*")
    .eq("salon_id", salonId)
    .eq("id", clientaId)
    .single();

  return data;
}

export async function getClientaCitas(
  salonId: string,
  clientaId: string
): Promise<CitaConDetalle[]> {
  const supabase = await createClient();

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
    .eq("clienta_id", clientaId)
    .order("inicio", { ascending: false });

  return (data ?? []).map((c) => {
    const clienta = Array.isArray(c.clienta) ? c.clienta[0] : c.clienta;
    const colaboradora = Array.isArray(c.colaboradora)
      ? c.colaboradora[0]
      : c.colaboradora;
    const servicio = Array.isArray(c.servicio) ? c.servicio[0] : c.servicio;
    const paquete = Array.isArray(c.paquete) ? c.paquete[0] : c.paquete;
    const pagosRaw = Array.isArray(c.pagos) ? c.pagos : c.pagos ? [c.pagos] : [];
    const pago = pagosRaw[0] ?? null;

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
      pago: pago
        ? { metodo: pago.metodo, estado: pago.estado }
        : null,
    };
  });
}
