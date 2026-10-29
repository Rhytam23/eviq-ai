import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, adminSession, tokenMatches } from "@/lib/admin";
import { clientIp, hashIp } from "@/lib/clientId";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const back = (error: string) =>
    NextResponse.redirect(new URL(`/admin/metrics?error=${error}`, request.url), 303);

  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const limited = rateLimit(`admin:${hashIp(clientIp(request.headers))}`, 5, 10 * 60_000);
  if (!limited.allowed) return back("rate");
  if (!adminConfigured()) return back("unconfigured");

  const form = await request.formData();
  const token = form.get("token");
  if (typeof token !== "string" || token.length > 200 || !tokenMatches(token))
    return back("invalid");

  const res = NextResponse.redirect(new URL("/admin/metrics", request.url), 303);
  res.cookies.set(ADMIN_COOKIE, adminSession(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: 8 * 60 * 60,
  });
  return res;
}
