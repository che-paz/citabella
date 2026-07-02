"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { GASTO_CATEGORIAS } from "@/types/database";

const categoriaValues = GASTO_CATEGORIAS.map((c) => c.value) as [
  (typeof GASTO_CATEGORIAS)[number]["value"],
  ...(typeof GASTO_CATEGORIAS)[number]["value"][],
];

export type FinanzasActionState = {
  error?: string;
  success?: boolean;
};

const gastoSchema = z.object({
  categoria: z.enum(categoriaValues, { message: "Categoría inválida" }),
  monto: z.coerce
    .number({ message: "Monto inválido" })
    .positive("El monto debe ser mayor a 0"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  descripcion: z
    .string()
    .max(300)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
});

export async function createGastoAction(
  _prev: FinanzasActionState,
  formData: FormData
): Promise<FinanzasActionState> {
  const user = await requireAdminUser();
  const parsed = gastoSchema.safeParse({
    categoria: formData.get("categoria"),
    monto: formData.get("monto"),
    fecha: formData.get("fecha"),
    descripcion: formData.get("descripcion") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("movimientos_contables").insert({
    salon_id: user.salon_id,
    tipo: "egreso",
    categoria: parsed.data.categoria,
    monto: parsed.data.monto,
    fecha: parsed.data.fecha,
    descripcion: parsed.data.descripcion,
  });

  if (error) {
    return { error: "No se pudo registrar el gasto" };
  }

  revalidatePath("/finanzas");
  revalidatePath("/");
  return { success: true };
}

export async function deleteGastoAction(id: string): Promise<FinanzasActionState> {
  const user = await requireAdminUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("movimientos_contables")
    .delete()
    .eq("id", id)
    .eq("salon_id", user.salon_id)
    .eq("tipo", "egreso");

  if (error) {
    return { error: "No se pudo eliminar el gasto" };
  }

  revalidatePath("/finanzas");
  revalidatePath("/");
  return { success: true };
}
