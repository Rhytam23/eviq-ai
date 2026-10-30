import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "eviq_admin";

/** The session cookie value is derived from the token, so the token itself is never stored in the browser. */
export function adminSession(token: string): string {
  return createHmac("sha256", token).update("eviq-admin-session").digest("hex");
}

export function adminConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.ADMIN_TOKEN && env.ADMIN_TOKEN.length >= 16);
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function tokenMatches(candidate: string, env: NodeJS.ProcessEnv = process.env): boolean {
  if (!adminConfigured(env)) return false;
  return safeEqual(adminSession(candidate), adminSession(env.ADMIN_TOKEN as string));
}

export function sessionValid(
  cookie: string | undefined,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (!cookie || !adminConfigured(env)) return false;
  return safeEqual(cookie, adminSession(env.ADMIN_TOKEN as string));
}
