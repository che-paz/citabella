import { notFound } from "next/navigation";
import { VitrinaLanding } from "@/components/vitrina/VitrinaLanding";
import { getCatalogoPublico, getSalonBySlug } from "@/lib/reservar/queries";
import { getSalonLogoPublicUrl } from "@/lib/storage/logos";
import { resolveVitrinaContent } from "@/lib/vitrina/resolve-content";
import "./vitrina.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  return {
    title: salon ? salon.nombre : "Vitrina",
    description: salon
      ? `${salon.nombre} — agenda tu cita en línea`
      : "Vitrina del salón",
  };
}

export default async function VitrinaPage({ params }: PageProps) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);

  if (!salon) {
    notFound();
  }

  const catalogo = await getCatalogoPublico(salon.id);
  const content = resolveVitrinaContent({
    slug,
    salonName: salon.nombre,
    logoSrc: getSalonLogoPublicUrl(salon.logo_url),
    catalogo,
  });

  return <VitrinaLanding content={content} />;
}
