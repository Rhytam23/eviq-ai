import { createHmac, randomBytes } from "node:crypto";

let fallbackSalt: string | null = null;

function salt(): string {
  const configured = process.env.REPORT_HASH_SALT;
  if (configured) return configured;
  // Dev only: a per-process salt. Cooldowns then reset on restart, which is fine without a database.
  fallbackSalt ??= randomBytes(16).toString("hex");
  return fallbackSalt;
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/** One-way identifier for cooldowns. The raw IP and user agent are never stored. */
export function hashClient(ip: string, userAgent: string): string {
  return createHmac("sha256", salt())
    .update(`${ip}|${userAgent.slice(0, 200)}`)
    .digest("hex");
}

export function hashIp(ip: string): string {
  return createHmac("sha256", salt()).update(`ip|${ip}`).digest("hex").slice(0, 32);
}
