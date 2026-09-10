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

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isDashboardRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/catalogo") ||
    request.nextUrl.pathname.startsWith("/agenda") ||
    request.nextUrl.pathname.startsWith("/clientas") ||
    request.nextUrl.pathname.startsWith("/pagos") ||
    request.nextUrl.pathname.startsWith("/finanzas") ||
    request.nextUrl.pathname.startsWith("/ajustes");

  // On salon domains, "/" is the public vitrina (rewrite), not the dashboard.
  const isRewrittenHome =
    Boolean(options?.rewritePath) && request.nextUrl.pathname === "/";

  if (!user && isDashboardRoute && !isRewrittenHome) {
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
