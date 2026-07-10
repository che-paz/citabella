"use server";

import { z } from "zod";
import { fetchAvailabilitySlots } from "@/lib/availability/queries";
import { resolvePausaDiariaFromSalon } from "@/lib/availability/pausa";
import { resolveSlotStepMinutes } from "@/lib/availability/salon-config";
import { getSalonDateKey } from "@/lib/availability/timezone";
import { getSalonBySlug } from "@/lib/reservar/queries";
import {
  deleteComprobante,
  uploadComprobante,
} from "@/lib/storage/comprobantes";
import { createAnonymousClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { optionalPgUuidSchema } from "@/lib/utils/validation";
import { normalizePhone } from "@/lib/utils/phone";
import { notifySalonNewReservation } from "@/lib/push/notify";

export type ReservarActionState = {
  error?: string;
  citaId?: string;
};

const reservaSchema = z
  .object({
    slug: z.string().min(1, "Salón no encontrado"),
    servicio_id: optionalPgUuidSchema("Servicio inválido"),
    paquete_id: optionalPgUuidSchema("Paquete inválido"),
    slot_inicio: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), "Horario inválido"),
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
    metodo: z.enum(["transferencia", "efectivo", "fri"], {
      message: "Método de pago inválido",
    }),
    para_otra_persona: z.coerce.boolean().optional().default(false),
    beneficiario_nombre: z
      .string()
      .max(100)
      .optional()
      .transform((v) => (v?.trim() ? v.trim() : null)),
  })
  .refine(
    (data) =>
      (data.servicio_id && !data.paquete_id) ||
      (!data.servicio_id && data.paquete_id),
    { message: "Selecciona un servicio o paquete" }
  )
  .refine(
    (data) =>
      !data.para_otra_persona ||
      (data.beneficiario_nombre && data.beneficiario_nombre.length >= 2),
    { message: "Indica el nombre de quien asiste a la cita" }
  );

async function getItemDetails(
  salonId: string,
  servicioId: string | null | undefined,
  paqueteId: string | null | undefined
): Promise<{ duracion: number; precio: number; nombre: string } | null> {
  const supabase = await createClient();

  if (servicioId) {
    const { data } = await supabase
      .from("servicios")
      .select("duracion_minutos, precio, nombre")
      .eq("id", servicioId)
      .eq("salon_id", salonId)
      .eq("activo", true)
      .single();
    if (!data) return null;
    return {
      duracion: data.duracion_minutos,
      precio: Number(data.precio),
      nombre: data.nombre,
    };
  }

  if (paqueteId) {
    const { data } = await supabase
      .from("paquetes")
      .select("duracion_minutos, precio, nombre")
      .eq("id", paqueteId)
      .eq("salon_id", salonId)
      .eq("activo", true)
      .single();
    if (!data) return null;
    return {
      duracion: data.duracion_minutos,
      precio: Number(data.precio),
      nombre: data.nombre,
    };
  }

  return null;
}

export async function getPublicSlotsAction(params: {
  slug: string;
  fecha: string;
  servicioId?: string;
  paqueteId?: string;
}): Promise<{ slots: { inicio: string; fin: string }[]; error?: string }> {
  const salon = await getSalonBySlug(params.slug);
  if (!salon) {
    return { slots: [], error: "Salón no encontrado" };
  }

  const item = await getItemDetails(
    salon.id,
    params.servicioId,
    params.paqueteId
  );

  if (!item) {
    return { slots: [], error: "Servicio o paquete no encontrado" };
  }

  try {
    const slots = await fetchAvailabilitySlots({
      salonId: salon.id,
      date: new Date(`${params.fecha}T12:00:00`),
      timezone: salon.timezone,
      duracionMinutos: item.duracion,
      slotStepMinutes: resolveSlotStepMinutes(salon),
      pausaDiaria: resolvePausaDiariaFromSalon(salon),
    });

    const dateKey = params.fecha;
    const isToday = dateKey === getSalonDateKey(new Date(), salon.timezone);
    const now = Date.now();

    const available = isToday
      ? slots.filter((s) => s.inicio.getTime() > now)
      : slots;

    return {
      slots: available.map((s) => ({
        inicio: s.inicio.toISOString(),
        fin: s.fin.toISOString(),
      })),
    };
  } catch {
    return { slots: [], error: "No se pudo calcular disponibilidad" };
  }
}

