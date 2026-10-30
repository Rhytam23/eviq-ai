/** Countries EVIQ is open in. Everyone else sees the coming-soon page. */
const DEFAULT_LAUNCH_COUNTRIES = ["IN"];

export function launchCountries(
  env: Record<string, string | undefined> = process.env
): string[] | "all" {
  const raw = env.LAUNCH_COUNTRIES?.trim();
  if (!raw) return DEFAULT_LAUNCH_COUNTRIES;
  if (raw === "*") return "all";
  return raw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

/** Set by visiting /india. It lets one browser use the India launch from any country (reviewers, demos). */
export const PREVIEW_COOKIE = "eviq_india_preview";
export const PREVIEW_PATH = "/india";

/** Two-letter country code from the host's geo headers, or null when the host sent none (local dev, tests). */
export function visitorCountry(headers: Headers): string | null {
  const code = (headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? "")
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/** Unknown country is allowed: we only block visitors we can positively place outside the launch countries. */
export function isCountryAllowed(
  country: string | null,
  env: Record<string, string | undefined> = process.env
): boolean {
  const allowed = launchCountries(env);
  return allowed === "all" || country === null || allowed.includes(country);
}
