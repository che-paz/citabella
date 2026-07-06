"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export type PagoActionState = {
  error?: string;
  success?: boolean;
};

export async function validarPagoAction(
  pagoId: string
): Promise<PagoActionState> {
  const user = await requireAdminUser();
  const supabase = await createClient();

  const { data: pago } = await supabase
    .from("pagos")
    .select("id, cita_id, estado")
    .eq("id", pagoId)
    .eq("salon_id", user.salon_id)
    .single();

  if (!pago) {
    return { error: "Pago no encontrado" };
  }

  if (pago.estado !== "pendiente") {
    return { error: "Este pago ya fue procesado" };
  }

  const { error: pagoError } = await supabase
    .from("pagos")
    .update({
      estado: "asegurado",
      asegurado_at: new Date().toISOString(),
      validado_por: user.id,
    })
    .eq("id", pagoId)
    .eq("salon_id", user.salon_id);

  if (pagoError) {
    return { error: "No se pudo confirmar el pago" };
  }

  const { error: citaError } = await supabase
    .from("citas")
    .update({ estado: "confirmada" })
    .eq("id", pago.cita_id)
    .eq("salon_id", user.salon_id);

  if (citaError) {
    return { error: "Pago confirmado pero no se pudo confirmar la cita" };
  }

  revalidatePath("/pagos");
  revalidatePath("/agenda");
  return { success: true };
}

export async function rechazarPagoAction(
  pagoId: string
): Promise<PagoActionState> {
  const user = await requireAdminUser();
  const supabase = await createClient();

  const { data: pago } = await supabase
    .from("pagos")
    .select("id, cita_id, estado")
    .eq("id", pagoId)
    .eq("salon_id", user.salon_id)
    .single();

  if (!pago) {
    return { error: "Pago no encontrado" };
  }

  if (pago.estado !== "pendiente") {
    return { error: "Este pago ya fue procesado" };
  }

  const { error: pagoError } = await supabase
    .from("pagos")
    .update({
      estado: "rechazado",
      validado_por: user.id,
      validado_at: new Date().toISOString(),
    })
    .eq("id", pagoId)
    .eq("salon_id", user.salon_id);

  if (pagoError) {
    return { error: "No se pudo rechazar el pago" };
  }

  const { error: citaError } = await supabase
    .from("citas")
    .update({ estado: "cancelada" })
    .eq("id", pago.cita_id)
    .eq("salon_id", user.salon_id);

  if (citaError) {
    return { error: "Pago rechazado pero no se pudo cancelar la cita" };
  }

  revalidatePath("/pagos");
  revalidatePath("/agenda");
  return { success: true };
}
