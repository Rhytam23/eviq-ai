import type { Page, Route } from "@playwright/test";

/**
 * TEST-ONLY synthetic stations. They exist so the UI can be exercised without internet access to the
 * charger registries. They are never shipped, and must never appear in screenshots used on the site.
 */
export function syntheticStations(lat: number, lng: number) {
  const rels = ["verified", "reported-broken", "operator-offline", "unverified"] as const;
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => {
    const reliability = rels[i % 4];
    return {
      id: `ocm:${1000 + i}`,
      source: "ocm",
      name: `Test charger ${i}`,
      operator: i % 3 ? "TestOp" : null,
      lat: lat + (((i * 37) % 40) - 20) * 0.002,
      lng: lng + (((i * 53) % 40) - 20) * 0.003,
      address: "1 Test Street",
      distanceKm: i * 0.4,
      points: 2 + (i % 4),
      maxKw: [22, 50, 150, null][i % 4],
      connectors: [
        {
          type: ["CCS", "Type 2", "CHAdeMO", "NACS"][i % 4],
          kw: [22, 50, 150, null][i % 4],
          quantity: 2,
        },
      ],
      operatorStatus:
        reliability === "operator-offline" ? "offline" : i % 2 ? "operational" : "unknown",
      statusUpdatedAt: null,
      cost: i % 2 ? "0.40 EUR/kWh" : null,
      reports: {
        recent:
          reliability === "verified"
            ? [{ status: "working", at: new Date(now - 600_000).toISOString() }]
            : reliability === "reported-broken"
              ? [{ status: "broken", at: new Date(now - 3_600_000).toISOString() }]
              : [],
      },
      reliability,
      verifiedAt: reliability === "verified" ? new Date(now - 600_000).toISOString() : null,
    };
  });
}

export async function stubBasemap(page: Page) {
  await page.route("**/basemaps.cartocdn.com/**", (route: Route) =>
    route.fulfill({
      json: {
        version: 8,
        sources: {},
        layers: [{ id: "bg", type: "background", paint: { "background-color": "#e9ece4" } }],
      },
    })
  );
}

export async function stubStations(
  page: Page,
  opts: { status?: number; delayMs?: number; empty?: boolean; storage?: "memory" | "supabase" } = {}
) {
  await page.route("**/api/v1/stations?*", async (route) => {
    if (opts.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
    if (opts.status && opts.status >= 400) {
      return route.fulfill({
        status: opts.status,
        json: { error: "Charger data is temporarily unavailable. Try again in a moment." },
      });
    }
    const u = new URL(route.request().url());
    const lat = Number(u.searchParams.get("lat"));
    const lng = Number(u.searchParams.get("lng"));
    return route.fulfill({
      json: {
        stations: opts.empty ? [] : syntheticStations(lat, lng),
        source: "ocm",
        fallbackReason: null,
        storage: opts.storage ?? "memory",
        reportsAvailable: true,
        fetchedAt: new Date().toISOString(),
      },
    });
  });
}

export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}
