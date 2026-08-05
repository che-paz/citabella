import type { ReservaItem } from "@/types/database";
import { getVitrinaDemoPack } from "@/lib/vitrina/demo";
import { getVitrinaPlaceholders } from "@/lib/vitrina/placeholders";
import type { VitrinaResolved, VitrinaServiceItem } from "@/lib/vitrina/types";

const MAX_SERVICES = 8;

function catalogToServices(catalogo: ReservaItem[]): VitrinaServiceItem[] {
  return catalogo.slice(0, MAX_SERVICES).map((item) => ({
    name: item.nombre,
    description:
      item.tipo === "paquete"
        ? "Paquete"
        : item.categoria
          ? item.categoria
          : undefined,
  }));
}

export function resolveVitrinaContent(params: {
  slug: string;
  salonName: string;
  logoSrc: string | null;
  catalogo: ReservaItem[];
  demo?: boolean;
}): VitrinaResolved {
  const placeholders = getVitrinaPlaceholders(params.slug);
  const fromCatalog = catalogToServices(params.catalogo);

  if (params.demo) {
    const pack = getVitrinaDemoPack(placeholders.theme, params.slug);
    const services =
      fromCatalog.length > 0 ? fromCatalog : pack.services;

    return {
      ...placeholders,
      tagline: pack.tagline,
      about: pack.about,
      contact: pack.contact,
      portfolioCount: pack.portfolioImages.length,
      salonName: params.salonName,
      slug: params.slug,
      logoSrc: params.logoSrc,
      bookingUrl: `/reservar/${params.slug}`,
      services,
      servicesFromCatalog: fromCatalog.length > 0,
      isDemo: true,
      heroImageUrl: pack.heroImageUrl,
      portfolioImages: pack.portfolioImages,
    };
  }

  const services =
    fromCatalog.length > 0 ? fromCatalog : placeholders.servicesFallback;

  return {
    ...placeholders,
    salonName: params.salonName,
    slug: params.slug,
    logoSrc: params.logoSrc,
    bookingUrl: `/reservar/${params.slug}`,
    services,
    servicesFromCatalog: fromCatalog.length > 0,
    isDemo: false,
    heroImageUrl: null,
    portfolioImages: [],
  };
}

export function getWhatsAppHref(whatsapp: string | undefined): string | null {
  if (!whatsapp) return null;
  if (whatsapp.startsWith("http")) return whatsapp;
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}
