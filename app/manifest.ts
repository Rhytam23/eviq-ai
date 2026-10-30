import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EVIQ: driver-verified EV charger status",
    short_name: "EVIQ",
    description: "Know the charger works before you drive there.",
    start_url: "/map",
    scope: "/",
    display: "standalone",
    background_color: "#F6F5F0",
    theme_color: "#0B3D2E",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
