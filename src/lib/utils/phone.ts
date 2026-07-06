export const PHONE_INPUT_PLACEHOLDER = "50250460346";

export const PHONE_INPUT_HINT =
  "Incluye código de país: 502 (GT), 504 (HN) o 503 (SV). Ej. 50250460346";

export const SUPPORTED_PHONE_COUNTRIES = [
  { code: "502", name: "Guatemala", localPattern: /^[2-7]\d{7}$/ },
  { code: "504", name: "Honduras", localPattern: /^[2-9]\d{7}$/ },
  { code: "503", name: "El Salvador", localPattern: /^[2-7]\d{7}$/ },
] as const;

export type SupportedPhoneCountryCode =
  (typeof SUPPORTED_PHONE_COUNTRIES)[number]["code"];

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  for (const country of SUPPORTED_PHONE_COUNTRIES) {
    if (digits.length === 8 && country.localPattern.test(digits)) {
      // Ambiguous 8-digit locals (GT/SV) default to Guatemala (first match).
      return `${country.code}${digits}`;
    }
    if (
      digits.length === 11 &&
      digits.startsWith(country.code) &&
      country.localPattern.test(digits.slice(3))
    ) {
      return digits;
    }
  }

  return null;
}

/** @deprecated Use normalizePhone */
export const normalizeGuatemalaPhone = normalizePhone;

/** E.164 without + for wa.me links. */
export function phoneToWhatsAppDigits(
  phone: string | null | undefined
): string | null {
  if (!phone) return null;
  return normalizePhone(phone);
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return phone;

  const country = SUPPORTED_PHONE_COUNTRIES.find((c) =>
    normalized.startsWith(c.code)
  );
  const local = normalized.slice(3);
  const formatted = `${local.slice(0, 4)}-${local.slice(4)}`;
  return country ? `+${country.code} ${formatted}` : formatted;
}

/** @deprecated Use formatPhoneDisplay */
export const formatGuatemalaPhoneDisplay = formatPhoneDisplay;

export function getPhoneCountryName(phone: string): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return (
    SUPPORTED_PHONE_COUNTRIES.find((c) => normalized.startsWith(c.code))?.name ??
    null
  );
}
