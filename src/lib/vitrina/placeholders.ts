import type { VitrinaPlaceholders } from "@/lib/vitrina/types";

const DEFAULT: VitrinaPlaceholders = {
  tagline: "Tu cita, sin pelear con el WhatsApp.",
  about:
    "Somos un salón en Guatemala. Atendemos con cita previa y el cariño que tu look merece. Este texto es un placeholder: la dueña lo reemplazará en el editor.",
  servicesFallback: [
    { name: "Servicio destacado", description: "Descripción corta (placeholder)." },
    { name: "Otro servicio", description: "Descripción corta (placeholder)." },
    { name: "Paquete popular", description: "Descripción corta (placeholder)." },
    { name: "Consulta / retoque", description: "Descripción corta (placeholder)." },
  ],
  portfolioCount: 6,
  contact: {
    zone: "Ciudad / zona (placeholder)",
    hours: "Lun–Sáb · horario por confirmar",
  },
  theme: "beauty",
};

/** Overrides keyed by public salon slug. No DB yet — S2.2 will move this to editable content. */
const BY_SLUG: Record<string, Partial<VitrinaPlaceholders>> = {
  "salon-tutis": {
    tagline: "Belleza con cita clara y sin vueltas.",
    about:
      "Tutis — salón de belleza. Este párrafo es placeholder hasta que Ruth confirme el copy de la vitrina (zona, tono y qué las hace distintas).",
    theme: "beauty",
    contact: {
      zone: "Guatemala (zona por confirmar)",
      hours: "Horario por confirmar",
    },
  },
  "galaxy-barberia-infantil": {
    tagline: "Cortes para peques, con agenda ordenada.",
    about:
      "Galaxy — barbería infantil. Placeholder: Andrea confirma barrio, tono y lo que las papás deben saber antes de la cita.",
    theme: "kids",
    contact: {
      zone: "Guatemala (zona por confirmar)",
      hours: "Horario por confirmar",
    },
    servicesFallback: [
      { name: "Corte niños", description: "Placeholder — se alinea al catálogo de la app." },
      { name: "Corte + peinado", description: "Placeholder." },
      { name: "Primera visita", description: "Placeholder." },
      { name: "Otro servicio", description: "Placeholder." },
    ],
  },
  "gota-prueba-s13": {
    tagline: "Salón de prueba Gota+Check.",
    about:
      "Vitrina de prueba interna. Sirve para validar plantilla, CTA a agenda y layout móvil antes del contenido real de founders.",
    theme: "beauty",
    contact: {
      zone: "Entorno de prueba",
      hours: "Siempre abierto (demo)",
    },
  },
};

export function getVitrinaPlaceholders(slug: string): VitrinaPlaceholders {
  const override = BY_SLUG[slug];
  if (!override) return DEFAULT;

  return {
    ...DEFAULT,
    ...override,
    contact: {
      ...DEFAULT.contact,
      ...(override.contact ?? {}),
    },
    servicesFallback: override.servicesFallback ?? DEFAULT.servicesFallback,
  };
}
