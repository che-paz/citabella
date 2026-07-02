import { notFound } from "next/navigation";
import { ReservarWizard } from "@/components/reservar/ReservarWizard";
import { SalonBrand } from "@/components/dashboard/SalonBrand";
import { getCatalogoPublico, getSalonBySlug } from "@/lib/reservar/queries";
import { getSalonLogoPublicUrl } from "@/lib/storage/logos";

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
  const logoSrc = getSalonLogoPublicUrl(salon.logo_url);

  return (
    <div className="min-h-screen">
      <header className="border-b border-primary/15 bg-card/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary">
            Reserva en línea
          </p>
          <SalonBrand nombre={salon.nombre} logoSrc={logoSrc} />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 pb-10">
        <ReservarWizard salon={salon} catalogo={catalogo} />
      </main>
    </div>
  );
}
