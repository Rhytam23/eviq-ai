import { clientIp, hashIp } from "@/lib/clientId";
import { PUBLIC_CACHE, preflight, publicJson } from "@/lib/http";
import { rateLimit } from "@/lib/rateLimit";
import { getReportStore } from "@/lib/reportStore";
import { isStationId } from "@/lib/validation";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

/** Raw recent reports for a station (no registry lookup, so it works for any valid id). */
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

  const store = getReportStore();
  try {
    const reports = (await store.recent([id])).get(id) ?? [];
    return publicJson({ stationId: id, reports, storage: store.kind }, { cache: PUBLIC_CACHE });
  } catch (err) {
    console.error("Report store read failed", err);
    return publicJson({ error: "Reports are temporarily unavailable." }, { status: 503 });
  }
}
