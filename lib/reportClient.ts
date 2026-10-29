import type { ReportStatus } from "@/types/station";

type SubmitResult = { ok: true; storage: "supabase" | "memory" } | { ok: false; message: string };

/** Browser-side call to POST /api/reports with friendly error messages. */
export async function submitReport(stationId: string, status: ReportStatus): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId, status }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, storage: json.storage === "supabase" ? "supabase" : "memory" };
    const wait = typeof json.retryAfterSec === "number" ? Math.ceil(json.retryAfterSec / 60) : null;
    if (res.status === 429 && wait) {
      return {
        ok: false,
        message: `You already reported this charger. Try again in about ${wait} min.`,
      };
    }
    return { ok: false, message: json.error ?? "Could not send your report." };
  } catch {
    return { ok: false, message: "Network error. Your report was not sent." };
  }
}
