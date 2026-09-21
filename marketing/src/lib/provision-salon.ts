import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertSlug } from "./leads";
import { appSiteUrl } from "./supabase-admin";

const DEFAULT_SCHEDULE = [
  { dia_semana: 1, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 2, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 3, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 4, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 5, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 6, hora_inicio: "09:00", hora_fin: "14:00" },
];

const DEFAULT_POLITICA =
  "Cancelación con 24 horas de anticipación para reembolso del anticipo.";

export type ProvisionInput = {
  nombre: string;
  slug: string;
  email: string;
  admin: string;
  plan: "trial" | "pago" | "founder";
  slotStep: 15 | 30 | 60;
  otraPersona: boolean;
  password?: string;
  allowExisting?: boolean;
};

export type ProvisionResult = {
  salonId: string;
  userId: string;
  password: string;
  loginUrl: string;
  reservarUrl: string;
};

function generatePassword(slug: string): string {
  const label = slug.split("-")[0]?.slice(0, 12) || "Salon";
  const suffix = randomBytes(3).toString("hex");
  return `${label}2026!${suffix}`;
}

async function findUserByEmail(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return (
    data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ??
    null
  );
}

async function ensureAuthUser(
  supabase: SupabaseClient,
  opts: { email: string; admin: string; password: string },
  allowExisting: boolean
) {
  const existing = await findUserByEmail(supabase, opts.email);
  if (existing) {
    if (!allowExisting) {
      throw new Error(
        `Ya existe usuario Auth: ${opts.email}. Marcá «permitir existente» o usá otro email.`
      );
    }
    const { data, error } = await supabase.auth.admin.updateUserById(
      existing.id,
      {
        password: opts.password,
        email_confirm: true,
        user_metadata: { nombre: opts.admin },
      }
    );
    if (error) throw new Error(`Auth update: ${error.message}`);
    return data.user!;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
    user_metadata: { nombre: opts.admin },
  });
  if (error) throw new Error(`Auth create: ${error.message}`);
  return data.user!;
}

async function ensureSalon(
  supabase: SupabaseClient,
  args: ProvisionInput,
  allowExisting: boolean
) {
  const { data: existing, error: fetchError } = await supabase
    .from("salones")
    .select("id, slug")
    .eq("slug", args.slug)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const payload = {
    nombre: args.nombre,
    slug: args.slug,
    plan_tipo: args.plan,
    politica_reembolso: DEFAULT_POLITICA,
    slot_step_minutes: args.slotStep,
    permite_reserva_otra_persona: args.otraPersona,
    activo: true,
  };

  if (existing) {
    if (!allowExisting) {
      throw new Error(
        `Ya existe salón con slug ${args.slug}. Marcá «permitir existente» o cambiá el slug.`
      );
    }
    const { error } = await supabase
      .from("salones")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("salones")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function ensureUsuario(
  supabase: SupabaseClient,
  userId: string,
  salonId: string,
  args: ProvisionInput,
  allowExisting: boolean
) {
  const { data: existing, error: fetchError } = await supabase
    .from("usuarios")
    .select("id, salon_id")
    .eq("id", userId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing && existing.salon_id !== salonId && !allowExisting) {
    throw new Error(
      `El email ${args.email} ya está ligado a otro salón.`
    );
  }

  const row = {
    id: userId,
    salon_id: salonId,
    email: args.email,
    nombre: args.admin,
    rol: "admin_salon",
    activo: true,
  };

  if (existing) {
    const { error } = await supabase.from("usuarios").update(row).eq("id", userId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("usuarios").insert(row);
  if (error) throw error;
}

async function ensureSchedule(supabase: SupabaseClient, salonId: string) {
  for (const slot of DEFAULT_SCHEDULE) {
    const { error } = await supabase.from("horarios_salon").upsert(
      { salon_id: salonId, ...slot },
      { onConflict: "salon_id,dia_semana" }
    );
    if (error) throw error;
  }
}

/** Same behaviour as scripts/provision-salon.mjs (assisted onboarding). */
export async function provisionSalon(
  supabase: SupabaseClient,
  raw: ProvisionInput
): Promise<ProvisionResult> {
  const args: ProvisionInput = {
    ...raw,
    slug: raw.slug.trim().toLowerCase(),
    email: raw.email.trim().toLowerCase(),
    nombre: raw.nombre.trim(),
    admin: raw.admin.trim(),
  };

  assertSlug(args.slug);

  if (!["founder", "trial", "pago"].includes(args.plan)) {
    throw new Error(`Plan inválido: ${args.plan}`);
  }
  if (![15, 30, 60].includes(args.slotStep)) {
    throw new Error(`slot_step inválido: ${args.slotStep}`);
  }

  const password = args.password || generatePassword(args.slug);
  const allowExisting = Boolean(args.allowExisting);

  const authUser = await ensureAuthUser(
    supabase,
    { email: args.email, admin: args.admin, password },
    allowExisting
  );
  const salonId = await ensureSalon(supabase, args, allowExisting);
  await ensureUsuario(supabase, authUser.id, salonId, args, allowExisting);
  await ensureSchedule(supabase, salonId);

  const base = appSiteUrl();
  return {
    salonId,
    userId: authUser.id,
    password,
    loginUrl: `${base}/login`,
    reservarUrl: `${base}/reservar/${args.slug}`,
  };
}
