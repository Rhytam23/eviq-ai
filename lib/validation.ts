import type { ReportStatus } from "@/types/station";

const MAX_RADIUS_KM = 50;
const DEFAULT_RADIUS_KM = 10;
export const MAX_BODY_BYTES = 1024;

const STATION_ID = /^(ocm:\d{1,10}|osm:[nwr]\d{1,15})$/;
const REPORT_STATUSES: readonly ReportStatus[] = ["working", "broken", "busy"];

export function isStationId(value: unknown): value is string {
  return typeof value === "string" && STATION_ID.test(value);
}

function isReportStatus(value: unknown): value is ReportStatus {
  return typeof value === "string" && (REPORT_STATUSES as readonly string[]).includes(value);
}

interface StationQuery {
  lat: number;
  lng: number;
  radiusKm: number;
}

function parseNumber(raw: string | null): number | null {
  if (raw === null || raw.trim() === "" || raw.length > 20) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function parseStationQuery(
  params: URLSearchParams
): { ok: true; value: StationQuery } | { ok: false; error: string } {
  const lat = parseNumber(params.get("lat"));
  const lng = parseNumber(params.get("lng"));
  if (lat === null || lat < -90 || lat > 90)
    return { ok: false, error: "lat must be between -90 and 90" };
  if (lng === null || lng < -180 || lng > 180)
    return { ok: false, error: "lng must be between -180 and 180" };

  let radiusKm = DEFAULT_RADIUS_KM;
  if (params.has("radiusKm")) {
    const r = parseNumber(params.get("radiusKm"));
    if (r === null || r < 1 || r > MAX_RADIUS_KM) {
      return { ok: false, error: `radiusKm must be between 1 and ${MAX_RADIUS_KM}` };
    }
    radiusKm = r;
  }
  // Round to ~110 m so nearby requests share the upstream cache.
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { ok: true, value: { lat: round(lat), lng: round(lng), radiusKm } };
}

export function parseReportBody(
  body: unknown
): { ok: true; value: { stationId: string; status: ReportStatus } } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const { stationId, status, ...extra } = body as Record<string, unknown>;
  if (Object.keys(extra).length > 0) return { ok: false, error: "Unknown fields" };
  if (!isStationId(stationId)) return { ok: false, error: "Invalid stationId" };
  if (!isReportStatus(status))
    return { ok: false, error: "status must be working, broken or busy" };
  return { ok: true, value: { stationId, status } };
}
