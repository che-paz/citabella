export type LeadInteres = "agenda" | "vitrina" | "ambas" | "otro";
export type LeadPlan = "trial" | "pago" | "founder";
export type LeadStatus =
  | "borrador"
  | "listo"
  | "autorizado"
  | "enrolado"
  | "error";

export type OnboardingLead = {
  id: string;
  created_at: string;
  updated_at: string;
  contact_name: string;
  salon_nombre: string;
  whatsapp: string;
  interes: LeadInteres;
  interes_otro: string | null;
  notas: string | null;
  slug: string | null;
  email: string | null;
  admin_nombre: string | null;
  plan_tipo: LeadPlan;
  slot_step_minutes: number;
  permite_reserva_otra_persona: boolean;
  status: LeadStatus;
  error_message: string | null;
  salon_id: string | null;
  temp_password: string | null;
  authorized_at: string | null;
  enrolled_at: string | null;
};

export function suggestSlug(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 48);
}

export function assertSlug(slug: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      `Slug inválido "${slug}". Usá kebab-case (ej. studio-ana).`
    );
  }
  if (slug === "salon-tutis" || slug === "galaxy-barberia-infantil") {
    throw new Error(`Slug reservado: ${slug}`);
  }
}

export const INTERES_LABEL: Record<LeadInteres, string> = {
  agenda: "Agenda",
  vitrina: "Vitrina",
  ambas: "Ambas",
  otro: "Otro",
};

export const STATUS_LABEL: Record<LeadStatus, string> = {
  borrador: "Borrador",
  listo: "Listo",
  autorizado: "Autorizado",
  enrolado: "Enrolado",
  error: "Error",
};
