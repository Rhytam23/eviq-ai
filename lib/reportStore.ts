import type { ReportEvent, ReportStatus } from "@/types/station";
import { COOLDOWN_MINUTES, REPORT_RETENTION_HOURS } from "@/lib/reliability";

/** At most this many recent reports are returned per station. */
const MAX_REPORTS_PER_STATION = 20;

const MINUTE = 60_000;
const HOUR = 3_600_000;

export type StorageKind = "supabase" | "memory";

type AddReportResult = { ok: true } | { ok: false; reason: "cooldown"; retryAfterSec: number };

interface ReportStore {
  kind: StorageKind;
  add(input: {
    stationId: string;
    status: ReportStatus;
    clientHash: string;
  }): Promise<AddReportResult>;
  recent(stationIds: string[]): Promise<Map<string, ReportEvent[]>>;
  /** Throws if the store cannot be reached. */
  ping(): Promise<void>;
  /** Aggregate numbers for the admin page. No identifiers leave the store. */
  stats(): Promise<ReportStats>;
}

export interface ReportStats {
  last24h: number;
  last7d: number;
  distinctClients7d: number;
  stationsReported7d: number;
  /** True when more rows existed than were counted, so the numbers are lower bounds. */
  truncated: boolean;
}

const STATS_ROW_LIMIT = 10_000;

function summarise(
  rows: { stationId: string; clientHash: string; at: string }[],
  now: number,
  truncated: boolean
): ReportStats {
  const day = now - 24 * HOUR;
  return {
    last24h: rows.filter((r) => Date.parse(r.at) >= day).length,
    last7d: rows.length,
    distinctClients7d: new Set(rows.map((r) => r.clientHash)).size,
    stationsReported7d: new Set(rows.map((r) => r.stationId)).size,
    truncated,
  };
}

/* ----------------------------------- memory ----------------------------------- */

interface StoredReport extends ReportEvent {
  stationId: string;
  clientHash: string;
}

const MEMORY_CAP = 20_000;

export function createMemoryStore(now: () => number = Date.now): ReportStore {
  let rows: StoredReport[] = [];

  return {
    kind: "memory",
    async add({ stationId, status, clientHash }) {
      const t = now();
      rows = rows.filter((r) => t - Date.parse(r.at) < REPORT_RETENTION_HOURS * HOUR);
      const last = rows
        .filter((r) => r.stationId === stationId && r.clientHash === clientHash)
        .map((r) => Date.parse(r.at))
        .sort((a, b) => b - a)[0];
      if (last !== undefined && t - last < COOLDOWN_MINUTES * MINUTE) {
        return {
          ok: false,
          reason: "cooldown",
          retryAfterSec: Math.ceil((last + COOLDOWN_MINUTES * MINUTE - t) / 1000),
        };
      }
      rows.push({ stationId, clientHash, status, at: new Date(t).toISOString() });
      if (rows.length > MEMORY_CAP) rows = rows.slice(rows.length - MEMORY_CAP);
      return { ok: true };
    },
    async recent(stationIds) {
      const wanted = new Set(stationIds);
      const t = now();
      const out = new Map<string, ReportEvent[]>();
      for (const r of [...rows].reverse()) {
        if (!wanted.has(r.stationId) || t - Date.parse(r.at) >= REPORT_RETENTION_HOURS * HOUR)
          continue;
        const list = out.get(r.stationId) ?? [];
        if (list.length < MAX_REPORTS_PER_STATION) list.push({ status: r.status, at: r.at });
        out.set(r.stationId, list);
      }
      return out;
    },
    async ping() {},
    async stats() {
      const t = now();
      const week = rows.filter((r) => t - Date.parse(r.at) < 7 * 24 * HOUR);
      return summarise(week, t, false);
    },
  };
}

/* ---------------------------------- supabase ---------------------------------- */

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

function quoteListValue(value: string): string {
  return `"${value.replace(/["\\]/g, "")}"`;
}

