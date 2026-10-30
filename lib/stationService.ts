import { fetchStationById, fetchStations, type SearchArea } from "@/lib/providers";
import { computeReliability } from "@/lib/reliability";
import { getReportStore, type StorageKind } from "@/lib/reportStore";
import type { ProviderStation, ReportEvent, Station } from "@/types/station";

interface StationsResult {
  stations: Station[];
  source: "ocm" | "osm";
  fallbackReason: string | null;
  storage: StorageKind;
  reportsAvailable: boolean;
  fetchedAt: string;
}

function withStatus(s: ProviderStation, recent: ReportEvent[], now: number): Station {
  const { reliability, verifiedAt } = computeReliability(s.operatorStatus, recent, now);
  return { ...s, reports: { recent }, reliability, verifiedAt };
}

/** Provider stations merged with driver reports and a computed status. Throws if no provider answers. */
export async function getStations(area: SearchArea): Promise<StationsResult> {
  const provider = await fetchStations(area);
  const store = getReportStore();
  let reports = new Map<string, ReportEvent[]>();
  let reportsAvailable = true;
  try {
    reports = await store.recent(provider.stations.map((s) => s.id));
  } catch (err) {
    console.error("Report store read failed", err);
    reportsAvailable = false;
  }
  const now = Date.now();
  return {
    stations: provider.stations.map((s) => withStatus(s, reports.get(s.id) ?? [], now)),
    source: provider.source,
    fallbackReason: provider.fallbackReason,
    storage: store.kind,
    reportsAvailable,
    fetchedAt: new Date(now).toISOString(),
  };
}

export type StationLookup =
  | { found: true; station: Station; storage: StorageKind; reportsAvailable: boolean }
  | { found: false };

/** One station by EVIQ id. Throws if the registry cannot be reached. */
export async function getStation(id: string): Promise<StationLookup> {
  const base = await fetchStationById(id);
  if (!base) return { found: false };
  const store = getReportStore();
  let recent: ReportEvent[] = [];
  let reportsAvailable = true;
  try {
    recent = (await store.recent([id])).get(id) ?? [];
  } catch (err) {
    console.error("Report store read failed", err);
    reportsAvailable = false;
  }
  return {
    found: true,
    station: withStatus(base, recent, Date.now()),
    storage: store.kind,
    reportsAvailable,
  };
}