export async function createReservaAction(
  _prev: ReservarActionState,
  formData: FormData
): Promise<ReservarActionState> {
  const comprobante = formData.get("comprobante");

  const parsed = reservaSchema.safeParse({
    slug: formData.get("slug"),
    servicio_id: formData.get("servicio_id") || null,
    paquete_id: formData.get("paquete_id") || null,
    slot_inicio: formData.get("slot_inicio"),
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    metodo: formData.get("metodo"),
    para_otra_persona:
      formData.get("para_otra_persona") === "true" ||
      formData.get("para_otra_persona") === "on",
    beneficiario_nombre: formData.get("beneficiario_nombre") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const needsComprobante =
    parsed.data.metodo === "transferencia" || parsed.data.metodo === "fri";

  if (needsComprobante) {
    if (!(comprobante instanceof File) || comprobante.size === 0) {
      return { error: "Sube el comprobante de pago" };
    }
  }

  const salon = await getSalonBySlug(parsed.data.slug);
  if (!salon) {
    return { error: "Salón no encontrado" };
  }

  const paraOtraPersona =
    Boolean(salon.permite_reserva_otra_persona) &&
    Boolean(parsed.data.para_otra_persona);

  const beneficiarioNombre = paraOtraPersona
    ? parsed.data.beneficiario_nombre
    : null;

  if (paraOtraPersona && !beneficiarioNombre) {
    return { error: "Indica el nombre de quien asiste a la cita" };
  }

  const item = await getItemDetails(
    salon.id,
    parsed.data.servicio_id,
    parsed.data.paquete_id
  );

  if (!item) {
    return { error: "Servicio o paquete no disponible" };
  }

  const inicio = new Date(parsed.data.slot_inicio);
  if (Number.isNaN(inicio.getTime())) {
    return { error: "Horario inválido" };
  }

  const fecha = getSalonDateKey(inicio, salon.timezone);
  const fin = new Date(inicio.getTime() + item.duracion * 60_000);

  const slots = await fetchAvailabilitySlots({
    salonId: salon.id,
    date: new Date(`${fecha}T12:00:00`),
    timezone: salon.timezone,
    duracionMinutos: item.duracion,
    slotStepMinutes: resolveSlotStepMinutes(salon),
    pausaDiaria: resolvePausaDiariaFromSalon(salon),
  });

  const now = Date.now();
  const isToday = fecha === getSalonDateKey(new Date(), salon.timezone);

  const slotValid = slots.some((s) => {
    if (s.inicio.getTime() !== inicio.getTime()) return false;
    if (isToday && s.inicio.getTime() <= now) return false;
    return true;
  });

  if (!slotValid) {
    return { error: "El horario seleccionado ya no está disponible" };
  }

  // Evitar duplicar si ya existe reserva pendiente en ese slot (retry tras fallo de upload)
  // Cliente anónimo: RLS de reserva pública aplica solo a rol anon
  const supabase = createAnonymousClient();
  const { data: existingCita } = await supabase
    .from("citas")
    .select("id, pagos(id, comprobante_url)")
    .eq("salon_id", salon.id)
    .eq("inicio", inicio.toISOString())
    .eq("creada_por", "clienta")
    .eq("estado", "pendiente_validacion")
    .maybeSingle();

  if (existingCita) {
    const pagos = existingCita.pagos as Array<{
      id: string;
      comprobante_url: string | null;
    }> | null;
    const pago = pagos?.[0];

    if (needsComprobante && comprobante instanceof File && comprobante.size > 0) {
      const upload = await uploadComprobante({
        salonId: salon.id,
        citaId: existingCita.id,
        file: comprobante,
      });

      if (upload.error) {
        return { error: upload.error };
      }

      if (pago && upload.path) {
        await supabase
          .from("pagos")
          .update({ comprobante_url: upload.path })
          .eq("id", pago.id);
      } else if (!pago && upload.path) {
        await supabase.from("pagos").insert({
          salon_id: salon.id,
          cita_id: existingCita.id,
          monto: item.precio,
          metodo: parsed.data.metodo,
          comprobante_url: upload.path,
          estado: "pendiente",
        });
      }

      try {
        await notifySalonNewReservation({
          salonId: salon.id,
          clientaNombre: parsed.data.nombre,
          beneficiarioNombre,
          itemNombre: item.nombre,
          inicio,
          timezone: salon.timezone,
          metodo: parsed.data.metodo,
        });
      } catch (error) {
        console.error("[push] notify reservation failed", error);
      }

      return { citaId: existingCita.id };
    }

    return {
      error:
        "Ya tienes una reserva pendiente en este horario. Revisa tu confirmación o elige otro horario.",
    };
  }


  const { data: clientaId, error: clientaError } = await supabase.rpc(
    "upsert_clienta_public",
    {
      p_salon_id: salon.id,
      p_nombre: parsed.data.nombre,
      p_telefono: parsed.data.telefono,
    }
  );

  if (clientaError || !clientaId) {
    return { error: "No se pudo registrar la clienta" };
  }

  const { data: cita, error: citaError } = await supabase
    .from("citas")
    .insert({
      salon_id: salon.id,
      clienta_id: clientaId,
      servicio_id: parsed.data.servicio_id ?? null,
      paquete_id: parsed.data.paquete_id ?? null,
      colaboradora_id: null,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      estado: "pendiente_validacion",
      creada_por: "clienta",
      beneficiario_nombre: beneficiarioNombre,
    })
    .select("id")
    .single();

  if (citaError || !cita) {
    return { error: "No se pudo crear la reserva" };
  }

  let comprobantePath: string | null = null;

  if (needsComprobante && comprobante instanceof File) {
    const upload = await uploadComprobante({
      salonId: salon.id,
      citaId: cita.id,
      file: comprobante,
    });

    if (upload.error) {
      await supabase.rpc("cancel_reserva_public", { p_cita_id: cita.id });
      return { error: upload.error };
    }

    comprobantePath = upload.path ?? null;
  }

  const { error: pagoError } = await supabase.from("pagos").insert({
    salon_id: salon.id,
    cita_id: cita.id,
    monto: item.precio,
    metodo: parsed.data.metodo,
    comprobante_url: comprobantePath,
    estado: "pendiente",
  });

  if (pagoError) {
    if (comprobantePath) {
      await deleteComprobante(comprobantePath);
    }
    await supabase.rpc("cancel_reserva_public", { p_cita_id: cita.id });
    return { error: "No se pudo registrar el pago" };
  }

  try {
    await notifySalonNewReservation({
      salonId: salon.id,
      clientaNombre: parsed.data.nombre,
      beneficiarioNombre,
      itemNombre: item.nombre,
      inicio,
      timezone: salon.timezone,
      metodo: parsed.data.metodo,
    });
  } catch (error) {
    console.error("[push] notify reservation failed", error);
  }

  return { citaId: cita.id };
}
