import { NextResponse, type NextRequest } from "next/server";
import { PREVIEW_COOKIE, PREVIEW_PATH, isCountryAllowed, visitorCountry } from "@/lib/launch";

/**
 * Outside the launch countries every page shows /coming-soon and every API call gets a 403.
 * Visiting /india opens the India map from anywhere and remembers that for a week.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === PREVIEW_PATH) {
    const response = NextResponse.redirect(new URL("/map", request.url));
    response.cookies.set(PREVIEW_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  }
  if (request.cookies.has(PREVIEW_COOKIE)) return NextResponse.next();
  if (isCountryAllowed(visitorCountry(request.headers))) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "EVIQ is launching in India first. Your region is coming soon." },
      { status: 403 }
    );
  }
  return NextResponse.rewrite(new URL("/coming-soon", request.url));
}

export const config = {
  // Health checks, crawler files, the service worker and static assets stay reachable from anywhere.
  matcher: [
    "/((?!coming-soon|api/health|_next/|robots.txt|sitemap.xml|manifest.webmanifest|sw.js|icon.svg|pwa-icon|maplibre|opengraph-image|.*\\.(?:png|jpg|svg|ico|webp|woff2?)$).*)",
  ],
};
