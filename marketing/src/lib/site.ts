export function getWhatsAppUrl(prefill?: string): string {
  const base =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/50250460346";
  if (!prefill?.trim()) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(prefill.trim())}`;
}

/** Login URL of the agenda app. Empty = hide “Ya tengo cuenta”. */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "";
}
