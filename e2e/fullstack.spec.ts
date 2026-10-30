import { expect, test } from "@playwright/test";
import { stubBasemap } from "./helpers";

// These tests use the real server code (providers, normalisers, report store, share pages, metrics).
// Only the upstream registry is replaced, by e2e/mock-registry.mjs serving tests/fixtures/overpass.json.
// The stations in that fixture are NOT real chargers.
const PARIS = { latitude: 48.86, longitude: 2.35 };
const QUERY = "lat=48.86&lng=2.35&radiusKm=5";

test.describe.configure({ mode: "serial" });

test("API normalises registry data and never invents values", async ({ request }) => {
  const res = await request.get(`/api/v1/stations?${QUERY}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toMatchObject({
    source: "osm",
    fallbackReason: null,
    storage: "memory",
    reportsAvailable: true,
  });
  expect(body.stations.map((s: { id: string }) => s.id).sort()).toEqual([
    "osm:n5551",
    "osm:n5552",
    "osm:w7001",
  ]);

  const byId = Object.fromEntries(body.stations.map((s: { id: string }) => [s.id, s]));
  expect(byId["osm:n5551"]).toMatchObject({
    name: "Place Example",
    maxKw: 150,
    cost: "Paid (price not listed)",
    operatorStatus: "unknown",
  });
  expect(byId["osm:n5551"].connectors).toEqual([
    { type: "CCS", kw: 150, quantity: 4 },
    { type: "Type 2", kw: 22, quantity: 2 },
  ]);
  // operator data is passed through; the computed label also depends on reports other tests may have sent
  expect(byId["osm:n5552"]).toMatchObject({ operatorStatus: "offline" });
  // nothing the registry did not publish is made up
  expect(byId["osm:w7001"]).toMatchObject({
    points: null,
    maxKw: null,
    operator: null,
    address: null,
  });
});

test("a report changes the status for everyone, and the lookup endpoints agree", async ({
  request,
}, info) => {
  const id = info.project.name === "desktop" ? "osm:w7001" : "osm:n5552";
  const post = await request.post("/api/reports", { data: { stationId: id, status: "working" } });
  expect(post.status()).toBe(201);
  expect(await post.json()).toEqual({ ok: true, storage: "memory" });

  const again = await request.post("/api/reports", { data: { stationId: id, status: "broken" } });
  expect(again.status()).toBe(429);
  expect(Number(again.headers()["retry-after"])).toBeGreaterThan(0);

  const one = await (await request.get(`/api/v1/stations/${encodeURIComponent(id)}`)).json();
  expect(one.station.reliability).toBe("verified");
  expect(one.station.verifiedAt).toBeTruthy();
  expect(one.station.reports.recent.map((r: { status: string }) => r.status)).toContain("working");

  const list = await (await request.get(`/api/v1/stations?${QUERY}`)).json();
  expect(list.stations.find((s: { id: string }) => s.id === id).reliability).toBe("verified");

  const reports = await (
    await request.get(`/api/v1/stations/${encodeURIComponent(id)}/reports`)
  ).json();
  expect(reports.reports.map((r: { status: string }) => r.status)).toContain("working");

  expect((await request.get("/api/v1/stations/osm:n999")).status()).toBe(404);
  expect((await request.get("/api/health?deep=1")).status()).toBe(200);
});

test.describe("full-stack map", () => {
  test.use({ geolocation: PARIS, permissions: ["geolocation"] });

  test("locates, lists registry chargers, reports, and the report survives a reload", async ({
    page,
  }) => {
    await stubBasemap(page);
    await page.goto("/map");
    await expect(page.getByText("3 chargers near your location")).toBeVisible();
    await expect(page.getByText(/Data: OpenStreetMap/)).toBeVisible();

    await page.getByRole("button", { name: /Place Example/ }).click();
    await expect(page.getByRole("heading", { name: "Place Example" })).toBeVisible();
    await expect(page.getByText("Paid (price not listed)")).toBeVisible();
    await expect(page.getByRole("link", { name: "OpenStreetMap" })).toHaveAttribute(
      "href",
      /openstreetmap\.org\/node\/5551/
    );

    await page.getByRole("button", { name: /Working/ }).click();
    await expect(page.getByText(/Thanks, your report is in/)).toBeVisible();
    await expect(page.getByText(/Verified working · just now/).first()).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: /Place Example/ })).toContainText(
      "Verified working"
    );
  });
});

test("share page, link preview image and QR sticker for a registry station", async ({
  page,
  request,
}) => {
  await page.goto("/s/osm:n5551");
  await expect(page.getByRole("heading", { level: 1, name: "Place Example" })).toBeVisible();
  await expect(page).toHaveTitle(/Place Example: .*\| EVIQ|Place Example: /);
  await expect(page.getByRole("link", { name: "See it on the map" })).toHaveAttribute(
    "href",
    /station=osm%3An5551/
  );

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogImage).toContain("/s/osm%3An5551/opengraph-image");
  const img = await request.get(
    new URL(ogImage as string).pathname + new URL(ogImage as string).search
  );
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toContain("image/png");

  await page.goto("/qr/osm:n5551");
  await expect(page.getByText("Place Example")).toBeVisible();
  await expect(page.locator('[role="img"] svg')).toBeVisible();
});

test("share page lets a visitor report in one tap", async ({ page }, info) => {
  const id = info.project.name === "desktop" ? "osm:n5552" : "osm:w7001";
  await page.goto(`/s/${id}`);
  await page.getByRole("button", { name: /Busy/ }).click();
  await expect(page.getByText(/Thanks, your report is in/)).toBeVisible();
});

test("admin metrics shows counters recorded by the calls above, with no identifiers", async ({
  page,
}) => {
  await page.goto("/admin/metrics");
  await page.getByLabel("Admin token").fill("e2e-admin-token-0123456789");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
  const table = page.locator("table");
  const header = await table.locator("thead th").allInnerTexts();
  const row = await table.locator("tbody tr").first().locator("td").allInnerTexts();
  const counts = Object.fromEntries(header.map((h, i) => [h, row[i]]));
  expect(Number(counts.map_search)).toBeGreaterThan(0);
  expect(Number(counts.report_working)).toBeGreaterThan(0);
  expect(Number(counts.share_view)).toBeGreaterThan(0);
  expect(Number(counts.qr_view)).toBeGreaterThan(0);
  await expect(page.getByText(/Storage: memory/)).toBeVisible();
});
