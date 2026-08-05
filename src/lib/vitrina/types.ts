export type VitrinaTheme = "beauty" | "kids";

export type VitrinaServiceItem = {
  name: string;
  description?: string;
};

export type VitrinaContact = {
  zone: string;
  hours: string;
  /** Digits only or full https://wa.me/... URL */
  whatsapp?: string;
  mapsUrl?: string;
};

export type VitrinaPlaceholders = {
  tagline: string;
  about: string;
  servicesFallback: VitrinaServiceItem[];
  portfolioCount: number;
  contact: VitrinaContact;
  theme: VitrinaTheme;
};

export type VitrinaResolved = VitrinaPlaceholders & {
  salonName: string;
  slug: string;
  logoSrc: string | null;
  bookingUrl: string;
  services: VitrinaServiceItem[];
  servicesFromCatalog: boolean;
  /** Pitch/taller: copy + fotos ilustrativas (?demo=1) */
  isDemo: boolean;
  heroImageUrl: string | null;
  portfolioImages: string[];
};
