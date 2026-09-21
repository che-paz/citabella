import Link from "next/link";
import { redirect } from "next/navigation";
import { isInternalAuthenticated } from "@/lib/internal-auth";
import { INTERES_LABEL, STATUS_LABEL, type OnboardingLead } from "@/lib/leads";
import { createServiceClient } from "@/lib/supabase-admin";
import { logoutInternaAction } from "../actions";

async function loadLeads(): Promise<OnboardingLead[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("onboarding_leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as OnboardingLead[];
}

export default async function LeadsPage() {
  if (!isInternalAuthenticated()) redirect("/interna");

  let leads: OnboardingLead[] = [];
  let loadError: string | null = null;
  try {
    leads = await loadLeads();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Error al cargar";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Leads</h1>
          <p className="mt-1 text-sm text-[#6f5f5a]">
            Captura → listo → autorizar y dar de alta
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/interna/leads/nuevo"
            className="rounded-xl bg-[#a85a5a] px-4 py-2 text-sm font-semibold text-white"
          >
            Nuevo lead
          </Link>
          <a
            href="/interna/leads/export"
            className="rounded-xl border border-[#e0d4d0] bg-white px-4 py-2 text-sm font-medium"
          >
            Descargar Excel (CSV)
          </a>
          <form action={logoutInternaAction}>
            <button
              type="submit"
              className="rounded-xl px-3 py-2 text-sm text-[#6f5f5a] underline"
            >
              Salir
            </button>
          </form>
        </div>
      </div>

      {loadError ? (
        <p className="mt-6 rounded-lg border border-rose-soft/60 bg-white p-4 text-sm text-rose-deep">
          {loadError}
          <span className="mt-2 block text-[#6f5f5a]">
            ¿Aplicaste la migración{" "}
            <code className="text-xs">018_onboarding_leads.sql</code> en
            Supabase?
          </span>
        </p>
      ) : leads.length === 0 ? (
        <p className="mt-8 text-sm text-[#6f5f5a]">
          Todavía no hay leads.{" "}
          <Link href="/interna/leads/nuevo" className="text-[#a85a5a] underline">
            Crear el primero
          </Link>
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-[#e0d4d0] overflow-hidden rounded-xl border border-[#e0d4d0] bg-white">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/interna/leads/${lead.id}`}
                className="flex flex-col gap-1 px-4 py-3 transition hover:bg-[#fbf6f4] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {lead.salon_nombre}{" "}
                    <span className="font-normal text-[#6f5f5a]">
                      · {lead.contact_name}
                    </span>
                  </p>
                  <p className="truncate text-sm text-[#6f5f5a]">
                    {lead.whatsapp}
                    {lead.slug ? ` · /${lead.slug}` : ""}
                    {" · "}
                    {INTERES_LABEL[lead.interes]}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#a85a5a]">
                  {STATUS_LABEL[lead.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
