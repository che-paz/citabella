import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getSalonSlugForHost } from "@/lib/vitrina/hosts";
import { getSiteUrl } from "@/lib/utils/site-url";

function isAppOnlyPath(pathname: string): boolean {
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname === "/catalogo" || pathname.startsWith("/catalogo/")) return true;
  // Do not match "/agendar" (public booking alias on salon domains).
  if (pathname === "/agenda" || pathname.startsWith("/agenda/")) return true;
  if (pathname === "/clientas" || pathname.startsWith("/clientas/")) return true;
  if (pathname === "/pagos" || pathname.startsWith("/pagos/")) return true;
  if (pathname === "/finanzas" || pathname.startsWith("/finanzas/")) return true;
  if (pathname === "/ajustes" || pathname.startsWith("/ajustes/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const slug = getSalonSlugForHost(host);
  const { pathname } = request.nextUrl;

  if (slug) {
    // Keep dashboard/login on the app host, not on the salon marketing domain.
    if (isAppOnlyPath(pathname)) {
      const appBase = getSiteUrl();
      return NextResponse.redirect(new URL(pathname + request.nextUrl.search, appBase));
    }

    if (pathname === "/" || pathname === "") {
      return updateSession(request, { rewritePath: `/vitrina/${slug}` });
    }

    if (pathname === "/agendar" || pathname === "/reservar") {
      return updateSession(request, { rewritePath: `/reservar/${slug}` });
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
