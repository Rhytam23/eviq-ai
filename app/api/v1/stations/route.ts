import { clientIp, hashIp } from "@/lib/clientId";
import { PUBLIC_CACHE, preflight, publicJson } from "@/lib/http";
import { recordEvent } from "@/lib/metrics";
import { rateLimit } from "@/lib/rateLimit";
import { getStations } from "@/lib/stationService";
import { parseStationQuery } from "@/lib/validation";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(request: Request) {
  const limited = rateLimit(`v1:${hashIp(clientIp(request.headers))}`, 60, 60_000);
  if (!limited.allowed) {
    return publicJson(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const parsed = parseStationQuery(new URL(request.url).searchParams);
  if (!parsed.ok) return publicJson({ error: parsed.error }, { status: 400 });

  try {
    const result = await getStations(parsed.value);
    recordEvent("map_search");
    return publicJson(result, { cache: PUBLIC_CACHE });
  } catch (err) {
    console.error("Station provider failed", err);
    return publicJson(
      { error: "Charger data is temporarily unavailable. Try again in a moment." },
      { status: 502 }
    );
  }
}
