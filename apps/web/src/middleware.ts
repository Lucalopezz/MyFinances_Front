import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/backend";
import { isJwtExpired } from "@/lib/jwt";

const publicRoutes = ["/", "/login", "/register"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasExpiredToken = Boolean(token && isJwtExpired(token));
  const hasValidToken = Boolean(token && !hasExpiredToken);

  if (isPublicRoute(pathname)) {
    if (pathname !== "/" && hasValidToken) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const response = NextResponse.next();

    if (hasExpiredToken) {
      clearAuthCookie(response);
    }

    return response;
  }

  if (!token || hasExpiredToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);

    if (hasExpiredToken) {
      clearAuthCookie(response);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
