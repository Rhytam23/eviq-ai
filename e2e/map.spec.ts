import { expect, test } from "@playwright/test";
import { collectErrors, stubBasemap, stubStations } from "./helpers";

const BERLIN = { latitude: 52.52, longitude: 13.405 };

test.describe("/map", () => {
  test.use({ geolocation: BERLIN, permissions: ["geolocation"], locale: "de-DE" });

  test.beforeEach(async ({ page }) => {
    await stubBasemap(page);
    await page.route("**/api/geocode*", (r) =>
      r.fulfill({ json: { places: [{ name: "Paris, France", lat: 48.8566, lng: 2.3522 }] } })
    );
  });

  test("locates, lists chargers, filters, opens detail, reports, and warns about memory storage", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await stubStations(page);
    await page.goto("/map");

    await expect(page.getByText("24 chargers near your location")).toBeVisible();
    await expect(page.getByText(/Reports are not persisted/).first()).toBeVisible();
    // km by default for a German locale
    await expect(page.getByRole("button", { name: "km", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await page.getByRole("button", { name: "CCS", exact: true }).click();
    await expect(page.getByText(/6 chargers near your location/)).toBeVisible();
    await expect(page.getByText(/18 hidden by filters/)).toBeVisible();
    await page.getByRole("button", { name: "CCS", exact: true }).click();

    await page.getByRole("button", { name: /Test charger 0\b/ }).click();
    await expect(page.getByRole("heading", { name: "Test charger 0" })).toBeVisible();
    await expect(page.getByText("Why: The newest driver report is")).toBeVisible();

    await page.getByRole("button", { name: /Broken/ }).click();
    await expect(page.getByText(/Thanks, your report is in/)).toBeVisible();
    await expect(page.getByText(/Reported broken · just now/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Working/ })).toBeDisabled();
    expect(errors).toEqual([]);
  });

  test("second report from the same client is refused with a cooldown message and rolled back", async ({
    page,
  }) => {
    await stubStations(page);
    await page.goto("/map");
    await page.getByRole("button", { name: /Test charger 5\b/ }).click();
    await page.getByRole("button", { name: /Working/ }).click();
    await expect(page.getByText(/Thanks, your report is in/)).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: /Test charger 5\b/ }).click();
    await page.getByRole("button", { name: /Broken/ }).click();
    await expect(
      page.getByRole("article").getByText(/You already reported this charger/)
    ).toBeVisible();
    // optimistic change was rolled back: still unverified, not "Reported broken · just now"
    await expect(page.getByText(/Reported broken · just now/)).toHaveCount(0);
  });

  test("city search jumps to a place", async ({ page }) => {
    await stubStations(page);
    await page.goto("/map");
    await expect(page.getByText(/chargers near your location/)).toBeVisible();
    await page.getByLabel("Search for a city or address").fill("Paris");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByText(/chargers near Paris/)).toBeVisible();
  });

  test("miles toggle changes distances and persists", async ({ page }) => {
    await stubStations(page);
    await page.goto("/map");
    await expect(page.getByText(/chargers near/)).toBeVisible();
    await page.getByRole("button", { name: "mi", exact: true }).click();
    await expect(page.getByText(/mi$/).first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "mi", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  test("shows an empty-area state that says coverage may be missing", async ({ page }) => {
    await stubStations(page, { empty: true });
    await page.goto("/map");
    await expect(page.getByText("No chargers found here")).toBeVisible();
    await expect(page.getByText(/may mean the data is missing/)).toBeVisible();
  });

  test("shows an API failure with a working retry", async ({ page }) => {
    await stubStations(page, { status: 502 });
    await page.goto("/map");
    await expect(page.getByText("We could not load chargers")).toBeVisible();
    await page.unroute("**/api/v1/stations?*");
    await stubStations(page);
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByText(/24 chargers near/)).toBeVisible();
  });

  test("explains a slow registry instead of spinning silently", async ({ page }) => {
    test.setTimeout(30_000);
    await stubStations(page, { delayMs: 7_000 });
    await page.goto("/map");
    await expect(page.getByText(/taking longer than usual|Still loading/).first()).toBeVisible({
      timeout: 12_000,
    });
    await expect(page.getByText(/24 chargers near/)).toBeVisible({ timeout: 15_000 });
  });

  test("a shared link opens the charger detail", async ({ page }) => {
    await stubStations(page);
    await page.goto("/map?lat=52.52&lng=13.405&station=ocm:1003");
    await expect(page.getByRole("heading", { name: "Test charger 3" })).toBeVisible();
  });
});

test.describe("/map without location permission", () => {
  test.use({ permissions: [] });

  test("explains that location is off and offers search", async ({ page }) => {
    await stubBasemap(page);
    await page.goto("/map");
    await expect(page.getByText("Location is off")).toBeVisible();
    await expect(page.getByRole("button", { name: "Use my location" }).first()).toBeVisible();
    await expect(page.getByLabel("Search for a city or address")).toBeVisible();
  });
});
