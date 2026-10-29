import { NextResponse } from "next/server";
import { fetchStations } from "@/lib/providers";
import { computeReliability } from "@/lib/reliability";
import { getReportStore } from "@/lib/reportStore";
import { clientIp, hashIp } from "@/lib/clientId";
import { rateLimit } from "@/lib/rateLimit";
import { parseStationQuery } from "@/lib/validation";
import type { Station } from "@/types/station";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = rateLimit(`stations:${hashIp(clientIp(request.headers))}`, 60, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const parsed = parseStationQuery(new URL(request.url).searchParams);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  let provider;
  try {
    provider = await fetchStations(parsed.value);
  } catch (err) {
    console.error("Station provider failed", err);
    return NextResponse.json(
      { error: "Charger data is temporarily unavailable. Try again in a moment." },
      { status: 502 }
    );
  }

  const store = getReportStore();
  let reports = new Map<string, Station["reports"]["recent"]>();
  let reportsAvailable = true;
  try {
    reports = await store.recent(provider.stations.map((s) => s.id));
  } catch (err) {
    console.error("Report store read failed", err);
    reportsAvailable = false;
  }

  const now = Date.now();
  const stations: Station[] = provider.stations.map((s) => {
    const recent = reports.get(s.id) ?? [];
    const { reliability, verifiedAt } = computeReliability(s.operatorStatus, recent, now);
    return { ...s, reports: { recent }, reliability, verifiedAt };
  });

  return NextResponse.json(
    {
      stations,
      source: provider.source,
      fallbackReason: provider.fallbackReason,
      storage: store.kind,
      reportsAvailable,
      fetchedAt: new Date(now).toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
