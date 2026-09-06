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

const BY_SLUG: Record<string, VitrinaLivePack> = {
  "salon-tutis": TUTIS,
};

export function getVitrinaLivePack(slug: string): VitrinaLivePack | null {
  return BY_SLUG[slug] ?? null;
}
