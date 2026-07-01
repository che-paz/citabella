import { getAuthUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { CatalogoList } from "@/components/catalogo/CatalogoList";
import type { PaqueteConServicios, Servicio } from "@/types/database";

export default async function CatalogoPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .eq("salon_id", user.salon_id)
    .order("categoria")
    .order("nombre");

  const { data: paquetesRaw } = await supabase
    .from("paquetes")
    .select(
      `
      *,
      paquete_servicios (
        servicio_id,
        orden,
        servicios ( nombre )
      )
    `
    )
    .eq("salon_id", user.salon_id)
    .order("nombre");

  const paquetes: PaqueteConServicios[] = (paquetesRaw ?? []).map((p) => {
    const junction = p.paquete_servicios as Array<{
      servicio_id: string;
      orden: number;
      servicios: { nombre: string } | { nombre: string }[] | null;
    }>;

    return {
      id: p.id,
      salon_id: p.salon_id,
      nombre: p.nombre,
      precio: Number(p.precio),
      duracion_minutos: p.duracion_minutos,
      activo: p.activo,
      created_at: p.created_at,
      servicios: junction.map((j) => {
        const servicio = Array.isArray(j.servicios) ? j.servicios[0] : j.servicios;
        return {
          servicio_id: j.servicio_id,
          orden: j.orden,
          nombre: servicio?.nombre ?? "Servicio",
        };
      }),
    };
  });

  const serviciosTyped: Servicio[] = (servicios ?? []).map((s) => ({
    ...s,
    precio: Number(s.precio),
  }));

  const isAdmin = user.rol === "admin_salon";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Administra los servicios y paquetes de tu salón."
            : "Consulta los servicios y paquetes del salón."}
        </p>
      </div>

      <CatalogoList
        servicios={serviciosTyped}
        paquetes={paquetes}
        isAdmin={isAdmin}
      />
    </div>
  );
}
