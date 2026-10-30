import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { stubBasemap, stubStations } from "./helpers";

const PAGES = [
  "/",
  "/how-it-works",
  "/developers",
  "/privacy",
  "/offline",
  "/qr/ocm:1",
  "/admin/metrics",
];

for (const path of PAGES) {
  test(`axe: no serious or critical issues on ${path}`, async ({ page }) => {
    // Scan the settled page: entrance animations fade blocks in, and axe would read them half-transparent.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)
    ).toEqual([]);
  });
}

test.describe("map", () => {
  test.use({ geolocation: { latitude: 52.52, longitude: 13.405 }, permissions: ["geolocation"] });

  test("axe: list and detail views have no serious or critical issues", async ({ page }) => {
    await stubBasemap(page);
    await stubStations(page);
    await page.goto("/map");
    await expect(page.getByText(/chargers near/)).toBeVisible();
    const scan = async () =>
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      (await scan()).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)
    ).toEqual([]);
    await page.getByRole("button", { name: /Test charger 1\b/ }).click();
    await expect(page.getByRole("heading", { name: "Test charger 1" })).toBeVisible();
    expect(
      (await scan()).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)
    ).toEqual([]);
  });

  test("keyboard: a charger can be opened and reported without a mouse", async ({ page }) => {
    await stubBasemap(page);
    await stubStations(page);
    await page.goto("/map");
    const item = page.getByRole("button", { name: /Test charger 2\b/ });
    await item.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Test charger 2" })).toBeVisible();
    await page.getByRole("button", { name: /Busy/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/Thanks, your report is in/)).toBeVisible();
  });
});
