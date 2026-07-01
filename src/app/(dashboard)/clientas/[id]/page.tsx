import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAuthUser } from "@/lib/auth/get-user";
import { getClientaById, getClientaCitas } from "@/lib/clientas/queries";
import { HistorialCitas } from "@/components/clientas/HistorialCitas";
import { ClientaDetalle } from "@/components/clientas/ClientaDetalle";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: { id: string };
};

export default async function ClientaDetallePage({ params }: PageProps) {
  const user = await getAuthUser();
  if (!user) return null;

  const [clienta, citas] = await Promise.all([
    getClientaById(user.salon_id, params.id),
    getClientaCitas(user.salon_id, params.id),
  ]);

  if (!clienta) {
    notFound();
  }

  const timezone = user.salon.timezone ?? "America/Guatemala";
  const isAdmin = user.rol === "admin_salon";

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href="/clientas" aria-label="Volver a clientas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <ClientaDetalle clienta={clienta} isAdmin={isAdmin} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Historial de citas</h2>
        <HistorialCitas
          citas={citas}
          timezone={timezone}
          showColaboradora={isAdmin}
        />
      </div>
    </div>
  );
}
