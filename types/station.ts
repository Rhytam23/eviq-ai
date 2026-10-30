export type OperatorStatus = "operational" | "offline" | "unknown";
export type ReportStatus = "working" | "broken" | "busy";
export type Reliability = "verified" | "reported-broken" | "operator-offline" | "unverified";

export const CONNECTOR_TYPES = [
  "CCS",
  "CHAdeMO",
  "NACS",
  "Type 2",
  "Type 1",
  "Bharat DC",
  "Bharat AC",
  "Other",
] as const;
export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

export interface Connector {
  type: ConnectorType;
  kw: number | null;
  quantity: number | null;
}

export interface ReportEvent {
  status: ReportStatus;
  at: string; // ISO timestamp
}

interface ReportSummary {
  /** Reports inside the freshness window, newest first (capped). */
  recent: ReportEvent[];
}

export interface Station {
  id: string;
  source: "ocm" | "osm";
  name: string;
  operator: string | null;
  lat: number;
  lng: number;
  address: string | null;
  distanceKm: number | null;
  points: number | null;
  maxKw: number | null;
  connectors: Connector[];
  operatorStatus: OperatorStatus;
  statusUpdatedAt: string | null;
  cost: string | null;
  reports: ReportSummary;
  reliability: Reliability;
  verifiedAt: string | null;
}

/** What a data provider knows about a station, before driver reports are merged in. */
export type ProviderStation = Omit<Station, "reports" | "reliability" | "verifiedAt">;
