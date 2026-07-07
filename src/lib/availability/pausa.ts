import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { PausaDiariaInput } from "./engine";

function timeToHHMM(value: string): string {
  return value.slice(0, 5);
}

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
    hora_inicio: timeToHHMM(salon.pausa_hora_inicio),
    hora_fin: timeToHHMM(salon.pausa_hora_fin),
  };
}

function mapPausaRow(row: {
  activa?: boolean | null;
  hora_inicio?: string | null;
  hora_fin?: string | null;
}): PausaDiariaInput | null {
  if (!row.activa || !row.hora_inicio || !row.hora_fin) {
    return null;
  }

  return {
    activa: true,
    hora_inicio: timeToHHMM(row.hora_inicio),
    hora_fin: timeToHHMM(row.hora_fin),
  };
}

/** Server-only: pausa del salón (service role → RPC → datos del caller). */
export async function fetchSalonPausaDiaria(
  salonId: string,
  preloaded?: PausaDiariaInput | null
): Promise<PausaDiariaInput | null> {
  if (preloaded?.activa) {
    return preloaded;
  }

  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin
      .from("salones")
      .select("pausa_diaria_activa, pausa_hora_inicio, pausa_hora_fin")
      .eq("id", salonId)
      .single();

    if (!error && data) {
      const mapped = resolvePausaDiariaFromSalon(data);
      if (mapped) return mapped;
    } else if (error) {
      console.error("[availability] pausa admin query failed", error.message);
    }
  }

  const supabase = await createClient();
  const { data: rpcRows, error: rpcError } = await supabase.rpc(
    "get_salon_pausa_diaria",
    { p_salon_id: salonId }
  );

  if (!rpcError && rpcRows?.[0]) {
    const row = rpcRows[0] as {
      activa: boolean;
      hora_inicio: string;
      hora_fin: string;
    };
    const mapped = mapPausaRow({
      activa: row.activa,
      hora_inicio: row.hora_inicio,
      hora_fin: row.hora_fin,
    });
    if (mapped) return mapped;
  } else if (rpcError) {
    console.error("[availability] pausa rpc failed", rpcError.message);
  }

  return preloaded ?? null;
}
