"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearInternalSessionCookie,
  isInternalAuthenticated,
  setInternalSessionCookie,
  verifyInternalPassword,
} from "@/lib/internal-auth";
import type { LeadInteres, LeadPlan, OnboardingLead } from "@/lib/leads";
import { assertSlug, suggestSlug } from "@/lib/leads";
import { provisionSalon } from "@/lib/provision-salon";
import { createServiceClient } from "@/lib/supabase-admin";

function requireAuth() {
  if (!isInternalAuthenticated()) {
    redirect("/interna");
  }
}

export async function loginInternaAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  if (!verifyInternalPassword(password)) {
    return { error: "Contraseña incorrecta o panel no configurado." };
  }
  setInternalSessionCookie();
  redirect("/interna/leads");
}

export async function logoutInternaAction() {
  clearInternalSessionCookie();
  redirect("/interna");
}

function readLeadForm(formData: FormData) {
  const contact_name = String(formData.get("contact_name") ?? "").trim();
  const salon_nombre = String(formData.get("salon_nombre") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const interes = String(formData.get("interes") ?? "agenda") as LeadInteres;
  const interes_otro = String(formData.get("interes_otro") ?? "").trim() || null;
  const notas = String(formData.get("notas") ?? "").trim() || null;
  const admin_nombre =
    String(formData.get("admin_nombre") ?? "").trim() || contact_name || null;
  let slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!slug && salon_nombre) slug = suggestSlug(salon_nombre);
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const plan_tipo = (String(formData.get("plan_tipo") ?? "trial") ||
    "trial") as LeadPlan;
  const slot_step_minutes = Number(formData.get("slot_step_minutes") ?? 15);
  const permite_reserva_otra_persona =
    formData.get("permite_reserva_otra_persona") === "on" ||
    formData.get("permite_reserva_otra_persona") === "true";
  const mark_listo = formData.get("mark_listo") === "on";

  if (!contact_name || !salon_nombre || !whatsapp) {
    throw new Error("Nombre, salón y WhatsApp son obligatorios.");
  }
  if (!["agenda", "vitrina", "ambas", "otro"].includes(interes)) {
    throw new Error("Interés inválido.");
  }
  if (interes === "otro" && !interes_otro) {
    throw new Error("Indicá el interés «otro».");
  }
  if (slug) assertSlug(slug);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email inválido.");
  }
  if (!["trial", "pago", "founder"].includes(plan_tipo)) {
    throw new Error("Plan inválido.");
  }
  if (![15, 30, 60].includes(slot_step_minutes)) {
    throw new Error("Intervalo de slots inválido.");
  }

  const enrolmentReady = Boolean(slug && email && admin_nombre);
  const status = mark_listo && enrolmentReady ? "listo" : "borrador";

  return {
    contact_name,
    salon_nombre,
    whatsapp,
    interes,
    interes_otro,
    notas,
    admin_nombre,
    slug: slug || null,
    email,
    plan_tipo,
    slot_step_minutes,
    permite_reserva_otra_persona,
    status,
  };
}

export async function createLeadAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  requireAuth();
  try {
    const row = readLeadForm(formData);
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("onboarding_leads")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/interna/leads");
    redirect(`/interna/leads/${data.id}`);
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { error: e instanceof Error ? e.message : "Error al guardar" };
  }
}

export async function updateLeadAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta id" };
  try {
    const row = readLeadForm(formData);
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("onboarding_leads")
      .update({
        ...row,
        error_message: null,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/interna/leads");
    revalidatePath(`/interna/leads/${id}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function provisionLeadAction(
  _prev: { error?: string; ok?: string } | null,
  formData: FormData
): Promise<{ error?: string; ok?: string }> {
  requireAuth();
  const id = String(formData.get("id") ?? "");
  const allowExisting = formData.get("allow_existing") === "on";
  if (!id) return { error: "Falta id" };

  const supabase = createServiceClient();
  const { data: lead, error: fetchError } = await supabase
    .from("onboarding_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !lead) {
    return { error: fetchError?.message || "Lead no encontrado" };
  }

  const L = lead as OnboardingLead;
  if (!L.slug || !L.email || !L.admin_nombre) {
    return {
      error: "Completá slug, email y nombre admin antes de dar de alta.",
    };
  }

  try {
    await supabase
      .from("onboarding_leads")
      .update({
        status: "autorizado",
        authorized_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", id);

    const result = await provisionSalon(supabase, {
      nombre: L.salon_nombre,
      slug: L.slug,
      email: L.email,
      admin: L.admin_nombre,
      plan: L.plan_tipo,
      slotStep: L.slot_step_minutes as 15 | 30 | 60,
      otraPersona: L.permite_reserva_otra_persona,
      allowExisting,
    });

    await supabase
      .from("onboarding_leads")
      .update({
        status: "enrolado",
        salon_id: result.salonId,
        temp_password: result.password,
        enrolled_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", id);

    revalidatePath("/interna/leads");
    revalidatePath(`/interna/leads/${id}`);
    return {
      ok: `Alta OK. Login: ${result.loginUrl} · ${L.email} · Reserva: ${result.reservarUrl}`,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de provision";
    await supabase
      .from("onboarding_leads")
      .update({ status: "error", error_message: message })
      .eq("id", id);
    revalidatePath(`/interna/leads/${id}`);
    return { error: message };
  }
}

export async function listLeadsAction(): Promise<OnboardingLead[]> {
  requireAuth();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("onboarding_leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as OnboardingLead[];
}

export async function getLeadAction(id: string): Promise<OnboardingLead | null> {
  requireAuth();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("onboarding_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as OnboardingLead | null;
}
