import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-user";
import {
  getComprobanteSignedUrl,
  getPagosPendientes,
} from "@/lib/pagos/queries";
import { ValidacionCola } from "@/components/pagos/ValidacionCola";
import { Badge } from "@/components/ui/badge";

export default async function PagosPage() {
  const user = await getAuthUser();
  if (!user) return null;

  if (user.rol !== "admin_salon") {
    redirect("/agenda");
  }

  const timezone = user.salon.timezone ?? "America/Guatemala";
  const pagos = await getPagosPendientes(user.salon_id);

  const comprobanteUrls: Record<string, string | null> = {};
  await Promise.all(
    pagos
      .filter((p) => p.comprobante_url)
      .map(async (p) => {
        comprobanteUrls[p.comprobante_url!] = await getComprobanteSignedUrl(
          p.comprobante_url!
        );
      })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground">
            Valida comprobantes y confirma citas del link público.
          </p>
        </div>
        {pagos.length > 0 && (
          <Badge variant="secondary">{pagos.length} pendiente(s)</Badge>
        )}
      </div>

      <ValidacionCola
        pagos={pagos}
        timezone={timezone}
        comprobanteUrls={comprobanteUrls}
      />
    </div>
  );
}
