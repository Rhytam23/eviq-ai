import { NextResponse } from "next/server";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

/** Public, short-lived caching: statuses change with every report, so keep it brief. */
export const PUBLIC_CACHE = "public, s-maxage=30, stale-while-revalidate=60";

export function publicJson(
  body: unknown,
  init: { status?: number; cache?: string; headers?: Record<string, string> } = {}
) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": init.cache ?? "no-store",
      ...init.headers,
    },
  });
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
