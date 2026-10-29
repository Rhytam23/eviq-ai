import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3210);
const MOCK_PORT = 3290;
// In CI the browser comes from `playwright install`. Locally set PW_CHROMIUM_PATH to reuse an installed Chromium.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;
const launchOptions = {
  executablePath,
  args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", launchOptions },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
  // Run against the production build: `npm run build` first.
  webServer: [
    {
      command: "node e2e/mock-registry.mjs",
      url: `http://localhost:${MOCK_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      env: { MOCK_REGISTRY_PORT: String(MOCK_PORT) },
    },
    {
      command: `npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        // Playwright sets NODE_ENV=test; the server must run as production.
        NODE_ENV: "production",
        ADMIN_TOKEN: "e2e-admin-token-0123456789",
        // The app talks to the mock registry, never the internet. OCM stays unset so Overpass is used.
        OVERPASS_API_URL: `http://localhost:${MOCK_PORT}/api/interpreter`,
        OCM_API_KEY: "",
        SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
      },
    },
  ],
});
