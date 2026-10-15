import { createClient } from "@/lib/supabase/server";
import type { Salon } from "@/types/database";

export async function getSalonSettings(
  salonId: string
): Promise<
  Pick<
    Salon,
    | "id"
    | "nombre"
    | "slug"
    | "logo_url"
    | "politica_reembolso"
    | "slot_step_minutes"
    | "permite_reserva_otra_persona"
    | "recordatorio_citas_minutos"
  > | null
> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("salones")
    .select(
      "id, nombre, slug, logo_url, politica_reembolso, slot_step_minutes, permite_reserva_otra_persona, recordatorio_citas_minutos"
    )
    .eq("id", salonId)
    .single();

  return data;
}
