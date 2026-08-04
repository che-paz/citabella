export function getWhatsAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/50250460346"
  );
}

/** Login URL of the agenda app. Empty = hide “Ya tengo cuenta”. */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "";
}
