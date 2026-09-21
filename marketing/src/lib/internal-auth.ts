import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "gc_interna";

function expectedToken(password: string): string {
  return createHmac("sha256", password).update("gota-interna-v1").digest("hex");
}

export function getInternalPassword(): string | null {
  const p = process.env.INTERNAL_TOOLS_PASSWORD?.trim();
  return p && p.length >= 8 ? p : null;
}

export function isInternalAuthenticated(): boolean {
  const password = getInternalPassword();
  if (!password) return false;
  const cookie = cookies().get(COOKIE)?.value;
  if (!cookie) return false;
  const expected = expectedToken(password);
  try {
    const a = Buffer.from(cookie, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function setInternalSessionCookie(): void {
  const password = getInternalPassword();
  if (!password) throw new Error("INTERNAL_TOOLS_PASSWORD no configurada");
  cookies().set(COOKIE, expectedToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearInternalSessionCookie(): void {
  cookies().set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function verifyInternalPassword(input: string): boolean {
  const password = getInternalPassword();
  if (!password) return false;
  try {
    const a = Buffer.from(input, "utf8");
    const b = Buffer.from(password, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
