import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isInternalAuthenticated } from "@/lib/internal-auth";
import type { OnboardingLead } from "@/lib/leads";
import { createServiceClient } from "@/lib/supabase-admin";
import { LeadEditor } from "../../LeadEditor";
import { ProvisionPanel } from "../../ProvisionPanel";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isInternalAuthenticated()) redirect("/interna");

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("onboarding_leads")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <p className="text-sm text-rose-deep">{error.message}</p>
    );
  }
  if (!data) notFound();

  const lead = data as OnboardingLead;

  return (
    <div>
      <Link
        href="/interna/leads"
        className="text-sm text-[#6f5f5a] underline-offset-2 hover:underline"
      >
        ← Leads
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">{lead.salon_nombre}</h1>
      <p className="mt-1 text-sm text-[#6f5f5a]">{lead.contact_name}</p>

      <div className="mt-6">
        <ProvisionPanel lead={lead} />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">Datos</h2>
        <div className="mt-3">
          <LeadEditor mode="edit" lead={lead} />
        </div>
      </div>
    </div>
  );
}
