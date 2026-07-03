"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser, requireAuthUser } from "@/lib/auth/get-user";
import { getAgendaCitas } from "@/lib/agenda/queries";
import { fetchAvailabilitySlots } from "@/lib/availability/queries";
import { resolveSlotStepMinutes } from "@/lib/availability/salon-config";
import { salonLocalToUtc } from "@/lib/availability/timezone";
import { createClient } from "@/lib/supabase/server";
import { optionalPgUuidSchema, pgUuidSchema } from "@/lib/utils/validation";
import type { CitaEstado } from "@/types/database";

export type AgendaActionState = {
  error?: string;
  success?: boolean;
};

const horarioItemSchema = z.object({
  dia_semana: z.coerce.number().int().min(0).max(6),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  activo: z.coerce.boolean(),
});

const saveHorariosSchema = z.object({
  horarios: z.array(horarioItemSchema),
});

const excepcionSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  cerrado: z.coerce.boolean(),
  hora_inicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  hora_fin: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
});

const citaSchema = z
  .object({
    clienta_id: pgUuidSchema("Clienta inválida"),
    servicio_id: optionalPgUuidSchema("Servicio inválido"),
    paquete_id: optionalPgUuidSchema("Paquete inválido"),
    colaboradora_id: optionalPgUuidSchema("Colaboradora inválida"),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
    notas: z
      .string()
      .max(500)
      .optional()
      .transform((v) => (v?.trim() ? v.trim() : null)),
    estado: z
      .enum([
        "pendiente",
        "pendiente_validacion",
        "confirmada",
        "cancelada",
        "completada",
        "no_show",
      ])
      .optional(),
  })
  .refine(
    (data) =>
      (data.servicio_id && !data.paquete_id) ||
      (!data.servicio_id && data.paquete_id),
    { message: "Selecciona un servicio o un paquete" }
  );

async function getSalonTimezone(salonId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("salones")
    .select("timezone")
    .eq("id", salonId)
    .single();
  return data?.timezone ?? "America/Guatemala";
}

async function getDuracionMinutos(
  salonId: string,
  servicioId: string | null | undefined,
  paqueteId: string | null | undefined
): Promise<number | null> {
  const supabase = await createClient();

  if (servicioId) {
    const { data } = await supabase
      .from("servicios")
      .select("duracion_minutos")
      .eq("id", servicioId)
      .eq("salon_id", salonId)
      .single();
    return data?.duracion_minutos ?? null;
  }

  if (paqueteId) {
    const { data } = await supabase
      .from("paquetes")
      .select("duracion_minutos")
      .eq("id", paqueteId)
      .eq("salon_id", salonId)
      .single();
    return data?.duracion_minutos ?? null;
  }

  return null;
}

export async function saveHorariosAction(
  _prev: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const user = await requireAdminUser();

  const horariosJson = formData.get("horarios");
  if (!horariosJson || typeof horariosJson !== "string") {
    return { error: "Datos de horarios inválidos" };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(horariosJson);
  } catch {
    return { error: "Formato de horarios inválido" };
  }

  const parsed = saveHorariosSchema.safeParse({ horarios: parsedJson });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("horarios_salon")
    .delete()
    .eq("salon_id", user.salon_id);

  if (deleteError) {
    return { error: "No se pudieron actualizar los horarios" };
  }

  const activeHorarios = parsed.data.horarios
    .filter((h) => h.activo)
    .map(({ dia_semana, hora_inicio, hora_fin }) => ({
      salon_id: user.salon_id,
      dia_semana,
      hora_inicio,
      hora_fin,
    }));

  if (activeHorarios.length > 0) {
    const { error: insertError } = await supabase
      .from("horarios_salon")
      .insert(activeHorarios);

    if (insertError) {
      return { error: "No se pudieron guardar los horarios" };
    }
  }

  revalidatePath("/agenda");
  return { success: true };
}

