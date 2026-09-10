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

export function getSalonSlugForHost(host: string | null): string | null {
  if (!host) return null;
  const normalized = host.split(":")[0]?.toLowerCase() ?? "";
  return VITRINA_HOST_TO_SLUG[normalized] ?? null;
}

export function isSalonVitrinaHost(host: string | null): boolean {
  return getSalonSlugForHost(host) !== null;
}
