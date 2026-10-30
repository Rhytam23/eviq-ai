import { haversineKm } from "@/lib/format";
import type { Connector, ConnectorType, OperatorStatus, ProviderStation } from "@/types/station";

// Endpoints can be overridden (self-hosted Overpass mirror, or the mock registry used by the e2e tests).
const ocmUrl = () => process.env.OCM_API_URL || "https://api.openchargemap.io/v3/poi/";
// Public Overpass servers, tried in order. Some are unreachable from certain regions (e.g. India), so we fail over.
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
/** OVERPASS_API_URL (self-hosted or the e2e mock) is used alone; otherwise the public mirrors in order. */
const overpassUrls = (): string[] =>
  process.env.OVERPASS_API_URL ? [process.env.OVERPASS_API_URL] : OVERPASS_MIRRORS;
const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT = "EVIQ/0.3 (+https://eviq.ai)";
const REVALIDATE_SECONDS = 300;

const MAX_STATIONS = 200;

export interface SearchArea {
  lat: number;
  lng: number;
  radiusKm: number;
}

interface ProviderResult {
  source: "ocm" | "osm";
  stations: ProviderStation[];
  /** Set when the preferred provider failed and a fallback was used. */
  fallbackReason: string | null;
}

/* ---------------------------------- shared ---------------------------------- */

const RETRY_DELAY_MS = 400;

/** One retry on network errors, timeouts, 429 and 5xx. Other statuses are returned as they are. */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 1
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
    }
  }
}

export function normalizeConnectorType(title: string | null | undefined): ConnectorType {
  const t = (title ?? "").toLowerCase();
  if (/bharat[^a-z]*dc|dc-?001/.test(t)) return "Bharat DC";
  if (/bharat[^a-z]*ac|ac-?001/.test(t)) return "Bharat AC";
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
  origin?: { lat: number; lng: number }
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
    distanceKm: origin ? haversineKm(origin.lat, origin.lng, lat, lng) : null,
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
  return `${ocmUrl()}?${params.toString()}`;
}

async function fetchOcm(area: SearchArea, apiKey: string): Promise<ProviderStation[]> {
  const res = await fetchWithRetry(buildOcmUrl(area), {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
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
  origin?: { lat: number; lng: number }
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
    distanceKm: origin ? haversineKm(origin.lat, origin.lng, lat, lng) : null,
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
  return `${overpassUrls()[0]}?${new URLSearchParams({ data: buildOverpassQuery(area) }).toString()}`;
}

/** Runs an Overpass query against each mirror in turn; throws the last error if all of them fail. */
async function queryOverpass(query: string): Promise<unknown[]> {
  let lastError: unknown = new Error("No Overpass server configured");
  for (const base of overpassUrls()) {
    try {
      const res = await fetchWithRetry(
        `${base}?${new URLSearchParams({ data: query }).toString()}`,
        {
          headers: { Accept: "application/json", "User-Agent": USER_AGENT },
          next: { revalidate: REVALIDATE_SECONDS },
        },
        0
      );
      if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
      const data = (await res.json()) as { elements?: unknown };
      if (!Array.isArray(data.elements)) throw new Error("Overpass returned an unexpected payload");
      return data.elements;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function fetchOsm(area: SearchArea): Promise<ProviderStation[]> {
  const elements = await queryOverpass(buildOverpassQuery(area));
  return elements
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
  env: Record<string, string | undefined> = process.env
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

/* -------------------------------- single station -------------------------------- */

export function buildOcmByIdUrl(poiId: string): string {
  const params = new URLSearchParams({
    output: "json",
    chargepointid: poiId,
    compact: "false",
    verbose: "false",
  });
  return `${ocmUrl()}?${params.toString()}`;
}

export function buildOverpassByIdQuery(kind: "node" | "way" | "relation", id: string): string {
  return `[out:json][timeout:25];${kind}(${id});out center tags;`;
}

const OSM_KINDS = { n: "node", w: "way", r: "relation" } as const;

/**
 * Looks one station up by its EVIQ id (`ocm:123`, `osm:n456`). Returns null when the registry has no
 * such station, or for an `ocm:` id when no OCM key is configured. Throws on upstream failure.
 */
export async function fetchStationById(
  id: string,
  env: Record<string, string | undefined> = process.env
): Promise<ProviderStation | null> {
  if (id.startsWith("ocm:")) {
    if (!env.OCM_API_KEY) return null;
    const res = await fetchWithRetry(buildOcmByIdUrl(id.slice(4)), {
      headers: { "X-API-Key": env.OCM_API_KEY, Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`Open Charge Map responded ${res.status}`);
    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error("Open Charge Map returned an unexpected payload");
    return data[0] ? normalizeOcm(data[0] as OcmPoi) : null;
  }
  const kind = OSM_KINDS[id[4] as keyof typeof OSM_KINDS];
  if (!id.startsWith("osm:") || !kind) return null;
  const elements = await queryOverpass(buildOverpassByIdQuery(kind, id.slice(5)));
  return elements[0] ? normalizeOsm(elements[0] as OsmElement) : null;
}
