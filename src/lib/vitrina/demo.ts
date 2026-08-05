import type {
  VitrinaContact,
  VitrinaServiceItem,
  VitrinaTheme,
} from "@/lib/vitrina/types";

/** Curated Unsplash URLs — ilustrativas para pitch/taller, no del salón real. */
const BEAUTY_HERO =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80";
const KIDS_HERO =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80";

const BEAUTY_PORTFOLIO = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f595b71b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1634449573010-63af48afb6b5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
];

const KIDS_PORTFOLIO = [
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=800&q=80",
];

export type VitrinaDemoPack = {
  tagline: string;
  about: string;
  services: VitrinaServiceItem[];
  contact: VitrinaContact;
  heroImageUrl: string;
  portfolioImages: string[];
};

const BEAUTY_SERVICES: VitrinaServiceItem[] = [
  { name: "Maquillaje social", description: "Eventos, fotos y ocasiones especiales" },
  { name: "Peinado", description: "Recogido, ondas o look del día" },
  { name: "Manicure", description: "Cuidado y color" },
  { name: "Pedicure", description: "Cuidado completo" },
  { name: "Ceja diseño", description: "Forma y definición" },
  { name: "Paquete novia", description: "Prueba + día del evento" },
];

const KIDS_SERVICES: VitrinaServiceItem[] = [
  { name: "Corte niños", description: "Corte clásico con paciencia" },
  { name: "Corte + peinado", description: "Listos para la foto" },
  { name: "Primera visita", description: "Ambiente amable para peques" },
  { name: "Corte hermanos", description: "Dos o más en la misma cita" },
  { name: "Diseño / fade infantil", description: "Según edad y estilo" },
];

const PACKS: Record<VitrinaTheme, VitrinaDemoPack> = {
  beauty: {
    tagline: "Tu cita, sin pelear con el WhatsApp.",
    about:
      "Somos un salón de belleza en la Ciudad de Guatemala. Atendemos con cita previa para que llegues, te sientas cuidada y salgas lista — sin filas ni mensajes perdidos. Agenda en línea y confirma tu anticipo en pocos pasos.",
    services: BEAUTY_SERVICES,
    contact: {
      zone: "Ciudad de Guatemala · Zona 10 (ejemplo)",
      hours: "Lun–Sáb 9:00–18:00",
      mapsUrl: "https://maps.google.com/?q=Zona+10+Guatemala",
    },
    heroImageUrl: BEAUTY_HERO,
    portfolioImages: BEAUTY_PORTFOLIO,
  },
  kids: {
    tagline: "Cortes para peques, con agenda ordenada.",
    about:
      "Barbería pensada para niños: ambiente tranquilo, tiempos claros y papás que saben exactamente cuándo es la cita. Reservás en línea, elegís el servicio y listo — menos estrés el día del corte.",
    services: KIDS_SERVICES,
    contact: {
      zone: "Ciudad de Guatemala · zona centro (ejemplo)",
      hours: "Mar–Sáb 10:00–17:00",
      mapsUrl: "https://maps.google.com/?q=Guatemala+Ciudad",
    },
    heroImageUrl: KIDS_HERO,
    portfolioImages: KIDS_PORTFOLIO,
  },
};

/** Copy afinado por founder slug; fotos siguen el tema. */
const SLUG_DEMO: Record<string, Partial<VitrinaDemoPack>> = {
  "salon-tutis": {
    tagline: "Belleza con cita clara y sin vueltas.",
    about:
      "En Tutis cuidamos cada detalle de tu look. Esta vista usa fotos de ejemplo para mostrar cómo se vería tu vitrina terminada: quiénes somos, qué ofrecemos y un botón claro para agendar en Gota+Check.",
    contact: {
      zone: "Guatemala (zona de ejemplo)",
      hours: "Lun–Sáb 9:00–18:00",
      mapsUrl: "https://maps.google.com/?q=Guatemala",
    },
  },
  "galaxy-barberia-infantil": {
    tagline: "Cortes para peques, sin pelear por el horario.",
    about:
      "Galaxy es barbería infantil. Esta vista de ejemplo muestra cómo se vería tu página con fotos, servicios y agenda en un solo lugar — para que papás reserven sin ir y venir por WhatsApp.",
    contact: {
      zone: "Guatemala (zona de ejemplo)",
      hours: "Mar–Sáb 10:00–17:00",
      mapsUrl: "https://maps.google.com/?q=Guatemala",
    },
  },
  "gota-prueba-s13": {
    tagline: "Así se ve una vitrina lista para clientas.",
    about:
      "Salón de demostración Gota+Check. Todo el contenido y las fotos son de ejemplo: sirve para enseñar en reuniones y en el taller cómo se siente el producto terminado antes de subir fotos reales.",
    contact: {
      zone: "Demo · Ciudad de Guatemala",
      hours: "Lun–Sáb 9:00–18:00",
      mapsUrl: "https://maps.google.com/?q=Guatemala",
    },
  },
};

export function getVitrinaDemoPack(
  theme: VitrinaTheme,
  slug: string
): VitrinaDemoPack {
  const base = PACKS[theme];
  const override = SLUG_DEMO[slug];
  if (!override) return base;

  return {
    ...base,
    ...override,
    contact: {
      ...base.contact,
      ...(override.contact ?? {}),
    },
    services: override.services ?? base.services,
    portfolioImages: override.portfolioImages ?? base.portfolioImages,
    heroImageUrl: override.heroImageUrl ?? base.heroImageUrl,
  };
}

export function isVitrinaDemoParam(
  value: string | string[] | undefined
): boolean {
  if (Array.isArray(value)) return value.some((v) => v === "1" || v === "true");
  return value === "1" || value === "true";
}
