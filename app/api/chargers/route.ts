/**
 * GET /api/chargers?lat=&lng=&radius=&pageSize=&greaterThanId=
 *
 * Server-side proxy for Open Charge Map API.
 * Runs on the Next.js server — completely bypasses browser Chrome extensions
 * that wrap window.fetch and cause "TypeError: Failed to fetch" errors.
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radius = Number(searchParams.get("radius") ?? "15");
  const pageSize = Number(searchParams.get("pageSize") ?? "100");
  const greaterThanId = Number(searchParams.get("greaterThanId") ?? "0");

  if (
    searchParams.get("lat") === null ||
    searchParams.get("lng") === null ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return NextResponse.json({ error: "valid lat and lng are required" }, { status: 400 });
  }

  // Server-only key is preferred; the NEXT_PUBLIC_ name is kept as a fallback for existing setups.
  const ocmKey = process.env.OCM_API_KEY ?? process.env.NEXT_PUBLIC_OCM_API_KEY;
  if (!ocmKey) {
    return NextResponse.json(
      { error: "OCM_API_KEY environment variable is not set" },
      { status: 500 }
    );
  }

  // Clamp client-controlled values so this proxy can't be used to issue arbitrary-size OCM queries
  const safeRadius = Number.isFinite(radius) ? Math.min(Math.max(radius, 1), 100) : 15;
  const safePageSize = Number.isFinite(pageSize)
    ? Math.min(Math.max(Math.floor(pageSize), 1), 200)
    : 100;
  const safeGreaterThanId = Number.isFinite(greaterThanId)
    ? Math.max(0, Math.floor(greaterThanId))
    : 0;

  let url =
    `https://api.openchargemap.io/v3/poi/` +
    `?output=json` +
    `&latitude=${lat}&longitude=${lng}` +
    `&distance=${safeRadius}&distanceunit=Miles` +
    `&maxresults=${safePageSize}` +
    `&compact=false&verbose=false`;

  if (safeGreaterThanId > 0) {
    url += `&greaterthanid=${safeGreaterThanId}&sortby=id_asc`;
  }

  try {
    const ocmRes = await fetch(url, {
      headers: {
        "X-API-Key": ocmKey,
        "User-Agent": "EviqAiDemoEnterpriseApplication/1.0",
      },
      // Node.js server-side fetch has no 4-second browser timeout issue
      signal: AbortSignal.timeout(12000),
    });

    if (!ocmRes.ok) {
      return NextResponse.json(
        { error: `OCM API error ${ocmRes.status}: ${ocmRes.statusText}` },
        { status: 502 }
      );
    }

    const data = await ocmRes.json();
    return NextResponse.json(data, {
      headers: {
        // Cache for 60 seconds — reduces repeated OCM calls for the same area
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      },
    });
  } catch (err: any) {
    console.error("[/api/chargers] Proxy fetch failed:", err?.message ?? err);
    // Surface the failure instead of masking it as "no stations"; the client handles non-OK responses
    return NextResponse.json({ error: "Upstream charger lookup failed" }, { status: 502 });
  }
}
