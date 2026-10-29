import { expect, test } from "@playwright/test";
import { stubBasemap, stubStations } from "./helpers";

test.skip(({ isMobile }) => !isMobile, "mobile project only");

const MIN = 44;

async function undersized(page: import("@playwright/test").Page) {
  return page.evaluate((min) => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(
      "button, select, input:not([type=hidden]), summary, a"
    )) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (getComputedStyle(el).visibility === "hidden") continue;
      // links inside running text are exempt (WCAG 2.2 "inline" exception)
      if (
        el.tagName === "A" &&
        el.closest("p, li:not([class*=min-h]), dd") &&
        getComputedStyle(el).display === "inline"
      )
        continue;
      if (el.closest(".maplibregl-ctrl-attrib, .sr-only")) continue;
      if (r.height < min - 0.5 || (r.width < min - 0.5 && el.tagName !== "A")) {
        out.push(
          `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`
        );
      }
    }
    return out;
  }, MIN);
}

test("landing: no horizontal scroll and 44px touch targets", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  expect(await undersized(page)).toEqual([]);
});

test.describe("map", () => {
  test.use({ geolocation: { latitude: 52.52, longitude: 13.405 }, permissions: ["geolocation"] });

  test("map: no horizontal scroll and 44px touch targets in list and detail", async ({ page }) => {
    await stubBasemap(page);
    await stubStations(page);
    await page.goto("/map");
    await expect(page.getByText(/chargers near/)).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    expect(await undersized(page)).toEqual([]);
    await page.getByRole("button", { name: /Test charger 1\b/ }).click();
    await expect(page.getByRole("heading", { name: "Test charger 1" })).toBeVisible();
    expect(await undersized(page)).toEqual([]);
  });
});
