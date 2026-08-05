/**
 * Provision a single salon (assisted onboarding) — S1.3
 *
 * Usage (from repo root, with .env.local):
 *   node scripts/provision-salon.mjs \
 *     --nombre "Studio Ana" \
 *     --slug studio-ana \
 *     --email ana@correo.com \
 *     --admin "Ana López" \
 *     --plan trial \
 *     --slot-step 15
 *
 * Options:
 *   --plan              founder | trial | pago   (default: trial)
 *   --slot-step         15 | 30 | 60             (default: 15)
 *   --otra-persona      true|false               (default: false)
 *   --password          temporary password       (default: generated)
 *   --politica          refund policy text
 *   --dry-run           validate only, no writes
 *   --allow-existing    update salon/user if slug or email already exists
 *
 * Never provisions reserved founder/demo slugs unless --i-know-what-im-doing
 * (still blocked for salon-tutis / galaxy-barberia-infantil).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { randomBytes } from "crypto";
import WebSocket from "ws";

// Node < 22: supabase-js expects a global WebSocket
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket;
}

const RESERVED_SLUGS = new Set([
  "salon-tutis",
  "galaxy-barberia-infantil",
]);

const DEMO_SLUGS = new Set(["belleza-luna"]);

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

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error("Missing .env.local (need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)");
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function parseArgs(argv) {
  const out = {
    nombre: null,
    slug: null,
    email: null,
    admin: null,
    plan: "trial",
    slotStep: 15,
    otraPersona: false,
    password: null,
    politica: DEFAULT_POLITICA,
    dryRun: false,
    allowExisting: false,
    iKnow: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    const take = () => {
      i += 1;
      return next;
    };

    switch (arg) {
      case "--nombre":
        out.nombre = take();
        break;
      case "--slug":
        out.slug = take();
        break;
      case "--email":
        out.email = take();
        break;
      case "--admin":
        out.admin = take();
        break;
      case "--plan":
        out.plan = take();
        break;
      case "--slot-step":
        out.slotStep = Number(take());
        break;
      case "--otra-persona":
        out.otraPersona = ["1", "true", "yes", "si", "sí"].includes(
          String(take()).toLowerCase()
        );
        break;
      case "--password":
        out.password = take();
        break;
      case "--politica":
        out.politica = take();
        break;
      case "--dry-run":
        out.dryRun = true;
        break;
      case "--allow-existing":
        out.allowExisting = true;
        break;
      case "--i-know-what-im-doing":
        out.iKnow = true;
        break;
      case "--help":
      case "-h":
        out.help = true;
        break;
      default:
        if (arg.startsWith("-")) {
          throw new Error(`Unknown flag: ${arg}`);
        }
    }
  }

  return out;
}

function printHelp() {
  console.log(`Provision a salon (S1.3)

Required:
  --nombre "Studio Ana"
  --slug studio-ana
  --email ana@correo.com
  --admin "Ana López"

Optional:
  --plan trial|pago|founder     (default trial)
  --slot-step 15|30|60          (default 15)
  --otra-persona true|false     (default false)
  --password TEMP               (default generated)
  --politica "..."
  --dry-run
  --allow-existing              update if slug/email already exists

Blocked slugs: salon-tutis, galaxy-barberia-infantil
Demo slug belleza-luna requires --i-know-what-im-doing
`);
}

function assertSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      `Invalid slug "${slug}". Use kebab-case lowercase (e.g. studio-ana).`
    );
  }
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(
      `Slug "${slug}" is reserved for founders pilot. Refusing to provision.`
    );
  }
}

function generatePassword(slug) {
  const label = slug.split("-")[0]?.slice(0, 12) || "Salon";
  const suffix = randomBytes(3).toString("hex");
  return `${label}2026!${suffix}`;
}

function siteUrl(env) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    env.NEXT_PUBLIC_SITE_URL ||
    "https://citabella-eight.vercel.app"
  ).replace(/\/$/, "");
}

async function findUserByEmail(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function ensureAuthUser(supabase, { email, admin, password }, allowExisting) {
  const existing = await findUserByEmail(supabase, email);
  if (existing) {
    if (!allowExisting) {
      throw new Error(
        `Auth user already exists: ${email}. Pass --allow-existing to reset password and reuse.`
      );
    }
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { nombre: admin },
    });
    if (error) throw new Error(`Auth update: ${error.message}`);
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: admin },
  });
  if (error) throw new Error(`Auth create: ${error.message}`);
  return data.user;
}

async function ensureSalon(supabase, args, allowExisting) {
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
    politica_reembolso: args.politica,
    slot_step_minutes: args.slotStep,
    permite_reserva_otra_persona: args.otraPersona,
    activo: true,
  };

  if (existing) {
    if (!allowExisting) {
      throw new Error(
        `Salon slug already exists: ${args.slug}. Pass --allow-existing to update.`
      );
    }
    const { error } = await supabase
      .from("salones")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("salones")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureUsuario(supabase, userId, salonId, args, allowExisting) {
  const { data: existing, error: fetchError } = await supabase
    .from("usuarios")
    .select("id, salon_id")
    .eq("id", userId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing && existing.salon_id !== salonId && !allowExisting) {
    throw new Error(
      `User ${args.email} already linked to another salon (${existing.salon_id}).`
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

async function ensureSchedule(supabase, salonId) {
  for (const slot of DEFAULT_SCHEDULE) {
    const { error } = await supabase.from("horarios_salon").upsert(
      { salon_id: salonId, ...slot },
      { onConflict: "salon_id,dia_semana" }
    );
    if (error) throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  for (const key of ["nombre", "slug", "email", "admin"]) {
    if (!args[key]) {
      printHelp();
      throw new Error(`Missing required --${key}`);
    }
  }

  args.slug = args.slug.trim().toLowerCase();
  args.email = args.email.trim().toLowerCase();
  assertSlug(args.slug);

  if (DEMO_SLUGS.has(args.slug) && !args.iKnow) {
    throw new Error(
      `Slug "${args.slug}" is the demo seed. Pass --i-know-what-im-doing to proceed.`
    );
  }

  if (!["founder", "trial", "pago"].includes(args.plan)) {
    throw new Error(`Invalid --plan "${args.plan}". Use founder|trial|pago.`);
  }

  if (![15, 30, 60].includes(args.slotStep)) {
    throw new Error(`Invalid --slot-step "${args.slotStep}". Use 15, 30, or 60.`);
  }

  const password = args.password || generatePassword(args.slug);
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  console.log("\n=== Provision salon ===");
  console.log(`  nombre:     ${args.nombre}`);
  console.log(`  slug:       ${args.slug}`);
  console.log(`  email:      ${args.email}`);
  console.log(`  admin:      ${args.admin}`);
  console.log(`  plan:       ${args.plan}`);
  console.log(`  slot-step:  ${args.slotStep}`);
  console.log(`  otra-pers.: ${args.otraPersona}`);
  console.log(`  dry-run:    ${args.dryRun}`);

  if (args.dryRun) {
    console.log("\nDry-run OK — no writes.\n");
    return;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authUser = await ensureAuthUser(
    supabase,
    { email: args.email, admin: args.admin, password },
    args.allowExisting
  );
  const salonId = await ensureSalon(supabase, args, args.allowExisting);
  await ensureUsuario(supabase, authUser.id, salonId, args, args.allowExisting);
  await ensureSchedule(supabase, salonId);

  const base = siteUrl(env);
  console.log("\n=== Salon ready ===\n");
  console.log(`  ${args.admin} — ${args.nombre}`);
  console.log(`  Login:    ${base}/login`);
  console.log(`  Email:    ${args.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Reserva:  ${base}/reservar/${args.slug}`);
  console.log(`  salon_id: ${salonId}`);
  console.log(`  user_id:  ${authUser.id}`);
  console.log("\nAsk the owner to change the password in /ajustes.\n");
}

main().catch((err) => {
  console.error("\nProvision failed:", err.message || err);
  process.exit(1);
});
