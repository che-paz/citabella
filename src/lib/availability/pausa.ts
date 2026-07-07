import { createAdminClient } from "@/lib/supabase/admin";
import type { PausaDiariaInput } from "./engine";

export function resolvePausaDiariaFromSalon(salon: {
  pausa_diaria_activa?: boolean | null;
  pausa_hora_inicio?: string | null;
  pausa_hora_fin?: string | null;
}): PausaDiariaInput | null {
  if (
    !salon.pausa_diaria_activa ||
    !salon.pausa_hora_inicio ||
    !salon.pausa_hora_fin
  ) {
    return null;
  }

  return {
    activa: true,
    hora_inicio: salon.pausa_hora_inicio.slice(0, 5),
    hora_fin: salon.pausa_hora_fin.slice(0, 5),
  };
}

/** Server-only: lee pausa con service role (link público no depende de RLS en salones). */
export async function fetchSalonPausaDiaria(
  salonId: string
): Promise<PausaDiariaInput | null> {
  const admin = createAdminClient();
  if (!admin) {
    console.error("[availability] admin client missing for pausa diaria");
    return null;
  }

  const { data, error } = await admin
    .from("salones")
    .select("pausa_diaria_activa, pausa_hora_inicio, pausa_hora_fin")
    .eq("id", salonId)
    .single();

  if (error) {
    console.error("[availability] pausa query failed", error.message);
    return null;
  }

  return resolvePausaDiariaFromSalon(data ?? {});
}
