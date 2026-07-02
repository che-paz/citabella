/**
 * Provision founder pilot salons in Supabase Cloud.
 * Usage: node scripts/provision-founders-pilot.mjs
 * Optional env: FOUNDER_TEMP_PASSWORD (same for all founders in pilot)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { randomBytes } from "crypto";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error("Missing .env.local");
  }
  const lines = readFileSync(envPath, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function generatePassword(label) {
  const suffix = randomBytes(3).toString("hex");
  return `${label}2026!${suffix}`;
}

const FOUNDERS = [
  {
    email: "ruth@gmail.com",
    nombre: "Ruth Guzman",
    salonNombre: "Salón Tutis",
    slug: "salon-tutis",
    salonId: "22222222-2222-2222-2222-222222222201",
    passwordEnv: "FOUNDER_RUTH_PASSWORD",
    passwordLabel: "Tutis",
  },
  {
    email: "andrea@gmail.com",
    nombre: "Andrea Juarez",
    salonNombre: "Galaxy Barberia Infantil",
    slug: "galaxy-barberia-infantil",
    salonId: "22222222-2222-2222-2222-222222222202",
    passwordEnv: "FOUNDER_ANDREA_PASSWORD",
    passwordLabel: "Galaxy",
  },
];

const DEFAULT_SCHEDULE = [
  { dia_semana: 1, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 2, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 3, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 4, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 5, hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: 6, hora_inicio: "09:00", hora_fin: "14:00" },
];

const POLITICA =
  "Cancelación con 24 horas de anticipación para reembolso del anticipo.";

async function findUserByEmail(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function ensureAuthUser(supabase, founder, password) {
  const existing = await findUserByEmail(supabase, founder.email);
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { nombre: founder.nombre },
    });
    if (error) throw new Error(`Auth update ${founder.email}: ${error.message}`);
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: founder.email,
    password,
    email_confirm: true,
    user_metadata: { nombre: founder.nombre },
  });
  if (error) throw new Error(`Auth create ${founder.email}: ${error.message}`);
  return data.user;
}

async function ensureSalon(supabase, founder) {
  const { data: existing, error: fetchError } = await supabase
    .from("salones")
    .select("id, slug")
    .eq("slug", founder.slug)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing) {
    const { error } = await supabase
      .from("salones")
      .update({
        nombre: founder.salonNombre,
        plan_tipo: "founder",
        politica_reembolso: POLITICA,
        activo: true,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("salones")
    .insert({
      id: founder.salonId,
      nombre: founder.salonNombre,
      slug: founder.slug,
      plan_tipo: "founder",
      politica_reembolso: POLITICA,
      activo: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureUsuario(supabase, userId, salonId, founder) {
  const { data: existing, error: fetchError } = await supabase
    .from("usuarios")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const row = {
    id: userId,
    salon_id: salonId,
    email: founder.email,
    nombre: founder.nombre,
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

async function ensureSchedule(supabase, salonId) {
  for (const slot of DEFAULT_SCHEDULE) {
    const { error } = await supabase.from("horarios_salon").upsert(
      {
        salon_id: salonId,
        ...slot,
      },
      { onConflict: "salon_id,dia_semana" }
    );
    if (error) throw error;
  }
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase env vars in .env.local");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const credentials = [];

  for (const founder of FOUNDERS) {
    const password =
      process.env.FOUNDER_TEMP_PASSWORD ??
      process.env[founder.passwordEnv] ??
      generatePassword(founder.passwordLabel);

    const authUser = await ensureAuthUser(supabase, founder, password);
    const salonId = await ensureSalon(supabase, founder);
    await ensureUsuario(supabase, authUser.id, salonId, founder);
    await ensureSchedule(supabase, salonId);

    credentials.push({
      nombre: founder.nombre,
      salon: founder.salonNombre,
      slug: founder.slug,
      email: founder.email,
      password,
      userId: authUser.id,
      salonId,
    });
  }

  console.log("\n=== Founders pilot provisioned ===\n");
  for (const c of credentials) {
    console.log(`${c.nombre} — ${c.salon}`);
    console.log(`  Login: ${c.email}`);
    console.log(`  Password: ${c.password}`);
    console.log(`  Reserva: /reservar/${c.slug}`);
    console.log(`  salon_id: ${c.salonId}`);
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
