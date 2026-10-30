import { NextResponse } from "next/server";
import { clientIp, hashIp } from "@/lib/clientId";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

interface NominatimHit {
  display_name?: string;
  lat?: string;
  lon?: string;
}

/**
 * City search through Nominatim. It is called on submit only (never per keystroke), identified
 * with a real User-Agent, limited per client and cached for a day, per the Nominatim usage policy.
 */
export async function GET(request: Request) {
  const limited = rateLimit(`geocode:${hashIp(clientIp(request.headers))}`, 20, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many searches" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 100) {
    return NextResponse.json({ error: "Enter 2 to 100 characters" }, { status: 400 });
  }

  const url = `${NOMINATIM_URL}?${new URLSearchParams({ q, format: "jsonv2", limit: "5" }).toString()}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EVIQ/0.2 (+https://eviq.ai; founders@eviq.ai)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86_400 },
    });
    if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);
    const hits = (await res.json()) as NominatimHit[];
    const places = hits
      .map((h) => ({ name: h.display_name ?? "", lat: Number(h.lat), lng: Number(h.lon) }))
      .filter((p) => p.name && Number.isFinite(p.lat) && Number.isFinite(p.lng));
    return NextResponse.json({ places });
  } catch (err) {
    console.error("Geocoding failed", err);
    return NextResponse.json({ error: "Search is unavailable right now" }, { status: 502 });
  }
}
