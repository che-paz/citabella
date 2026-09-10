import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type SessionOptions = {
  /** Internal pathname to rewrite to (URL bar unchanged). */
  rewritePath?: string;
};

function buildResponse(request: NextRequest, options?: SessionOptions) {
  if (options?.rewritePath) {
    const url = request.nextUrl.clone();
    url.pathname = options.rewritePath;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next({ request });
}

export async function updateSession(
  request: NextRequest,
  options?: SessionOptions
) {
  let supabaseResponse = buildResponse(request, options);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = buildResponse(request, options);
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            supabaseResponse.cookies.set(name, value, cookieOptions)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/login/");
  const isDashboardRoute =
    pathname === "/" ||
    pathname === "/catalogo" ||
    pathname.startsWith("/catalogo/") ||
    // Exact /agenda — not public /agendar on salon domains
    pathname === "/agenda" ||
    pathname.startsWith("/agenda/") ||
    pathname === "/clientas" ||
    pathname.startsWith("/clientas/") ||
    pathname === "/pagos" ||
    pathname.startsWith("/pagos/") ||
    pathname === "/finanzas" ||
    pathname.startsWith("/finanzas/") ||
    pathname === "/ajustes" ||
    pathname.startsWith("/ajustes/");

  // Salon-domain rewrites (vitrina / booking) are always public.
  if (options?.rewritePath) {
    return supabaseResponse;
  }

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
