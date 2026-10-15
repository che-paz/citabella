import {
  agendaDayUrl,
  citaReminderTag,
  eventReminderTag,
  formatCitaReminderBody,
  formatEventReminderBody,
} from "@/lib/reminders/format";
import {
  citaReminderKey,
  maxCitaInicio,
  maxEventInicio,
  selectDueCitaIds,
  selectDueEventIds,
  type CitaReminderCandidate,
} from "@/lib/reminders/window";
import { sendPushToSalon } from "@/lib/push/send";
import { createAdminClient } from "@/lib/supabase/admin";

type ClaimedEvent = {
  id: string;
  salon_id: string;
  titulo: string;
  inicio: string;
  recordatorio_minutos: number;
  timezone: string;
};

type ClaimedCita = {
  salon_id: string;
  cita_id: string;
  inicio_programado: string;
  minutos: number;
  timezone: string;
  clienta_nombre: string;
  servicio_nombre: string;
};

export type ReminderRunResult = {
  eventos: { claimed: number; delivered: number };
  citas: { claimed: number; delivered: number };
  error?: string;
};

function nested<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function runDueReminders(
  now = new Date()
): Promise<ReminderRunResult> {
  const empty = {
    eventos: { claimed: 0, delivered: 0 },
    citas: { claimed: 0, delivered: 0 },
  };
  const admin = createAdminClient();
  if (!admin) {
    return { ...empty, error: "admin_client_missing" };
  }

  const eventos = await claimDueEvents(admin, now);
  const citas = await claimDueCitas(admin, now);

  if (eventos.error || citas.error) {
    return {
      eventos: { claimed: eventos.claimed.length, delivered: eventos.delivered },
      citas: { claimed: citas.claimed.length, delivered: citas.delivered },
      error: eventos.error ?? citas.error,
    };
  }

  return {
    eventos: { claimed: eventos.claimed.length, delivered: eventos.delivered },
    citas: { claimed: citas.claimed.length, delivered: citas.delivered },
  };
}

async function claimDueEvents(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  now: Date
): Promise<{ claimed: ClaimedEvent[]; delivered: number; error?: string }> {
  const { data, error } = await admin
    .from("bloqueos_agenda")
    .select("id, inicio, recordatorio_minutos, recordatorio_enviado_at")
    .not("recordatorio_minutos", "is", null)
    .is("recordatorio_enviado_at", null)
    .gt("inicio", now.toISOString())
    .lte("inicio", maxEventInicio(now).toISOString());

  if (error) {
    console.error("[recordatorios] event query failed", error.message);
    return { claimed: [], delivered: 0, error: "event_query_failed" };
  }

  const dueIds = selectDueEventIds(
    now,
    (data ?? []).map((row) => ({
      id: row.id as string,
      inicio: new Date(row.inicio as string),
      minutos: (row.recordatorio_minutos as number | null) ?? null,
      alreadyClaimed: row.recordatorio_enviado_at != null,
    }))
  );

  if (dueIds.length === 0) return { claimed: [], delivered: 0 };

  const { data: claimed, error: claimError } = await admin.rpc(
    "claim_evento_recordatorios",
    { p_ids: dueIds }
  );

  if (claimError) {
    console.error("[recordatorios] event claim failed", claimError.message);
    return { claimed: [], delivered: 0, error: "event_claim_failed" };
  }

  const rows = (claimed ?? []) as ClaimedEvent[];
  let delivered = 0;
  for (const row of rows) {
    const inicio = new Date(row.inicio);
    const timezone = row.timezone || "America/Guatemala";
    const result = await sendPushToSalon(row.salon_id, {
      title: "Recordatorio",
      body: formatEventReminderBody({
        titulo: row.titulo,
        inicio,
        minutos: row.recordatorio_minutos,
        timezone,
      }),
      url: agendaDayUrl(inicio, timezone),
      tag: eventReminderTag(row.id),
    });
    delivered += result.sent;
    if (result.sent === 0) {
      console.error("[recordatorios] event push not delivered", {
        salonId: row.salon_id,
        eventoId: row.id,
        skippedReason: result.skippedReason,
      });
    }
  }

  return { claimed: rows, delivered };
}

async function claimDueCitas(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  now: Date
): Promise<{ claimed: ClaimedCita[]; delivered: number; error?: string }> {
  const { data, error } = await admin
    .from("citas")
    .select(
      `
      id,
      inicio,
      estado,
      salon:salones!inner ( recordatorio_citas_minutos )
    `
    )
    .in("estado", ["pendiente_validacion", "confirmada"])
    .gt("inicio", now.toISOString())
    .lte("inicio", maxCitaInicio(now).toISOString());

  if (error) {
    console.error("[recordatorios] cita query failed", error.message);
    return { claimed: [], delivered: 0, error: "cita_query_failed" };
  }

  const candidates = data ?? [];
  const citaIds = candidates.map((row) => row.id as string);
  const sentKeys = new Set<string>();

  if (citaIds.length > 0) {
    const { data: sent, error: sentError } = await admin
      .from("recordatorios_enviados")
      .select("cita_id, inicio_programado")
      .in("cita_id", citaIds);

    if (sentError) {
      console.error("[recordatorios] sent lookup failed", sentError.message);
      return { claimed: [], delivered: 0, error: "sent_lookup_failed" };
    }

    for (const row of sent ?? []) {
      sentKeys.add(
        citaReminderKey(
          row.cita_id as string,
          new Date(row.inicio_programado as string)
        )
      );
    }
  }

  const dueIds = selectDueCitaIds(
    now,
    candidates.map((row) => {
      const salon = nested(
        row.salon as
          | { recordatorio_citas_minutos: number | null }
          | { recordatorio_citas_minutos: number | null }[]
          | null
      );
      const inicio = new Date(row.inicio as string);
      const id = row.id as string;
      const candidate: CitaReminderCandidate = {
        id,
        inicio,
        estado: row.estado as string,
        salonMinutos: salon?.recordatorio_citas_minutos ?? null,
        alreadySentForThisInicio: sentKeys.has(citaReminderKey(id, inicio)),
      };
      return candidate;
    })
  );

  if (dueIds.length === 0) return { claimed: [], delivered: 0 };

  const dueRows = candidates
    .filter((row) => dueIds.includes(row.id as string))
    .map((row) => ({
      cita_id: row.id as string,
      inicio: new Date(row.inicio as string).toISOString(),
    }));

  const { data: claimed, error: claimError } = await admin.rpc(
    "claim_cita_recordatorios",
    { p_rows: dueRows }
  );

  if (claimError) {
    console.error("[recordatorios] cita claim failed", claimError.message);
    return { claimed: [], delivered: 0, error: "cita_claim_failed" };
  }

  const rows = (claimed ?? []) as ClaimedCita[];
  let delivered = 0;
  for (const row of rows) {
    const inicio = new Date(row.inicio_programado);
    const timezone = row.timezone || "America/Guatemala";
    const result = await sendPushToSalon(row.salon_id, {
      title: "Recordatorio",
      body: formatCitaReminderBody({
        clientaNombre: row.clienta_nombre,
        servicioNombre: row.servicio_nombre,
        inicio,
        minutos: row.minutos,
        timezone,
      }),
      url: agendaDayUrl(inicio, timezone),
      tag: citaReminderTag(row.cita_id, inicio),
    });
    delivered += result.sent;
    if (result.sent === 0) {
      console.error("[recordatorios] cita push not delivered", {
        salonId: row.salon_id,
        citaId: row.cita_id,
        skippedReason: result.skippedReason,
      });
    }
  }

  return { claimed: rows, delivered };
}