export async function createExcepcionAction(
  _prev: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const user = await requireAdminUser();

  const parsed = excepcionSchema.safeParse({
    fecha: formData.get("fecha"),
    cerrado: formData.get("cerrado") === "true",
    hora_inicio: formData.get("hora_inicio") || null,
    hora_fin: formData.get("hora_fin") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (
    !parsed.data.cerrado &&
    (!parsed.data.hora_inicio || !parsed.data.hora_fin)
  ) {
    return { error: "Indica horario especial o marca como cerrado" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("excepciones_horario").upsert(
    {
      salon_id: user.salon_id,
      fecha: parsed.data.fecha,
      cerrado: parsed.data.cerrado,
      hora_inicio: parsed.data.cerrado ? null : parsed.data.hora_inicio,
      hora_fin: parsed.data.cerrado ? null : parsed.data.hora_fin,
    },
    { onConflict: "salon_id,fecha" }
  );

  if (error) {
    return { error: "No se pudo guardar la excepción" };
  }

  revalidatePath("/agenda");
  return { success: true };
}

export async function deleteExcepcionAction(
  id: string
): Promise<AgendaActionState> {
  const user = await requireAdminUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("excepciones_horario")
    .delete()
    .eq("id", id)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo eliminar la excepción" };
  }

  revalidatePath("/agenda");
  return { success: true };
}

export async function getAvailableSlotsAction(params: {
  fecha: string;
  duracionMinutos: number;
  colaboradoraId?: string;
  excludeCitaId?: string;
}): Promise<{ slots: { inicio: string; fin: string }[]; error?: string }> {
  const user = await requireAuthUser();
  const timezone = await getSalonTimezone(user.salon_id);

  try {
    const slots = await fetchAvailabilitySlots({
      salonId: user.salon_id,
      date: new Date(`${params.fecha}T12:00:00`),
      timezone,
      duracionMinutos: params.duracionMinutos,
      colaboradoraId: params.colaboradoraId,
      excludeCitaId: params.excludeCitaId,
      slotStepMinutes: resolveSlotStepMinutes(user.salon),
    });

    return {
      slots: slots.map((s) => ({
        inicio: s.inicio.toISOString(),
        fin: s.fin.toISOString(),
      })),
    };
  } catch {
    return { slots: [], error: "No se pudo calcular disponibilidad" };
  }
}

export async function createCitaAction(
  _prev: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const user = await requireAuthUser();

  const parsed = citaSchema.safeParse({
    clienta_id: formData.get("clienta_id"),
    servicio_id: formData.get("servicio_id") || null,
    paquete_id: formData.get("paquete_id") || null,
    colaboradora_id: formData.get("colaboradora_id") || null,
    fecha: formData.get("fecha"),
    hora_inicio: formData.get("hora_inicio"),
    notas: formData.get("notas") || undefined,
    estado: formData.get("estado") || "confirmada",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (
    user.rol === "colaboradora" &&
    parsed.data.colaboradora_id &&
    parsed.data.colaboradora_id !== user.id
  ) {
    return { error: "Solo puedes crear citas para ti" };
  }

  const colaboradoraId =
    user.rol === "colaboradora"
      ? user.id
      : parsed.data.colaboradora_id ?? null;

  const duracion = await getDuracionMinutos(
    user.salon_id,
    parsed.data.servicio_id,
    parsed.data.paquete_id
  );

  if (!duracion) {
    return { error: "Servicio o paquete no encontrado" };
  }

  const timezone = await getSalonTimezone(user.salon_id);
  const inicio = salonLocalToUtc(
    parsed.data.fecha,
    parsed.data.hora_inicio,
    timezone
  );
  const fin = new Date(inicio.getTime() + duracion * 60_000);

  const slots = await fetchAvailabilitySlots({
    salonId: user.salon_id,
    date: new Date(`${parsed.data.fecha}T12:00:00`),
    timezone,
    duracionMinutos: duracion,
    colaboradoraId: colaboradoraId ?? undefined,
  });

  const slotValid = slots.some(
    (s) => s.inicio.getTime() === inicio.getTime()
  );

  if (!slotValid) {
    return { error: "El horario seleccionado no está disponible" };
  }

  const creadaPor =
    user.rol === "admin_salon" ? "admin" : "colaboradora";

  const supabase = await createClient();
  const { error } = await supabase.from("citas").insert({
    salon_id: user.salon_id,
    clienta_id: parsed.data.clienta_id,
    servicio_id: parsed.data.servicio_id ?? null,
    paquete_id: parsed.data.paquete_id ?? null,
    colaboradora_id: colaboradoraId,
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    estado: (parsed.data.estado ?? "confirmada") as CitaEstado,
    notas: parsed.data.notas ?? null,
    creada_por: creadaPor,
  });

  if (error) {
    return { error: "No se pudo crear la cita" };
  }

  revalidatePath("/agenda");
  return { success: true };
}

export async function rescheduleCitaAction(
  _prev: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const user = await requireAuthUser();
  const citaId = formData.get("cita_id");

  if (!citaId || typeof citaId !== "string") {
    return { error: "Cita no encontrada" };
  }

  const parsed = citaSchema.safeParse({
    clienta_id: formData.get("clienta_id"),
    servicio_id: formData.get("servicio_id") || null,
    paquete_id: formData.get("paquete_id") || null,
    colaboradora_id: formData.get("colaboradora_id") || null,
    fecha: formData.get("fecha"),
    hora_inicio: formData.get("hora_inicio"),
    notas: formData.get("notas") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("citas")
    .select("id, estado, colaboradora_id")
    .eq("id", citaId)
    .eq("salon_id", user.salon_id)
    .single();

  if (!existing) {
    return { error: "Cita no encontrada" };
  }

  if (["cancelada", "completada", "no_show"].includes(existing.estado)) {
    return { error: "No se puede reagendar esta cita" };
  }

  if (
    user.rol === "colaboradora" &&
    existing.colaboradora_id !== user.id
  ) {
    return { error: "No tienes permiso para reagendar esta cita" };
  }

  const colaboradoraId =
    user.rol === "colaboradora"
      ? user.id
      : parsed.data.colaboradora_id ?? existing.colaboradora_id;

  const duracion = await getDuracionMinutos(
    user.salon_id,
    parsed.data.servicio_id,
    parsed.data.paquete_id
  );

  if (!duracion) {
    return { error: "Servicio o paquete no encontrado" };
  }

  const timezone = await getSalonTimezone(user.salon_id);
  const inicio = salonLocalToUtc(
    parsed.data.fecha,
    parsed.data.hora_inicio,
    timezone
  );
  const fin = new Date(inicio.getTime() + duracion * 60_000);

  const slots = await fetchAvailabilitySlots({
    salonId: user.salon_id,
    date: new Date(`${parsed.data.fecha}T12:00:00`),
    timezone,
    duracionMinutos: duracion,
    colaboradoraId: colaboradoraId ?? undefined,
    excludeCitaId: citaId,
  });

  const slotValid = slots.some(
    (s) => s.inicio.getTime() === inicio.getTime()
  );

  if (!slotValid) {
    return { error: "El nuevo horario no está disponible" };
  }

  const { error } = await supabase
    .from("citas")
    .update({
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      colaboradora_id: colaboradoraId,
      notas: parsed.data.notas ?? null,
    })
    .eq("id", citaId)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo reagendar la cita" };
  }

  revalidatePath("/agenda");
  return { success: true };
}

export async function cancelCitaAction(citaId: string): Promise<AgendaActionState> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("citas")
    .select("id, estado, colaboradora_id")
    .eq("id", citaId)
    .eq("salon_id", user.salon_id)
    .single();

  if (!existing) {
    return { error: "Cita no encontrada" };
  }

  if (["cancelada", "completada"].includes(existing.estado)) {
    return { error: "Esta cita ya no se puede cancelar" };
  }

  if (
    user.rol === "colaboradora" &&
    existing.colaboradora_id !== user.id
  ) {
    return { error: "No tienes permiso para cancelar esta cita" };
  }

  const { error } = await supabase
    .from("citas")
    .update({ estado: "cancelada" })
    .eq("id", citaId)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo cancelar la cita" };
  }

  await supabase
    .from("pagos")
    .update({
      estado: "rechazado",
      validado_por: user.id,
      validado_at: new Date().toISOString(),
    })
    .eq("cita_id", citaId)
    .eq("salon_id", user.salon_id)
    .eq("estado", "pendiente");

  revalidatePath("/agenda");
  revalidatePath("/pagos");
  return { success: true };
}

export async function updateCitaEstadoAction(
  citaId: string,
  estado: CitaEstado
): Promise<AgendaActionState> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const allowed: CitaEstado[] = [
    "pendiente",
    "confirmada",
    "completada",
    "no_show",
  ];

  if (!allowed.includes(estado)) {
    return { error: "Estado no permitido" };
  }

  const { data: existing } = await supabase
    .from("citas")
    .select("colaboradora_id")
    .eq("id", citaId)
    .eq("salon_id", user.salon_id)
    .single();

  if (!existing) {
    return { error: "Cita no encontrada" };
  }

  if (
    user.rol === "colaboradora" &&
    existing.colaboradora_id !== user.id
  ) {
    return { error: "No tienes permiso para actualizar esta cita" };
  }

  const { error } = await supabase
    .from("citas")
    .update({ estado })
    .eq("id", citaId)
    .eq("salon_id", user.salon_id);

  if (error) {
    return { error: "No se pudo actualizar el estado" };
  }

  revalidatePath("/agenda");
  return { success: true };
}

export async function fetchAgendaCitasAction(params: {
  dateKey: string;
  view: "day" | "week";
}): Promise<{ citas?: Awaited<ReturnType<typeof getAgendaCitas>>; error?: string }> {
  const user = await requireAuthUser();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.dateKey)) {
    return { error: "Fecha inválida" };
  }

  const view = params.view === "week" ? "week" : "day";
  const timezone = user.salon.timezone ?? "America/Guatemala";

  try {
    const citas = await getAgendaCitas(
      user.salon_id,
      params.dateKey,
      view,
      timezone
    );
    return { citas };
  } catch {
    return { error: "No se pudieron cargar las citas" };
  }
}
