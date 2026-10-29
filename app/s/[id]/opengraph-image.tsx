import { ImageResponse } from "next/og";
import { STATUS_COLORS, STATUS_LABELS, statusHeadline } from "@/lib/statusMeta";
import { lookupStation } from "@/lib/stationView";

export const alt = "EVIQ charger status";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lookup = await lookupStation(id);
  const name = lookup.found ? lookup.station.name : "EV charger";
  const headline = lookup.found ? statusHeadline(lookup.station) : "Check it on EVIQ";
  const color = lookup.found ? STATUS_COLORS[lookup.station.reliability] : "#0B3D2E";
  const label = lookup.found ? STATUS_LABELS[lookup.station.reliability] : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#F6F5F0",
        color: "#14181B",
        padding: 72,
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 700, color: "#0B3D2E" }}>EVIQ</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 76,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: -2,
            maxWidth: 1050,
          }}
        >
          {name.slice(0, 70)}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 36, fontSize: 44, color }}>
          <div
            style={{ width: 28, height: 28, borderRadius: 28, background: color, marginRight: 18 }}
          />
          {headline}
        </div>
        {label && (
          <div style={{ marginTop: 14, fontSize: 28, color: "#5C666D" }}>
            Driver-verified status
          </div>
        )}
      </div>
      <div style={{ display: "flex", height: 14, background: "#C8F03C", width: 240 }} />
    </div>,
    size
  );
}
