import { notFound } from "next/navigation";
import { ReservarWizard } from "@/components/reservar/ReservarWizard";
import { getCatalogoPublico, getSalonBySlug } from "@/lib/reservar/queries";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  return {
    title: salon ? `Reservar — ${salon.nombre}` : "Reservar",
    description: salon
      ? `Reserva tu cita en ${salon.nombre}`
      : "Reserva tu cita de belleza",
  };
}

export default async function ReservarPage({ params }: PageProps) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);

  if (!salon) {
    notFound();
  }

  const catalogo = await getCatalogoPublico(salon.id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-lg px-4 py-6">
          <p className="text-sm text-muted-foreground">Reserva en línea</p>
          <h1 className="text-2xl font-bold tracking-tight">{salon.nombre}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <ReservarWizard salon={salon} catalogo={catalogo} />
      </main>
    </div>
  );
}
