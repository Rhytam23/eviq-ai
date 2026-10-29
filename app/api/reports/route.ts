import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/metrics";
import { getReportStore } from "@/lib/reportStore";
import { clientIp, hashClient, hashIp } from "@/lib/clientId";
import { rateLimit } from "@/lib/rateLimit";
import { MAX_BODY_BYTES, parseReportBody } from "@/lib/validation";

export const dynamic = "force-dynamic";

function fail(error: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers });
}

export async function POST(request: Request) {
  // Reject cross-site posts: browsers always send Origin on cross-origin POSTs.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return fail("Forbidden", 403);

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return fail("Content-Type must be application/json", 415);
  }

  const ip = clientIp(request.headers);
  const limited = rateLimit(`reports:${hashIp(ip)}`, 20, 10 * 60_000);
  if (!limited.allowed) {
    return fail("Too many reports. Slow down.", 429, {
      "Retry-After": String(limited.retryAfterSec),
    });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return fail("Body too large", 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = parseReportBody(body);
  if (!parsed.ok) return fail(parsed.error, 400);

  const store = getReportStore();
  try {
    const result = await store.add({
      ...parsed.value,
      clientHash: hashClient(ip, request.headers.get("user-agent") ?? ""),
    });
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "You already reported this charger recently.",
          retryAfterSec: result.retryAfterSec,
        },
        { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } }
      );
    }
  } catch (err) {
    console.error("Report store write failed", err);
    return fail("Could not save your report. Try again.", 503);
  }

  recordEvent(`report_${parsed.value.status}`);
  return NextResponse.json({ ok: true, storage: store.kind }, { status: 201 });
}
