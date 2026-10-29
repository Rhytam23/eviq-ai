import { NextResponse } from "next/server";
import { getReportStore } from "@/lib/reportStore";

export const dynamic = "force-dynamic";

/**
 * Liveness plus configuration summary. `?deep=1` also checks that the report store answers.
 * Reports only booleans and names, never secret values.
 */
export async function GET(request: Request) {
  const store = getReportStore();
  const body: Record<string, unknown> = {
    status: "ok",
    time: new Date().toISOString(),
    storage: store.kind,
    ocmConfigured: Boolean(process.env.OCM_API_KEY),
  };
  let httpStatus = 200;
  if (new URL(request.url).searchParams.get("deep") === "1") {
    try {
      await store.ping();
      body.reportStore = "reachable";
    } catch (err) {
      console.error("Health check: report store unreachable", err);
      body.status = "degraded";
      body.reportStore = "unreachable";
      httpStatus = 503;
    }
  }
  return NextResponse.json(body, { status: httpStatus, headers: { "Cache-Control": "no-store" } });
}
