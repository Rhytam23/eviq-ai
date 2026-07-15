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

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") ?? "15";
  const pageSize = searchParams.get("pageSize") ?? "100";
  const greaterThanId = searchParams.get("greaterThanId") ?? "0";

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const ocmKey = process.env.NEXT_PUBLIC_OCM_API_KEY;
  if (!ocmKey) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_OCM_API_KEY environment variable is not set" },
      { status: 500 }
    );
  }

  let url =
    `https://api.openchargemap.io/v3/poi/` +
    `?output=json` +
    `&latitude=${lat}&longitude=${lng}` +
    `&distance=${radius}&distanceunit=Miles` +
    `&maxresults=${pageSize}` +
    `&compact=false&verbose=false`;

  if (parseInt(greaterThanId) > 0) {
    url += `&greaterthanid=${greaterThanId}&sortby=id_asc`;
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
        { status: ocmRes.status }
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
    // Return empty array so the client never sees an unhandled error
    return NextResponse.json([], { status: 200 });
  }
}
