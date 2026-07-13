"use client";
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Coordinate } from "@/lib/api";

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isRecommended: boolean;
  isSelected: boolean;
}

interface TripMapProps {
  origin: Coordinate;
  destination: Coordinate;
  stations: Station[];
  routeCoordinates: [number, number][]; // [lng, lat]
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
}

export default function TripMap({
  origin,
  destination,
  stations,
  routeCoordinates,
  selectedStationId,
  onSelectStation,
}: TripMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use CartoDB Dark Matter GL style - premium, beautiful, and completely free without API keys
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [origin.lng, origin.lat],
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Route Polyline when coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Source and Layer IDs
    const sourceId = "trip-route";
    const layerId = "trip-route-line";
    const glowLayerId = "trip-route-glow";

    // Format coordinates for GeoJSON
    const geojson: any = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates:
          routeCoordinates.length > 0
            ? routeCoordinates
            : [
                [origin.lng, origin.lat],
                [destination.lng, destination.lat],
              ],
      },
    };

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      // Add route glow layer
      map.addLayer({
        id: glowLayerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#00F0FF",
          "line-width": 6,
          "line-opacity": 0.15,
        },
      });

      // Add main route line layer
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#00F0FF",
          "line-width": 3,
          "line-opacity": 0.85,
        },
      });
    }

    // Fit map bounds to contain the route
    if (routeCoordinates.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      routeCoordinates.forEach((coord) => bounds.extend(coord as [number, number]));
      // Extend bounds to cover stations as well
      stations.forEach((st) => bounds.extend([st.lng, st.lat]));

      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
        duration: 1000,
      });
    }
  }, [mapLoaded, routeCoordinates, origin, destination, stations]);

  // Update Markers when stations or selections change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // 1. Add Vehicle Marker
    const vehicleEl = document.createElement("div");
    vehicleEl.className = "relative w-8 h-8 flex items-center justify-center cursor-pointer";
    vehicleEl.innerHTML = `
      <div class="absolute inset-0 bg-cyan-400/25 rounded-full animate-ping" style="animation-duration: 2s;"></div>
      <div class="w-4 h-4 bg-[#00F0FF] rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
      <div class="absolute -top-6 text-[9px] font-mono font-bold text-[#00F0FF] bg-zinc-950/80 px-1 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap">VEHICLE</div>
    `;
    const vehicleMarker = new maplibregl.Marker({ element: vehicleEl })
      .setLngLat([origin.lng, origin.lat])
      .addTo(map);
    markersRef.current.push(vehicleMarker);

    // 2. Add Destination Marker
    const destEl = document.createElement("div");
    destEl.className = "flex flex-col items-center cursor-pointer";
    destEl.innerHTML = `
      <div class="w-8 h-8 bg-zinc-900 border border-white/20 text-white rounded-lg flex items-center justify-center font-mono font-bold text-xs shadow-xl hover:border-cyan-500 transition-colors">
        ⬡
      </div>
      <div class="text-[9px] font-mono text-white/50 bg-zinc-950/85 px-1 rounded mt-0.5 whitespace-nowrap">DESTINATION</div>
    `;
    const destMarker = new maplibregl.Marker({ element: destEl })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map);
    markersRef.current.push(destMarker);

    // 3. Add Station Markers
    stations.forEach((st) => {
      const stationEl = document.createElement("div");
      stationEl.className = `flex flex-col items-center cursor-pointer group`;

      const isSelected = selectedStationId === st.id || st.isSelected;
      const isRec = st.isRecommended;

      let borderClass = "border-white/20 bg-zinc-950 text-white/70";
      let ringGlow = "";
      let labelClass = "text-white/40 bg-zinc-950/80";

      if (isSelected) {
        borderClass = "border-cyan-400 bg-cyan-950 text-cyan-400 scale-110";
        ringGlow = "shadow-[0_0_12px_rgba(0,240,255,0.6)]";
        labelClass = "text-cyan-400 bg-zinc-950 border-cyan-400/50";
      } else if (isRec) {
        borderClass = "border-cyan-500/60 bg-zinc-900 text-cyan-300";
        labelClass = "text-cyan-300 bg-zinc-950 border-cyan-500/20";
        ringGlow = "shadow-[0_0_8px_rgba(0,240,255,0.3)] animate-pulse";
      }

      stationEl.innerHTML = `
        <div class="relative w-8 h-8 rounded-full border-2 ${borderClass} ${ringGlow} flex items-center justify-center font-bold text-xs transition-all duration-200">
          ⚡
          ${isRec ? `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border border-zinc-950"></div>` : ""}
        </div>
        <div class="text-[8px] font-mono px-1 py-0.5 rounded border border-white/5 mt-1 max-w-[90px] truncate text-center ${labelClass}">
          ${st.name}
        </div>
      `;

      // Handle marker click
      stationEl.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectStation(st.id);
      });

      const stationMarker = new maplibregl.Marker({ element: stationEl })
        .setLngLat([st.lng, st.lat])
        .addTo(map);
      markersRef.current.push(stationMarker);
    });
  }, [mapLoaded, stations, selectedStationId, origin, destination, onSelectStation]);

  // Center and zoom when selectedStationId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedStationId) return;

    const selectedStation = stations.find((st) => st.id === selectedStationId);
    if (selectedStation) {
      map.flyTo({
        center: [selectedStation.lng, selectedStation.lat],
        zoom: 13,
        essential: true,
        duration: 1200,
      });
    }
  }, [selectedStationId, mapLoaded, stations]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.06]">
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-zinc-500">
              INITIALIZING VECTOR TELEMETRY...
            </span>
          </div>
        </div>
      )}

      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Style overrides for custom map labels/attributions */}
      <style jsx global>{`
        .maplibregl-ctrl-attrib {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
