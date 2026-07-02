import { notFound } from "next/navigation";
import { ReservarWizard } from "@/components/reservar/ReservarWizard";
import { SalonBrand } from "@/components/dashboard/SalonBrand";
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b border-border/80 bg-card/90 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-6">
          <p className="mb-3 text-sm text-muted-foreground">Reserva en línea</p>
          <SalonBrand nombre={salon.nombre} logoUrl={salon.logo_url} />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <ReservarWizard salon={salon} catalogo={catalogo} />
      </main>
    </div>
  );
}
