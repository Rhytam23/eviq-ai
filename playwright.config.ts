import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3210);
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
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    stdout: "pipe",
    stderr: "pipe",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NODE_ENV: "production",
      ADMIN_TOKEN: "e2e-admin-token-0123456789",
      OCM_API_KEY: "",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
  },
});
