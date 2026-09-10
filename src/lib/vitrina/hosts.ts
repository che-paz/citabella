/**
 * Custom domains → salon slug (S2.4).
 * Add both apex and www when connecting a domain in Vercel.
 */
export const VITRINA_HOST_TO_SLUG: Record<string, string> = {
  "estudiotutis.com": "salon-tutis",
  "www.estudiotutis.com": "salon-tutis",
  "galaxybarberiagt.com": "galaxy-barberia-infantil",
  "www.galaxybarberiagt.com": "galaxy-barberia-infantil",
};

/** Primary public website per slug (www preferred). */
const VITRINA_SLUG_TO_WEBSITE: Record<string, string> = {
  "salon-tutis": "https://www.estudiotutis.com",
  "galaxy-barberia-infantil": "https://www.galaxybarberiagt.com",
};

export function getSalonSlugForHost(host: string | null): string | null {
  if (!host) return null;
  const normalized = host.split(":")[0]?.toLowerCase() ?? "";
  return VITRINA_HOST_TO_SLUG[normalized] ?? null;
}

export function isSalonVitrinaHost(host: string | null): boolean {
  return getSalonSlugForHost(host) !== null;
}

/** Public salon website: custom domain if mapped, else `/vitrina/[slug]`. */
export function getSalonWebsiteHref(slug: string): string {
  return VITRINA_SLUG_TO_WEBSITE[slug] ?? `/vitrina/${slug}`;
}
