"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { bloqueoCitaConflictMessage } from "@/lib/agenda/bloqueo-message";
import { requireAuthUser } from "@/lib/auth/get-user";
import { BLOCKING_CITA_ESTADOS } from "@/lib/availability/slots";
import { salonLocalToUtc } from "@/lib/availability/timezone";
import { createClient } from "@/lib/supabase/server";
import { parseEventReminderField } from "@/lib/reminders/window";
import { optionalPgUuidSchema, pgUuidSchema } from "@/lib/utils/validation";
import type { AgendaActionState } from "@/lib/agenda/actions";

const eventoSchema = z.object({
  id: optionalPgUuidSchema(),
  titulo: z
    .string()
    .trim()
    .min(1, "Escribe un título")
    .max(120, "El título es muy largo"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  notas: z.string().trim().max(2000).optional(),
  colaboradora_id: optionalPgUuidSchema(),
});

function formString(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" ? value : null;
}

function conflictFromDb(
  message: string | undefined,
  timezone: string
): string | null {
  const fromTrigger = bloqueoCitaConflictMessage(message, timezone);
  if (fromTrigger) return fromTrigger;
  if (message?.includes("BLOQUEO_SALON")) {
    return "Esa colaboradora no pertenece al salón.";
  }
  return null;
}

async function findCitaConflictMessage(params: {
  salonId: string;
  inicio: Date;
  fin: Date;
  colaboradoraId: string | null;
  timezone: string;
}): Promise<{ error: string } | { clear: true }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("citas")
    .select("inicio, fin, colaboradora_id, estado, clienta:clientas ( nombre )")
    .eq("salon_id", params.salonId)
    .in("estado", [...BLOCKING_CITA_ESTADOS])
    .lt("inicio", params.fin.toISOString())
    .gt("fin", params.inicio.toISOString())
    .order("inicio");

  if (error) {
    console.error("[agenda] cita conflict lookup failed", error.message);
    return { error: "No se pudo verificar si hay una cita en ese horario." };
  }

  const hit = (data ?? []).find((cita) => {
    if (!params.colaboradoraId) return true;
    return (
      cita.colaboradora_id === null ||
      cita.colaboradora_id === params.colaboradoraId
    );
  });

  if (!hit) return { clear: true };

  const clienta = Array.isArray(hit.clienta) ? hit.clienta[0] : hit.clienta;
  const nombre =
    (clienta as { nombre?: string } | null)?.nombre?.trim() || "una clienta";
  const inicio = new Date(hit.inicio);
  const fin = new Date(hit.fin);
  return {
    error: bloqueoCitaConflictMessage(
      `BLOQUEO_CITA: ${nombre}|${inicio.toISOString()}|${fin.toISOString()}`,
      params.timezone
    )!,
  };
}

export async function saveEventoPersonalAction(
  _prev: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const user = await requireAuthUser();
  const parsed = eventoSchema.safeParse({
    id: formData.get("id") || null,
    titulo: formData.get("titulo"),
    fecha: formData.get("fecha"),
    hora_inicio: formData.get("hora_inicio"),
    hora_fin: formData.get("hora_fin"),
    notas: formData.get("notas") || "",
    colaboradora_id: formData.get("colaboradora_id") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const reminder = parseEventReminderField(
    formString(formData.get("recordatorio_minutos")),
    parsed.data.id ? "edit" : "create"
  );
  if (reminder === "invalid") {
    return { error: "Elige un recordatorio válido" };
  }

  const timezone = user.salon.timezone ?? "America/Guatemala";
  const inicio = salonLocalToUtc(
    parsed.data.fecha,
    parsed.data.hora_inicio,
    timezone
  );
  const fin = salonLocalToUtc(
    parsed.data.fecha,
    parsed.data.hora_fin,
    timezone
  );

  if (!(fin > inicio)) {
    return { error: "La hora de fin tiene que ser después de la de inicio." };
  }

  const colaboradoraId =
    user.rol === "admin_salon" ? parsed.data.colaboradora_id ?? null : user.id;

  const conflict = await findCitaConflictMessage({
    salonId: user.salon_id,
    inicio,
    fin,
    colaboradoraId,
    timezone,
  });
  if ("error" in conflict) return { error: conflict.error };

  const supabase = await createClient();
  const payload: {
    titulo: string;
    notas: string | null;
    inicio: string;
    fin: string;
    colaboradora_id: string | null;
    recordatorio_minutos: number | null;
    recordatorio_enviado_at?: null;
  } = {
    titulo: parsed.data.titulo,
    notas: parsed.data.notas ? parsed.data.notas : null,
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    colaboradora_id: colaboradoraId,
    recordatorio_minutos: reminder,
  };

  const eventoId = parsed.data.id;
  if (eventoId) {
    const { data: existing, error: readError } = await supabase
      .from("bloqueos_agenda")
      .select("inicio, recordatorio_minutos")
      .eq("id", eventoId)
      .eq("salon_id", user.salon_id)
      .maybeSingle();

    if (readError || !existing) {
      return { error: "No se encontró el evento personal" };
    }

    const inicioChanged =
      new Date(existing.inicio as string).getTime() !== inicio.getTime();
    const minutosChanged =
      ((existing.recordatorio_minutos as number | null) ?? null) !== reminder;
    if (inicioChanged || minutosChanged) {
      payload.recordatorio_enviado_at = null;
    }
  }

  const { error } = eventoId
    ? await supabase
        .from("bloqueos_agenda")
        .update(payload)
        .eq("id", eventoId)
        .eq("salon_id", user.salon_id)
    : await supabase.from("bloqueos_agenda").insert({
        ...payload,
        salon_id: user.salon_id,
        creado_por: user.id,
      });

  if (error) {
    const friendly = conflictFromDb(error.message, timezone);
    if (friendly) return { error: friendly };
    console.error("[agenda] save evento failed", error.message);
    return { error: "No se pudo guardar el evento personal" };
  }

  revalidatePath("/agenda");
  return { success: true };
}

export async function deleteEventoPersonalAction(
  eventoId: string
): Promise<AgendaActionState> {
  const user = await requireAuthUser();
  const parsedId = pgUuidSchema().safeParse(eventoId);
  if (!parsedId.success) return { error: "Evento inválido" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("bloqueos_agenda")
    .delete()
    .eq("id", parsedId.data)
    .eq("salon_id", user.salon_id);

  if (error) {
    console.error("[agenda] delete evento failed", error.message);
    return { error: "No se pudo borrar el evento personal" };
  }

  revalidatePath("/agenda");
  return { success: true };
}
