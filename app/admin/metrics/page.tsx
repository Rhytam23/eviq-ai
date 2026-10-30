import type { Metadata } from "next";
import { cookies } from "next/headers";
import Logo from "@/components/Logo";
import { ADMIN_COOKIE, adminConfigured, sessionValid } from "@/lib/admin";
import { METRIC_NAMES, readMetrics } from "@/lib/metrics";
import { getReportStore } from "@/lib/reportStore";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Metrics", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  invalid: "That token is not correct.",
  rate: "Too many attempts. Wait ten minutes.",
  unconfigured: "ADMIN_TOKEN is not set on the server (it must be at least 16 characters).",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Logo />
      <h1 className="mt-8 font-serif text-4xl tracking-tight">Metrics</h1>
      {children}
    </main>
  );
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const jar = await cookies();

  if (!sessionValid(jar.get(ADMIN_COOKIE)?.value)) {
    return (
      <Shell>
        <form action="/api/admin/login" method="post" className="mt-6 max-w-sm space-y-3">
          <label htmlFor="token" className="block text-sm font-medium">
            Admin token
          </label>
          <input
            id="token"
            name="token"
            type="password"
            required
            autoComplete="current-password"
            className="h-11 w-full rounded-lg border border-line bg-white px-3"
          />
          <button type="submit" className="h-11 rounded-lg bg-brand px-5 font-medium text-white">
            Sign in
          </button>
          {error && (
            <p role="alert" className="text-sm text-bad">
              {ERRORS[error] ?? "Sign-in failed."}
            </p>
          )}
          {!adminConfigured() && !error && (
            <p className="text-sm text-muted">
              The server has no ADMIN_TOKEN configured, so nobody can sign in.
            </p>
          )}
        </form>
      </Shell>
    );
  }

  const store = getReportStore();
  const [stats, rows] = await Promise.allSettled([store.stats(), readMetrics(30)]);
  const days = [...new Set(rows.status === "fulfilled" ? rows.value.map((r) => r.day) : [])]
    .sort()
    .reverse();
  const count = (day: string, name: string) =>
    rows.status === "fulfilled"
      ? (rows.value.find((r) => r.day === day && r.name === name)?.count ?? 0)
      : 0;

  return (
    <Shell>
      <p className="mt-2 text-sm text-muted">
        Storage: <strong>{store.kind}</strong>
        {store.kind === "memory" && " (numbers reset when the server restarts)"}. Counters hold no
        identifiers.
      </p>

      <h2 className="mt-8 font-serif text-2xl">Reports</h2>
      {stats.status === "fulfilled" ? (
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Last 24 hours", stats.value.last24h],
            ["Last 7 days", stats.value.last7d],
            ["Distinct clients, 7 d", stats.value.distinctClients7d],
            ["Chargers reported, 7 d", stats.value.stationsReported7d],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-line bg-surface p-4">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-1 font-serif text-3xl tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 text-bad">Could not read reports.</p>
      )}
      {stats.status === "fulfilled" && stats.value.truncated && (
        <p className="mt-2 text-sm text-warn">
          More than 10,000 rows in 7 days: these are lower bounds.
        </p>
      )}
      <p className="mt-2 text-sm text-muted">
        &quot;Distinct clients&quot; counts one-way hashes of network address and browser, so people
        on one network with one browser count once and one person on two networks counts twice.
      </p>

      <h2 className="mt-10 font-serif text-2xl">Daily counters (UTC)</h2>
      {rows.status === "fulfilled" ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 pr-4 font-medium">Day</th>
                {METRIC_NAMES.map((n) => (
                  <th key={n} className="py-2 pr-4 font-medium">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d} className="border-b border-line">
                  <td className="py-2 pr-4">{d}</td>
                  {METRIC_NAMES.map((n) => (
                    <td key={n} className="py-2 pr-4 tabular-nums">
                      {count(d, n)}
                    </td>
                  ))}
                </tr>
              ))}
              {days.length === 0 && (
                <tr>
                  <td colSpan={METRIC_NAMES.length + 1} className="py-4 text-muted">
                    Nothing recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-bad">Could not read counters.</p>
      )}
      <p className="mt-6 text-xs text-muted">
        Landing-page visits are not counted: the page is static and we run no browser analytics.
      </p>
    </Shell>
  );
}
