import { createClient } from "@/lib/supabase/server";
import type { PagoMetodo } from "@/types/database";

export type PagoPendiente = {
  id: string;
  monto: number;
  metodo: PagoMetodo;
  comprobante_url: string | null;
  created_at: string;
  cita: {
    id: string;
    inicio: string;
    fin: string;
    estado: string;
    beneficiario_nombre: string | null;
    clienta: { nombre: string; telefono: string | null };
    servicio: { nombre: string } | null;
    paquete: { nombre: string } | null;
  };
};

export async function getPagosPendientes(
  salonId: string
): Promise<PagoPendiente[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pagos")
    .select(
      `
      id,
      monto,
      metodo,
      comprobante_url,
      created_at,
      cita:citas (
        id,
        inicio,
        fin,
        estado,
        beneficiario_nombre,
        clienta:clientas ( nombre, telefono ),
        servicio:servicios ( nombre ),
        paquete:paquetes ( nombre )
      )
    `
    )
    .eq("salon_id", salonId)
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true });

  return (data ?? []).map((p) => {
    const cita = Array.isArray(p.cita) ? p.cita[0] : p.cita;
    const clienta = Array.isArray(cita?.clienta)
      ? cita.clienta[0]
      : cita?.clienta;
    const servicio = Array.isArray(cita?.servicio)
      ? cita.servicio[0]
      : cita?.servicio;
    const paquete = Array.isArray(cita?.paquete)
      ? cita.paquete[0]
      : cita?.paquete;

    return {
      id: p.id,
      monto: Number(p.monto),
      metodo: p.metodo as PagoMetodo,
      comprobante_url: p.comprobante_url,
      created_at: p.created_at,
      cita: {
        id: cita?.id ?? "",
        inicio: cita?.inicio ?? "",
        fin: cita?.fin ?? "",
        estado: cita?.estado ?? "",
        beneficiario_nombre: cita?.beneficiario_nombre ?? null,
        clienta: {
          nombre: clienta?.nombre ?? "Clienta",
          telefono: clienta?.telefono ?? null,
        },
        servicio: servicio ?? null,
        paquete: paquete ?? null,
      },
    };
  });
}

export async function getComprobanteSignedUrl(
  path: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("comprobantes")
    .createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}
