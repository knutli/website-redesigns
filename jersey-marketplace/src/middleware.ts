import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/locker", "/wishlist", "/settings", "/upload", "/buying", "/selling", "/admin", "/profile"];

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth check for protected routes
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const hasSession = req.cookies.has("better-auth.session_token") ||
      req.cookies.has("__Secure-better-auth.session_token");
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
