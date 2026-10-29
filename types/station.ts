export type OperatorStatus = "operational" | "offline" | "unknown";
export type ReportStatus = "working" | "broken" | "busy";
export type Reliability = "verified" | "reported-broken" | "operator-offline" | "unverified";

export interface Connector {
  type: string;
  kw: number | null;
  quantity: number | null;
}

export interface ReportEvent {
  status: ReportStatus;
  at: string; // ISO timestamp
}

export interface ReportSummary {
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
