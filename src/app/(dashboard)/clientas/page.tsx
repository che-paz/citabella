import { Suspense } from "react";
import { getAuthUser } from "@/lib/auth/get-user";
import { searchClientas } from "@/lib/clientas/queries";
import { ClientasList } from "@/components/clientas/ClientasList";

type PageProps = {
  searchParams: { q?: string };
};

export default async function ClientasPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  if (!user) return null;

  const query = searchParams.q?.trim() ?? "";
  const clientas = await searchClientas(user.salon_id, query || undefined);
  const isAdmin = user.rol === "admin_salon";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientas</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Gestiona el directorio de clientas de tu salón."
            : "Consulta datos e historial de tus clientas."}
        </p>
      </div>

      <Suspense fallback={null}>
        <ClientasList
          clientas={clientas}
          isAdmin={isAdmin}
          initialQuery={query}
        />
      </Suspense>
    </div>
  );
}
