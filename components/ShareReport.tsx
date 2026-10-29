"use client";

import { useState } from "react";
import ReportPanel, { type ReportUi } from "@/components/ReportPanel";
import { submitReport } from "@/lib/reportClient";
import type { ReportStatus } from "@/types/station";

export default function ShareReport({
  stationId,
  storage,
  reportsAvailable,
}: {
  stationId: string;
  storage: "supabase" | "memory";
  reportsAvailable: boolean;
}) {
  const [ui, setUi] = useState<ReportUi>({});
  const [liveStorage, setLiveStorage] = useState(storage);

  async function onReport(status: ReportStatus) {
    setUi({ pending: status });
    const result = await submitReport(stationId, status);
    if (result.ok) {
      setLiveStorage(result.storage);
      setUi({ done: status });
    } else {
      setUi({ error: result.message });
    }
  }

  return (
    <ReportPanel
      ui={ui}
      storage={liveStorage}
      reportsAvailable={reportsAvailable}
      onReport={onReport}
    />
  );
}
