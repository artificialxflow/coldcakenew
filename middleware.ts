import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth/constants";

const OLD_PANEL_PATHS: [string, string][] = [
  ["/dashboard", "/admin/dashboard"],
  ["/products", "/admin/products"],
  ["/messages", "/admin/messages"],
  ["/reports", "/admin/reports"],
  ["/gold-price", "/admin/gold-price"],
  ["/analytics", "/admin/analytics"],
  ["/content", "/admin/content"],
  ["/maps-scraper", "/admin/maps-scraper"],
  ["/workflows", "/admin/workflows"],
  ["/settings", "/admin/settings"],
  ["/orders", "/admin/orders"],
  ["/blog-admin", "/admin/blog-admin"],
];

const PROTECTED_PATHS = ["/admin"];
const ADMIN_LOGIN = "/admin/login";
const AUTH_PATHS = ["/auth/login", "/auth/register"];

export function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    for (const [oldPath, newPath] of OLD_PANEL_PATHS) {
      if (pathname === oldPath || pathname.startsWith(oldPath + "/")) {
        const url = req.nextUrl.clone();
        url.pathname = pathname === oldPath ? newPath : newPath + pathname.slice(oldPath.length);
        return NextResponse.redirect(url);
      }
    }

    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path)) && !pathname.startsWith(ADMIN_LOGIN);
    const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const isAuthenticated = !!token;

    if (isProtected && !isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    if (isAuthPath && isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error instanceof Error ? error.message : String(error));
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/products",
    "/products/:path*",
    "/messages/:path*",
    "/reports/:path*",
    "/gold-price/:path*",
    "/analytics/:path*",
    "/content/:path*",
    "/maps-scraper/:path*",
    "/workflows/:path*",
    "/settings/:path*",
    "/orders/:path*",
    "/blog-admin/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};


