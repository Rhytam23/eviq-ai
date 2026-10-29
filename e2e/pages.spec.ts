import { expect, test } from "@playwright/test";
import {
  BROKEN_WINDOW_HOURS,
  COOLDOWN_MINUTES,
  REPORT_RETENTION_HOURS,
  VERIFIED_WINDOW_HOURS,
} from "../lib/reliability";
import { collectErrors } from "./helpers";

test("landing page: promise, CTAs, no console errors, no horizontal scroll", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Know the charger works before you drive there."
  );
  await expect(page.getByRole("link", { name: "Open the live map" }).first()).toHaveAttribute(
    "href",
    "/map"
  );
  await expect(page.getByRole("link", { name: "Talk to the founders" })).toHaveAttribute(
    "href",
    /mailto:founders@eviq\.ai/
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  expect(errors).toEqual([]);
});

test("rules page shows exactly the numbers the code uses", async ({ page }) => {
  await page.goto("/how-it-works");
  const text = await page.locator("main").innerText();
  for (const needle of [
    `${VERIFIED_WINDOW_HOURS} hours`,
    `${BROKEN_WINDOW_HOURS} hours`,
    `${REPORT_RETENTION_HOURS} hours`,
    `${COOLDOWN_MINUTES} minutes`,
  ]) {
    expect(text).toContain(needle);
  }
  for (const label of [
    "Verified working",
    "Reported broken",
    "Operator says offline",
    "Unverified",
  ]) {
    expect(text).toContain(label);
  }
});

test("static pages render", async ({ page }) => {
  for (const [path, heading] of [
    ["/developers", "Charger status API"],
    ["/privacy", "Privacy"],
    ["/offline", "You are offline."],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  }
  const res = await page.goto("/definitely-not-a-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("offline");
});

test("security headers are present, including a CSP that allows the map", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBeTruthy();
  expect(h["strict-transport-security"]).toBeTruthy();
  expect(h["x-powered-by"]).toBeUndefined();
  expect(h["content-security-policy"]).toContain("worker-src 'self' blob:");
  expect(h["content-security-policy"]).toContain("https://*.cartocdn.com");
});

test("API: health, validation, CORS, caching and reports", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({
    status: "ok",
    storage: "memory",
    ocmConfigured: false,
  });

  const bad = await request.get("/api/v1/stations?lat=95&lng=0");
  expect(bad.status()).toBe(400);
  expect(bad.headers()["access-control-allow-origin"]).toBe("*");

  const pre = await request.fetch("/api/v1/stations", { method: "OPTIONS" });
  expect(pre.status()).toBe(204);

  const reports = await request.get("/api/v1/stations/osm:n42/reports");
  expect(reports.status()).toBe(200);
  expect(reports.headers()["cache-control"]).toContain("s-maxage=30");
  expect(await reports.json()).toMatchObject({ stationId: "osm:n42", reports: [] });

  expect((await request.get("/api/v1/stations/not-an-id/reports")).status()).toBe(400);

  const crossSite = await request.post("/api/reports", {
    headers: { origin: "https://evil.example", "content-type": "application/json" },
    data: { stationId: "ocm:1", status: "working" },
  });
  expect(crossSite.status()).toBe(403);
  const invalid = await request.post("/api/reports", {
    data: { stationId: "ocm:1", status: "great" },
  });
  expect(invalid.status()).toBe(400);
});

test("OpenAPI file is served and lists the implemented paths", async ({ request }) => {
  const res = await request.get("/openapi.yaml");
  expect(res.status()).toBe(200);
  const body = await res.text();
  for (const p of [
    "/api/v1/stations:",
    "/api/v1/stations/{id}:",
    "/api/v1/stations/{id}/reports:",
  ]) {
    expect(body).toContain(p);
  }
});

test("PWA: manifest, icons and service worker", async ({ page, request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest).toMatchObject({ short_name: "EVIQ", display: "standalone", start_url: "/map" });
  for (const icon of manifest.icons) {
    const res = await request.get(icon.src);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
  await page.goto("/");
  const registered = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  expect(registered).toBe(true);
});

test("QR sticker renders without needing the registry", async ({ page }) => {
  await page.goto("/qr/ocm:1");
  await expect(page.getByRole("heading", { name: "Working or broken?" })).toBeVisible();
  await expect(page.locator('[role="img"] svg')).toBeVisible();
  await expect(page.getByText(/\/s\/ocm%3A1/)).toBeVisible();
  expect((await page.goto("/qr/nonsense"))?.status()).toBe(404);
});

test("share page degrades gracefully for an invalid or unreachable charger", async ({ page }) => {
  await page.goto("/s/nonsense");
  await expect(page.getByRole("heading", { name: "Charger not available" })).toBeVisible();
  // ocm ids need an OCM key; the test server has none
  await page.goto("/s/ocm:1");
  await expect(page.getByRole("heading", { name: "Charger not available" })).toBeVisible();
});

test.describe("admin metrics", () => {
  test("requires the token, then shows counters", async ({ page }) => {
    await page.goto("/admin/metrics");
    await expect(page.getByLabel("Admin token")).toBeVisible();

    await page.getByLabel("Admin token").fill("wrong-token");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("p[role=alert]")).toContainText("not correct");

    await page.getByLabel("Admin token").fill("e2e-admin-token-0123456789");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
    await expect(page.getByText(/Counters hold no identifiers/)).toBeVisible();
  });
});
