import { clientIp, hashIp } from "@/lib/clientId";
import { PUBLIC_CACHE, preflight, publicJson } from "@/lib/http";
import { rateLimit } from "@/lib/rateLimit";
import { getStation } from "@/lib/stationService";
import { isStationId } from "@/lib/validation";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(`v1:${hashIp(clientIp(request.headers))}`, 60, 60_000);
  if (!limited.allowed) {
    return publicJson(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }
  const { id: raw } = await params;
  const id = decodeURIComponent(raw);
  if (!isStationId(id)) return publicJson({ error: "Invalid station id" }, { status: 400 });

  try {
    const lookup = await getStation(id);
    if (!lookup.found) return publicJson({ error: "Station not found" }, { status: 404 });
    return publicJson(
      {
        station: lookup.station,
        storage: lookup.storage,
        reportsAvailable: lookup.reportsAvailable,
      },
      { cache: PUBLIC_CACHE }
    );
  } catch (err) {
    console.error("Station lookup failed", err);
    return publicJson({ error: "Charger data is temporarily unavailable." }, { status: 502 });
  }
}