export function createSupabaseStore(
  config: SupabaseConfig,
  now: () => number = Date.now
): ReportStore {
  const base = `${config.url.replace(/\/+$/, "")}/rest/v1/reports`;
  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    "Content-Type": "application/json",
  };
  const request = (url: string, init?: RequestInit) =>
    fetch(url, {
      ...init,
      headers: { ...headers, ...init?.headers },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

  return {
    kind: "supabase",
    async add({ stationId, status, clientHash }) {
      const since = new Date(now() - COOLDOWN_MINUTES * MINUTE).toISOString();
      const lookup = new URLSearchParams({
        select: "created_at",
        station_id: `eq.${stationId}`,
        client_hash: `eq.${clientHash}`,
        created_at: `gte.${since}`,
        order: "created_at.desc",
        limit: "1",
      });
      const found = await request(`${base}?${lookup.toString()}`);
      if (!found.ok) throw new Error(`Supabase lookup failed (${found.status})`);
      const rows = (await found.json()) as { created_at: string }[];
      if (rows.length > 0) {
        const last = Date.parse(rows[0].created_at);
        return {
          ok: false,
          reason: "cooldown",
          retryAfterSec: Math.max(1, Math.ceil((last + COOLDOWN_MINUTES * MINUTE - now()) / 1000)),
        };
      }
      const insert = await request(base, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ station_id: stationId, status, client_hash: clientHash }),
      });
      if (!insert.ok) throw new Error(`Supabase insert failed (${insert.status})`);
      return { ok: true };
    },
    async recent(stationIds) {
      const out = new Map<string, ReportEvent[]>();
      if (stationIds.length === 0) return out;
      const since = new Date(now() - REPORT_RETENTION_HOURS * HOUR).toISOString();
      const query = new URLSearchParams({
        select: "station_id,status,created_at",
        station_id: `in.(${stationIds.map(quoteListValue).join(",")})`,
        created_at: `gte.${since}`,
        order: "created_at.desc",
        limit: "5000",
      });
      const res = await request(`${base}?${query.toString()}`);
      if (!res.ok) throw new Error(`Supabase read failed (${res.status})`);
      const rows = (await res.json()) as {
        station_id: string;
        status: ReportStatus;
        created_at: string;
      }[];
      for (const r of rows) {
        const list = out.get(r.station_id) ?? [];
        if (list.length < MAX_REPORTS_PER_STATION)
          list.push({ status: r.status, at: r.created_at });
        out.set(r.station_id, list);
      }
      return out;
    },
    async ping() {
      const res = await request(
        `${base}?${new URLSearchParams({ select: "id", limit: "1" }).toString()}`
      );
      if (!res.ok) throw new Error(`Supabase ping failed (${res.status})`);
    },
    async stats() {
      const since = new Date(now() - 7 * 24 * HOUR).toISOString();
      const query = new URLSearchParams({
        select: "station_id,client_hash,created_at",
        created_at: `gte.${since}`,
        order: "created_at.desc",
        limit: String(STATS_ROW_LIMIT),
      });
      const res = await request(`${base}?${query.toString()}`);
      if (!res.ok) throw new Error(`Supabase stats failed (${res.status})`);
      const data = (await res.json()) as {
        station_id: string;
        client_hash: string;
        created_at: string;
      }[];
      return summarise(
        data.map((r) => ({ stationId: r.station_id, clientHash: r.client_hash, at: r.created_at })),
        now(),
        data.length >= STATS_ROW_LIMIT
      );
    },
  };
}

/* ------------------------------------ select ----------------------------------- */

const globalForStore = globalThis as unknown as { __eviqMemoryStore?: ReportStore };

export function getReportStore(env: NodeJS.ProcessEnv = process.env): ReportStore {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    return createSupabaseStore({
      url: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }
  // Kept on globalThis so dev hot reloads do not wipe it. Not shared across serverless instances.
  globalForStore.__eviqMemoryStore ??= createMemoryStore();
  return globalForStore.__eviqMemoryStore;
}
