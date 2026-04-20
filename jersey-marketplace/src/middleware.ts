import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/locker", "/wishlist", "/settings", "/upload", "/buying", "/selling", "/admin", "/profile"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  // Better Auth sets its session cookie (default name "better-auth.session_token")
  const hasSession = req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
