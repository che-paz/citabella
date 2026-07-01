"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

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
    .transform((v) => v.trim()),
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

async function checkTelefonoDuplicado(
  salonId: string,
  telefono: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from("clientas")
    .select("id")
    .eq("salon_id", salonId)
    .eq("telefono", telefono);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.limit(1);
  return (data?.length ?? 0) > 0;
}

export async function createClientaAction(
  _prev: ClientaActionState,
  formData: FormData
): Promise<ClientaActionState> {
  const user = await requireAdminUser();
  const parsed = parseClientaForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const duplicado = await checkTelefonoDuplicado(
    user.salon_id,
    parsed.data.telefono
  );

  if (duplicado) {
    return { error: "Ya existe una clienta con ese teléfono" };
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

  const duplicado = await checkTelefonoDuplicado(
    user.salon_id,
    parsed.data.telefono,
    id
  );

  if (duplicado) {
    return { error: "Ya existe otra clienta con ese teléfono" };
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
