import { NextResponse, type NextRequest } from "next/server";
import { isCountryAllowed, visitorCountry } from "@/lib/launch";

/** Outside the launch countries every page shows /coming-soon and every API call gets a 403. */
export function proxy(request: NextRequest) {
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
