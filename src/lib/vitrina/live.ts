import type { VitrinaResolved, VitrinaServiceItem } from "@/lib/vitrina/types";

/**
 * Real founder landings (studio-delivered). When present, used for /vitrina/[slug]
 * without ?demo=1. Assets live under /public/vitrina/[slug]/.
 */
export type VitrinaLivePack = {
  /** Optional override of salones.nombre for the landing brand line */
  displayName?: string;
  tagline: string;
  about: string;
  services: VitrinaServiceItem[];
  contact: VitrinaResolved["contact"];
  theme: VitrinaResolved["theme"];
  logoSrc: string;
  heroImageUrl: string;
  portfolioImages: string[];
};

const TUTIS: VitrinaLivePack = {
  displayName: "Tutis · Esencia y Estilo",
  tagline: "Realzamos tu esencia",
  about:
    "Tutis Esencia y Estilo es un centro de belleza donde nuestra prioridad es realzar la esencia de cada clienta, valorando su autenticidad y estilo. Buscamos que cada clienta se sienta hermosa, segura y satisfecha, brindando una experiencia que la motive a regresar y confiar nuevamente en nuestros servicios.",
  services: [
    { name: "Cejas", description: "Diseño y cuidado" },
    { name: "Maquillaje", description: "Belleza para tu ocasión" },
    { name: "Faciales", description: "Cuidado de la piel" },
    { name: "Masajes", description: "Relajación y bienestar" },
  ],
  contact: {
    zone: "Ciudad de Guatemala",
    hours: "Lun–Sáb 10:00–16:00",
    whatsapp: "50241925121",
    mapsUrl: "https://maps.app.goo.gl/pNFaTjFoGcGwxsEF7",
    mapsEmbedUrl:
      "https://maps.google.com/maps?q=14.565155,-89.354539&z=16&hl=es&output=embed",
  },
  theme: "beauty",
  logoSrc: "/vitrina/salon-tutis/logo.png",
  heroImageUrl: "/vitrina/salon-tutis/hero.jpg",
  portfolioImages: [
    "/vitrina/salon-tutis/portfolio/02.jpg",
    "/vitrina/salon-tutis/portfolio/03.jpg",
    "/vitrina/salon-tutis/portfolio/04.jpg",
    "/vitrina/salon-tutis/portfolio/05.jpg",
    "/vitrina/salon-tutis/portfolio/06.jpg",
    "/vitrina/salon-tutis/portfolio/07.jpg",
  ],
};

const GALAXY: VitrinaLivePack = {
  displayName: "Galaxy Barbería Infantil",
  tagline: "Vive la experiencia Galaxy",
  about:
    "Somos una barbería creada especialmente para los pequeños, donde cada corte de cabello se convierte en una experiencia llena de cariño, paciencia y diversión. Nos encanta crear un espacio en el que los niños se sientan cómodos, seguros y felices, mientras sus familias tienen la tranquilidad de saber que están en buenas manos.",
  services: [
    { name: "Corte de cabello para niño", description: "Q45.00" },
    { name: "Depilación de cejas con hilo", description: "Q70.00" },
    { name: "Aplicación de henna", description: "Q50.00" },
    { name: "Corte de rizos para dama", description: "Q45.00" },
    { name: "Tratamientos capilares", description: "Q175.00" },
  ],
  contact: {
    zone: "5ta avenida 3-81, zona 1 · Barrio San Joaquín, Guatemala",
    hours: "Lun–Sáb 14:00–19:00",
    whatsapp: "50247063288",
    mapsUrl: "https://maps.app.goo.gl/x7NPLNvns3B3J2vS9",
    mapsEmbedUrl:
      "https://maps.google.com/maps?q=14.5694299,-89.3534914&z=16&hl=es&output=embed",
  },
  theme: "kids",
  logoSrc: "/vitrina/galaxy-barberia-infantil/logo.jpg",
  heroImageUrl: "/vitrina/galaxy-barberia-infantil/hero.jpg",
  portfolioImages: [
    "/vitrina/galaxy-barberia-infantil/portfolio/01.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/02.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/03.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/04.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/05.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/06.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/07.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/08.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/09.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/10.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/11.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/12.jpg",
    "/vitrina/galaxy-barberia-infantil/portfolio/13.jpg",
  ],
};

const BY_SLUG: Record<string, VitrinaLivePack> = {
  "salon-tutis": TUTIS,
  "galaxy-barberia-infantil": GALAXY,
};

export function getVitrinaLivePack(slug: string): VitrinaLivePack | null {
  return BY_SLUG[slug] ?? null;
}

/** Favicon / touch icons derived from the salon logo (under public/vitrina/[slug]/). */
export function getVitrinaFaviconIcons(slug: string) {
  if (!BY_SLUG[slug]) return undefined;
  const base = `/vitrina/${slug}`;
  return {
    icon: [
      { url: `${base}/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: `${base}/apple-touch-icon.png`, sizes: "180x180" }],
  };
}
