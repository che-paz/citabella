"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { pgUuidSchema } from "@/lib/utils/validation";
import { SERVICE_CATEGORIES, type ServiceCategory } from "@/types/database";

const categoryValues = SERVICE_CATEGORIES.map((c) => c.value) as [
  ServiceCategory,
  ...ServiceCategory[],
];

const servicioSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  categoria: z.enum(categoryValues, { message: "Categoría inválida" }),
  precio: z.coerce
    .number({ message: "Precio inválido" })
    .positive("El precio debe ser mayor a 0"),
  duracion_minutos: z.coerce
    .number({ message: "Duración inválida" })
    .int("La duración debe ser un número entero")
    .min(5, "Mínimo 5 minutos")
    .max(480, "Máximo 480 minutos"),
  descripcion: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
});

const paqueteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  precio: z.coerce
    .number({ message: "Precio inválido" })
    .positive("El precio debe ser mayor a 0"),
  duracion_minutos: z.coerce
    .number({ message: "Duración inválida" })
    .int("La duración debe ser un número entero")
    .min(5, "Mínimo 5 minutos")
    .max(960, "Máximo 960 minutos"),
  servicio_ids: z
    .array(pgUuidSchema("Servicio inválido"))
    .min(1, "Selecciona al menos un servicio"),
});

export type CatalogoActionState = {
  error?: string;
  success?: boolean;
};

function parseServicioForm(formData: FormData) {
  return servicioSchema.safeParse({
    nombre: formData.get("nombre"),
    categoria: formData.get("categoria"),
    precio: formData.get("precio"),
    duracion_minutos: formData.get("duracion_minutos"),
    descripcion: formData.get("descripcion") || undefined,
  });
}

function parsePaqueteForm(formData: FormData) {
  return paqueteSchema.safeParse({
    nombre: formData.get("nombre"),
    precio: formData.get("precio"),
    duracion_minutos: formData.get("duracion_minutos"),
    servicio_ids: formData.getAll("servicio_ids"),
  });
}

export async function createServicioAction(
  _prevState: CatalogoActionState,
  formData: FormData
): Promise<CatalogoActionState> {
  const user = await requireAdminUser();
  const parsed = parseServicioForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("servicios").insert({
    salon_id: user.salon_id,
    ...parsed.data,
  });

  if (error) {
    return { error: "No se pudo crear el servicio" };
  }

  revalidatePath("/catalogo");
  return { success: true };
}

export async function updateServicioAction(
  _prevState: CatalogoActionState,
  formData: FormData
): Promise<CatalogoActionState> {
  const user = await requireAdminUser();
  const id = formData.get("id");

  if (!id || typeof id !== "string") {
    return { error: "Servicio no encontrado" };
  }

  const parsed = parseServicioForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("servicios")
    .update(parsed.data)
    .eq("id", id)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo actualizar el servicio" };
  }

  revalidatePath("/catalogo");
  return { success: true };
}

export async function deactivateServicioAction(
  id: string
): Promise<CatalogoActionState> {
  const user = await requireAdminUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("servicios")
    .update({ activo: false })
    .eq("id", id)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo desactivar el servicio" };
  }

  revalidatePath("/catalogo");
  return { success: true };
}

export async function reactivateServicioAction(
  id: string
): Promise<CatalogoActionState> {
  const user = await requireAdminUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("servicios")
    .update({ activo: true })
    .eq("id", id)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo reactivar el servicio" };
  }

  revalidatePath("/catalogo");
  return { success: true };
}

export async function createPaqueteAction(
  _prevState: CatalogoActionState,
  formData: FormData
): Promise<CatalogoActionState> {
  const user = await requireAdminUser();
  const parsed = parsePaqueteForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data: paquete, error: paqueteError } = await supabase
    .from("paquetes")
    .insert({
      salon_id: user.salon_id,
      nombre: parsed.data.nombre,
      precio: parsed.data.precio,
      duracion_minutos: parsed.data.duracion_minutos,
    })
    .select("id")
    .single();

  if (paqueteError || !paquete) {
    return { error: "No se pudo crear el paquete" };
  }

  const junctionRows = parsed.data.servicio_ids.map((servicio_id, index) => ({
    paquete_id: paquete.id,
    servicio_id,
    orden: index + 1,
  }));

  const { error: junctionError } = await supabase
    .from("paquete_servicios")
    .insert(junctionRows);

  if (junctionError) {
    return { error: "No se pudieron asociar los servicios al paquete" };
  }

  revalidatePath("/catalogo");
  return { success: true };
}

export async function updatePaqueteAction(
  _prevState: CatalogoActionState,
  formData: FormData
): Promise<CatalogoActionState> {
  const user = await requireAdminUser();
  const id = formData.get("id");

  if (!id || typeof id !== "string") {
    return { error: "Paquete no encontrado" };
  }

  const parsed = parsePaqueteForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  const { error: paqueteError } = await supabase
    .from("paquetes")
    .update({
      nombre: parsed.data.nombre,
      precio: parsed.data.precio,
      duracion_minutos: parsed.data.duracion_minutos,
    })
    .eq("id", id)
    .eq("salon_id", user.salon_id);

  if (paqueteError) {
    return { error: "No se pudo actualizar el paquete" };
  }

  const { error: deleteError } = await supabase
    .from("paquete_servicios")
    .delete()
    .eq("paquete_id", id);

  if (deleteError) {
    return { error: "No se pudieron actualizar los servicios del paquete" };
  }

  const junctionRows = parsed.data.servicio_ids.map((servicio_id, index) => ({
    paquete_id: id,
    servicio_id,
    orden: index + 1,
  }));

  const { error: junctionError } = await supabase
    .from("paquete_servicios")
    .insert(junctionRows);

  if (junctionError) {
    return { error: "No se pudieron asociar los servicios al paquete" };
  }

  revalidatePath("/catalogo");
  return { success: true };
}

export async function deactivatePaqueteAction(
  id: string
): Promise<CatalogoActionState> {
  const user = await requireAdminUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("paquetes")
    .update({ activo: false })
    .eq("id", id)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo desactivar el paquete" };
  }

  revalidatePath("/catalogo");
  return { success: true };
}

export async function reactivatePaqueteAction(
  id: string
): Promise<CatalogoActionState> {
  const user = await requireAdminUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("paquetes")
    .update({ activo: true })
    .eq("id", id)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo reactivar el paquete" };
  }

  revalidatePath("/catalogo");
  return { success: true };
}
