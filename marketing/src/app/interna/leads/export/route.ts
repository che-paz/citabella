import { NextResponse } from "next/server";
import { isInternalAuthenticated } from "@/lib/internal-auth";
import { INTERES_LABEL, STATUS_LABEL, type OnboardingLead } from "@/lib/leads";
import { createServiceClient } from "@/lib/supabase-admin";

function csvEscape(value: string | number | boolean | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: Request) {
  if (!isInternalAuthenticated()) {
    return NextResponse.redirect(new URL("/interna", request.url));
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("onboarding_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as OnboardingLead[];
  const header = [
    "created_at",
    "status",
    "contact_name",
    "salon_nombre",
    "whatsapp",
    "interes",
    "interes_otro",
    "slug",
    "email",
    "admin_nombre",
    "plan_tipo",
    "slot_step_minutes",
    "permite_reserva_otra_persona",
    "notas",
    "salon_id",
    "enrolled_at",
    "error_message",
  ];

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.created_at,
        STATUS_LABEL[r.status],
        r.contact_name,
        r.salon_nombre,
        r.whatsapp,
        INTERES_LABEL[r.interes],
        r.interes_otro,
        r.slug,
        r.email,
        r.admin_nombre,
        r.plan_tipo,
        r.slot_step_minutes,
        r.permite_reserva_otra_persona,
        r.notas,
        r.salon_id,
        r.enrolled_at,
        r.error_message,
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];

  const bom = "\uFEFF";
  const body = bom + lines.join("\n");
  const filename = `gota-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
