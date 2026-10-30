/**
 * Privacy-friendly product metrics: daily counters per event name. No identifiers, no IPs, no
 * per-user rows. Recorded server-side when an endpoint is used, so nothing runs in the visitor's browser.
 */
export const METRIC_NAMES = [
  "map_search",
  "report_working",
  "report_broken",
  "report_busy",
  "share_view",
  "qr_view",
] as const;
type MetricName = (typeof METRIC_NAMES)[number];

interface MetricRow {
  day: string; // YYYY-MM-DD (UTC)
  name: MetricName;
  count: number;
}

// On globalThis because Next bundles route handlers and pages separately; module state would not be shared.
const globalForMetrics = globalThis as unknown as { __eviqMetrics?: Map<string, number> };
const memory = (globalForMetrics.__eviqMetrics ??= new Map<string, number>());

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function supabaseConfig(env: NodeJS.ProcessEnv = process.env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const root = env.SUPABASE_URL.replace(/\/+$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    root,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  };
}

/** Fire and forget: a failed counter must never break a request. */
export function recordEvent(name: MetricName): void {
  const cfg = supabaseConfig();
  if (!cfg) {
    const key = `${today()}|${name}`;
    memory.set(key, (memory.get(key) ?? 0) + 1);
    return;
  }
  void fetch(`${cfg.root}/rest/v1/rpc/increment_metric`, {
    method: "POST",
    headers: cfg.headers,
    body: JSON.stringify({ p_name: name }),
    signal: AbortSignal.timeout(5000),
  }).catch((err) => console.error("Metric write failed", err));
}

export async function readMetrics(days = 30): Promise<MetricRow[]> {
  const cfg = supabaseConfig();
  if (!cfg) {
    return [...memory.entries()].map(([key, count]) => {
      const [day, name] = key.split("|");
      return { day, name: name as MetricName, count };
    });
  }
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const query = new URLSearchParams({
    select: "day,name,count",
    day: `gte.${since}`,
    order: "day.desc",
  });
  const res = await fetch(`${cfg.root}/rest/v1/metrics?${query.toString()}`, {
    headers: cfg.headers,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Supabase metrics read failed (${res.status})`);
  return (await res.json()) as MetricRow[];
}
