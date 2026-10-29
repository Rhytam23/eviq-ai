import { haversineKm } from "@/lib/format";
import type { Connector, ConnectorType, OperatorStatus, ProviderStation } from "@/types/station";

const OCM_URL = "https://api.openchargemap.io/v3/poi/";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const FETCH_TIMEOUT_MS = 20_000;
const REVALIDATE_SECONDS = 300;

export const MAX_STATIONS = 200;

export interface SearchArea {
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface ProviderResult {
  source: "ocm" | "osm";
  stations: ProviderStation[];
  /** Set when the preferred provider failed and a fallback was used. */
  fallbackReason: string | null;
}

/* ---------------------------------- shared ---------------------------------- */

export function normalizeConnectorType(title: string | null | undefined): ConnectorType {
  const t = (title ?? "").toLowerCase();
  if (/chademo/.test(t)) return "CHAdeMO";
  if (/ccs|combo/.test(t)) return "CCS";
  if (/nacs|tesla|supercharger/.test(t)) return "NACS";
  if (/type\s*2|mennekes|iec\s*62196-2/.test(t)) return "Type 2";
  if (/type\s*1|j-?1772/.test(t)) return "Type 1";
  return "Other";
}

/** Merge connectors of the same type and power so the UI shows one row per kind. */
function mergeConnectors(list: Connector[]): Connector[] {
  const merged = new Map<string, Connector>();
  for (const c of list) {
    const key = `${c.type}:${c.kw ?? "?"}`;
    const prev = merged.get(key);
    if (prev) {
      prev.quantity =
        prev.quantity === null || c.quantity === null ? null : prev.quantity + c.quantity;
    } else {
      merged.set(key, { ...c });
    }
  }
  return [...merged.values()].sort((a, b) => (b.kw ?? 0) - (a.kw ?? 0));
}

function maxKwOf(connectors: Connector[]): number | null {
  const values = connectors.map((c) => c.kw).filter((kw): kw is number => kw !== null);
  return values.length ? Math.max(...values) : null;
}

function positiveNumber(value: unknown): number | null {
  const n = typeof value === "string" ? parseFloat(value) : (value as number);
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
}

function clean(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/* ------------------------------- Open Charge Map ------------------------------ */

interface OcmConnection {
  ConnectionType?: { Title?: string; FormalName?: string | null } | null;
  PowerKW?: number | null;
  Quantity?: number | null;
}

export interface OcmPoi {
  ID?: number;
  StatusType?: { IsOperational?: boolean | null } | null;
  DateLastStatusUpdate?: string | null;
  UsageCost?: string | null;
  NumberOfPoints?: number | null;
  OperatorInfo?: { Title?: string | null } | null;
  AddressInfo?: {
    Title?: string | null;
    AddressLine1?: string | null;
    Town?: string | null;
    Latitude?: number | null;
    Longitude?: number | null;
  } | null;
  Connections?: OcmConnection[] | null;
}

function connectionTypeOf(c: OcmConnection): ConnectorType {
  const byTitle = normalizeConnectorType(c.ConnectionType?.Title);
  return byTitle !== "Other" ? byTitle : normalizeConnectorType(c.ConnectionType?.FormalName);
}

export function normalizeOcm(
  poi: OcmPoi,
  origin: { lat: number; lng: number }
): ProviderStation | null {
  const lat = poi.AddressInfo?.Latitude;
  const lng = poi.AddressInfo?.Longitude;
  if (typeof poi.ID !== "number" || typeof lat !== "number" || typeof lng !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const connectors = mergeConnectors(
    (poi.Connections ?? []).map((c) => ({
      type: connectionTypeOf(c),
      kw: positiveNumber(c.PowerKW),
      quantity: positiveNumber(c.Quantity),
    }))
  );

  const operational = poi.StatusType?.IsOperational;
  const operatorStatus: OperatorStatus =
    operational === true ? "operational" : operational === false ? "offline" : "unknown";

  const addressParts = [clean(poi.AddressInfo?.AddressLine1), clean(poi.AddressInfo?.Town)];
  const address = addressParts.filter(Boolean).join(", ") || null;

  return {
    id: `ocm:${poi.ID}`,
    source: "ocm",
    name: clean(poi.AddressInfo?.Title) ?? clean(poi.OperatorInfo?.Title) ?? "Charging station",
    operator: clean(poi.OperatorInfo?.Title),
    lat,
    lng,
    address,
    distanceKm: haversineKm(origin.lat, origin.lng, lat, lng),
    points: positiveNumber(poi.NumberOfPoints),
    maxKw: maxKwOf(connectors),
    connectors,
    operatorStatus,
    statusUpdatedAt: clean(poi.DateLastStatusUpdate),
    cost: clean(poi.UsageCost),
  };
}

export function buildOcmUrl(area: SearchArea): string {
  const params = new URLSearchParams({
    output: "json",
    latitude: String(area.lat),
    longitude: String(area.lng),
    distance: String(area.radiusKm),
    distanceunit: "KM",
    maxresults: String(MAX_STATIONS),
    compact: "false",
    verbose: "false",
  });
  return `${OCM_URL}?${params.toString()}`;
}

async function fetchOcm(area: SearchArea, apiKey: string): Promise<ProviderStation[]> {
  const res = await fetch(buildOcmUrl(area), {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Open Charge Map responded ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Open Charge Map returned an unexpected payload");
  return data
    .map((poi) => normalizeOcm(poi as OcmPoi, area))
    .filter((s): s is ProviderStation => s !== null);
}

/* ---------------------------- OpenStreetMap (Overpass) ------------------------- */

export interface OsmElement {
  type?: "node" | "way" | "relation";
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
}

const OSM_SOCKETS: { tag: string; type: ConnectorType }[] = [
  { tag: "socket:type2_combo", type: "CCS" },
  { tag: "socket:ccs", type: "CCS" },
  { tag: "socket:chademo", type: "CHAdeMO" },
  { tag: "socket:nacs", type: "NACS" },
  { tag: "socket:tesla_supercharger", type: "NACS" },
  { tag: "socket:tesla_destination", type: "NACS" },
  { tag: "socket:type2", type: "Type 2" },
  { tag: "socket:type2_cable", type: "Type 2" },
  { tag: "socket:type1", type: "Type 1" },
  { tag: "socket:type1_combo", type: "CCS" },
];

/** OSM power values look like "22 kW", "150000" (watts) or "11.5". Returns kW. */
export function parseOsmKw(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/^\s*(\d+(?:[.,]\d+)?)\s*(kw|w)?\s*$/i);
  if (!match) return null;
  const n = parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = match[2]?.toLowerCase();
  if (unit === "kw") return n;
  if (unit === "w" || n >= 1000) return n / 1000;
  return n;
}

export function normalizeOsm(
  el: OsmElement,
  origin: { lat: number; lng: number }
): ProviderStation | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!el.type || typeof el.id !== "number" || typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }
  const tags = el.tags ?? {};

  const connectors: Connector[] = [];
  for (const { tag, type } of OSM_SOCKETS) {
    const count = tags[tag];
    if (!count || count === "no") continue;
    const quantity = /^\d+$/.test(count) ? parseInt(count, 10) : null;
    connectors.push({ type, kw: parseOsmKw(tags[`${tag}:output`]), quantity });
  }
  const merged = mergeConnectors(connectors);

  const capacity = /^\d+$/.test(tags.capacity ?? "") ? parseInt(tags.capacity, 10) : null;
  const operator = clean(tags.operator) ?? clean(tags.brand) ?? clean(tags.network);
  const street = [clean(tags["addr:street"]), clean(tags["addr:housenumber"])]
    .filter(Boolean)
    .join(" ");
  const address = [street, clean(tags["addr:city"])].filter(Boolean).join(", ") || null;

  let cost: string | null = null;
  if (tags.fee === "no") cost = "Free";
  else if (clean(tags.charge)) cost = clean(tags.charge);
  else if (tags.fee === "yes") cost = "Paid (price not listed)";

  const broken = tags.operational_status === "broken";

  return {
    id: `osm:${el.type[0]}${el.id}`,
    source: "osm",
    name: clean(tags.name) ?? operator ?? "Charging station",
    operator,
    lat,
    lng,
    address,
    distanceKm: haversineKm(origin.lat, origin.lng, lat, lng),
    points: capacity,
    maxKw: maxKwOf(merged),
    connectors: merged,
    operatorStatus: broken ? "offline" : "unknown",
    statusUpdatedAt: null,
    cost,
  };
}

export function buildOverpassQuery(area: SearchArea): string {
  const around = `around:${Math.round(area.radiusKm * 1000)},${area.lat},${area.lng}`;
  return (
    `[out:json][timeout:25];(` +
    `node["amenity"="charging_station"]["motor_vehicle"!="no"](${around});` +
    `way["amenity"="charging_station"]["motor_vehicle"!="no"](${around});` +
    `);out center tags ${MAX_STATIONS * 2};`
  );
}

export function buildOverpassUrl(area: SearchArea): string {
  return `${OVERPASS_URL}?${new URLSearchParams({ data: buildOverpassQuery(area) }).toString()}`;
}

async function fetchOsm(area: SearchArea): Promise<ProviderStation[]> {
  const res = await fetch(buildOverpassUrl(area), {
    headers: { Accept: "application/json", "User-Agent": "EVIQ/0.2 (+https://eviq.ai)" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
  const data = (await res.json()) as { elements?: unknown };
  if (!Array.isArray(data.elements)) throw new Error("Overpass returned an unexpected payload");
  return data.elements
    .map((el) => normalizeOsm(el as OsmElement, area))
    .filter((s): s is ProviderStation => s !== null);
}

/* -------------------------------- orchestration -------------------------------- */

function nearest(stations: ProviderStation[]): ProviderStation[] {
  return stations
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    .slice(0, MAX_STATIONS);
}

/** Open Charge Map when a key is configured, OpenStreetMap otherwise (or if OCM fails). */
export async function fetchStations(
  area: SearchArea,
  env: { OCM_API_KEY?: string } = process.env
): Promise<ProviderResult> {
  let fallbackReason: string | null = null;
  if (env.OCM_API_KEY) {
    try {
      return {
        source: "ocm",
        stations: nearest(await fetchOcm(area, env.OCM_API_KEY)),
        fallbackReason,
      };
    } catch (err) {
      fallbackReason = err instanceof Error ? err.message : "Open Charge Map failed";
    }
  }
  return { source: "osm", stations: nearest(await fetchOsm(area)), fallbackReason };
}
