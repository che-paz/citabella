import { notFound } from "next/navigation";
import { VitrinaLanding } from "@/components/vitrina/VitrinaLanding";
import { isVitrinaDemoParam } from "@/lib/vitrina/demo";
import { getCatalogoPublico, getSalonBySlug } from "@/lib/reservar/queries";
import { getSalonLogoPublicUrl } from "@/lib/storage/logos";
import { resolveVitrinaContent } from "@/lib/vitrina/resolve-content";
import "./vitrina.css";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ demo?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const salon = await getSalonBySlug(slug);
  const demo = isVitrinaDemoParam(query.demo);
  const baseTitle = salon ? salon.nombre : "Vitrina";
  return {
    title: demo ? `${baseTitle} (ejemplo)` : baseTitle,
    description: salon
      ? `${salon.nombre} — agenda tu cita en línea`
      : "Vitrina del salón",
  };
}

export default async function VitrinaPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
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
    demo: isVitrinaDemoParam(query.demo),
  });

  return <VitrinaLanding content={content} />;
}
