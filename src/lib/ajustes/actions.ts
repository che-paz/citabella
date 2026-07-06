"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser, requireAuthUser } from "@/lib/auth/get-user";
import { removeSalonLogo, uploadSalonLogo } from "@/lib/storage/logos";
import { createClient } from "@/lib/supabase/server";

export type AjustesActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

const perfilSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(100),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72),
    confirmacion: z.string(),
  })
  .refine((data) => data.password === data.confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacion"],
  });

const salonSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(100),
  politica_reembolso: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => v?.trim() ?? ""),
  slot_step_minutes: z.coerce
    .number()
    .refine((v) => [15, 30, 60].includes(v), "Intervalo inválido"),
});

export async function updatePerfilAction(
  _prev: AjustesActionState,
  formData: FormData
): Promise<AjustesActionState> {
  const user = await requireAuthUser();
  const parsed = perfilSchema.safeParse({ nombre: formData.get("nombre") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("usuarios")
    .update({ nombre: parsed.data.nombre })
    .eq("id", user.id)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo actualizar tu perfil" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/ajustes");
  return { success: true, message: "Perfil actualizado" };
}

export async function updatePasswordAction(
  _prev: AjustesActionState,
  formData: FormData
): Promise<AjustesActionState> {
  await requireAuthUser();

  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmacion: formData.get("confirmacion"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "No se pudo cambiar la contraseña" };
  }

  return { success: true, message: "Contraseña actualizada" };
}

export async function updateSalonAction(
  _prev: AjustesActionState,
  formData: FormData
): Promise<AjustesActionState> {
  const user = await requireAdminUser();
  const parsed = salonSchema.safeParse({
    nombre: formData.get("nombre"),
    politica_reembolso: formData.get("politica_reembolso") ?? "",
    slot_step_minutes: formData.get("slot_step_minutes") ?? "60",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("salones")
    .update({
      nombre: parsed.data.nombre,
      politica_reembolso: parsed.data.politica_reembolso,
      slot_step_minutes: parsed.data.slot_step_minutes,
    })
    .eq("id", user.salon_id);

  if (error) {
    return { error: "No se pudo actualizar el salón" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/ajustes");
  revalidatePath("/agenda");
  revalidatePath(`/reservar/${user.salon.slug}`);
  return { success: true, message: "Salón actualizado" };
}

export async function uploadSalonLogoAction(
  _prev: AjustesActionState,
  formData: FormData
): Promise<AjustesActionState> {
  const user = await requireAdminUser();
  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen para el logo" };
  }

  const upload = await uploadSalonLogo({ salonId: user.salon_id, file });
  if (upload.error || !upload.path) {
    return { error: upload.error ?? "No se pudo subir el logo" };
  }

  const supabase = await createClient();

  if (user.salon.logo_url && user.salon.logo_url !== upload.path) {
    await removeSalonLogo(user.salon.logo_url);
  }

  const { error } = await supabase
    .from("salones")
    .update({ logo_url: upload.path })
    .eq("id", user.salon_id);

  if (error) {
    return { error: "No se pudo guardar el logo" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/ajustes");
  revalidatePath(`/reservar/${user.salon.slug}`);
  return { success: true, message: "Logo actualizado" };
}

export async function removeSalonLogoAction(): Promise<AjustesActionState> {
  const user = await requireAdminUser();

  if (!user.salon.logo_url) {
    return { success: true, message: "Sin logo que eliminar" };
  }

  await removeSalonLogo(user.salon.logo_url);

  const supabase = await createClient();
  const { error } = await supabase
    .from("salones")
    .update({ logo_url: null })
    .eq("id", user.salon_id);

  if (error) {
    return { error: "No se pudo quitar el logo" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/ajustes");
  revalidatePath(`/reservar/${user.salon.slug}`);
  return { success: true, message: "Logo eliminado" };
}
