/** Guatemala mobile/landline: 8 digits, typically starts with 2–7. Stored as 502XXXXXXXX. */

const GT_EIGHT_DIGIT = /^[2-7]\d{7}$/;
const GT_ELEVEN_DIGIT = /^502[2-7]\d{7}$/;

export function normalizeGuatemalaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 8 && GT_EIGHT_DIGIT.test(digits)) {
    return `502${digits}`;
  }
  if (digits.length === 11 && GT_ELEVEN_DIGIT.test(digits)) {
    return digits;
  }
  return null;
}

/** E.164 without + for wa.me links (50255501234). */
export function phoneToWhatsAppDigits(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const normalized = normalizeGuatemalaPhone(phone);
  return normalized;
}

export function formatGuatemalaPhoneDisplay(phone: string): string {
  const normalized = normalizeGuatemalaPhone(phone);
  if (!normalized) return phone;
  const local = normalized.slice(3);
  return `${local.slice(0, 4)}-${local.slice(4)}`;
}
