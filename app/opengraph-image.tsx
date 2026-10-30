import { ImageResponse } from "next/og";

export const alt = "EVIQ: know the charger works before you drive there";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 700 }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "#0B3D2E",
            color: "#C8F03C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#C8F03C">
            <path d="M13.5 2 5 13.5h5.5L9.5 22 19 9.5h-5.5L13.5 2Z" />
          </svg>
        </div>
        EVIQ
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 88,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          Know the charger works before you drive there.
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#5C666D" }}>
          Driver-verified reliability for EV charging, in any city.
        </div>
      </div>
      <div style={{ display: "flex", height: 14, background: "#C8F03C", width: 240 }} />
    </div>,
    size
  );
}
