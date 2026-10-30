import type { Metadata } from "next";
import { Suspense } from "react";
import { preconnect } from "react-dom";
import MapApp from "@/components/map/MapApp";

export const metadata: Metadata = {
  title: "Live charger map",
  description:
    "Find EV chargers near you with driver-verified status: working, broken or unverified, with the time of the last report.",
};

export default function MapPage() {
  preconnect("https://basemaps.cartocdn.com");
  return (
    <Suspense>
      <MapApp />
    </Suspense>
  );
}
