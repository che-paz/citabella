"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/utils/phone";

export type ClientaActionState = {
  error?: string;
  success?: boolean;
};

const clientaSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(100),
  telefono: z
    .string()
    .min(8, "Teléfono inválido")
    .max(20)
    .transform((v) => v.trim())
    .refine((v) => normalizePhone(v) !== null, {
      message:
        "Teléfono inválido. Usa 8 dígitos de Guatemala, Honduras o El Salvador.",
    })
    .transform((v) => normalizePhone(v)!),
  email: z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : v),
      z.string().email("Email inválido").nullable()
    ),
  notas: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
});

function parseClientaForm(formData: FormData) {
  return clientaSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email") || "",
    notas: formData.get("notas") || undefined,
  });
}

/** Same WhatsApp may belong to several fichas (e.g. mamá + hijos). */
export async function createClientaAction(
  _prev: ClientaActionState,
  formData: FormData
): Promise<ClientaActionState> {
  const user = await requireAdminUser();
  const parsed = parseClientaForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clientas").insert({
    salon_id: user.salon_id,
    nombre: parsed.data.nombre,
    telefono: parsed.data.telefono,
    email: parsed.data.email,
    notas: parsed.data.notas,
  });

  if (error) {
    return { error: "No se pudo crear la clienta" };
  }

  revalidatePath("/clientas");
  return { success: true };
}

export async function updateClientaAction(
  _prev: ClientaActionState,
  formData: FormData
): Promise<ClientaActionState> {
  const user = await requireAdminUser();
  const id = formData.get("id");

  if (!id || typeof id !== "string") {
    return { error: "Clienta no encontrada" };
  }

  const parsed = parseClientaForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientas")
    .update({
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email,
      notas: parsed.data.notas,
    })
    .eq("id", id)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo actualizar la clienta" };
  }

  revalidatePath("/clientas");
  revalidatePath(`/clientas/${id}`);
  return { success: true };
}

/**
 * Single entry for the dialog form. Branches on `id` so create/edit
 * never mix when useFormState keeps a stale action binding.
 */
export async function saveClientaAction(
  prev: ClientaActionState,
  formData: FormData
): Promise<ClientaActionState> {
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    return updateClientaAction(prev, formData);
  }
  return createClientaAction(prev, formData);
}
