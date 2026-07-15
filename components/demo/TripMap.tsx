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
  powerKw?: number;
  reliabilityScore?: number;
  predictedQueueMinutes?: number;
  selectionReason?: string;
}

interface TripMapProps {
  origin: Coordinate;
  destination: Coordinate;
  stations: Station[];
  routeCoordinates: [number, number][]; // [lng, lat]
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  recommendedRankMap?: Record<string, number>;
}

// Stable source/layer IDs
const NORMAL_SOURCE = "stations-normal";
const NORMAL_LAYER  = "stations-circle";

export default function TripMap({
  origin,
  destination,
  stations,
  routeCoordinates,
  selectedStationId,
  onSelectStation,
  recommendedRankMap = {},
}: TripMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<maplibregl.Map | null>(null);

  // Single hover popup reference to prevent duplicates
  const hoverPopupRef        = useRef<maplibregl.Popup | null>(null);
  // Only vehicle + destination + top-10 recommendation DOM markers
  const specialMarkersRef    = useRef<maplibregl.Marker[]>([]);
  // Map station string-id → GeoJSON numeric feature-id (for setFeatureState)
  const normalFeatureIdsRef  = useRef<Map<string, number>>(new Map());
  // Track which feature-id is currently "selected" to deselect it cheaply
  const prevSelectedFeatRef  = useRef<number | null>(null);
  // Stable callback ref — avoids stale closures in the click listener registered once
  const onSelectRef          = useRef(onSelectStation);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Keep the callback ref in sync without it being a useEffect dep
  useEffect(() => { onSelectRef.current = onSelectStation; }, [onSelectStation]);

  // Clean up any active popup on unmount
  useEffect(() => {
    return () => {
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
      }
    };
  }, []);

  // ── 1. Initialize Map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [origin.lng, origin.lat],
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => setMapLoaded(true));
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Route Polyline ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const geojson: any = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: routeCoordinates.length > 0
          ? routeCoordinates
          : [[origin.lng, origin.lat], [destination.lng, destination.lat]],
      },
    };

    if (map.getSource("trip-route")) {
      (map.getSource("trip-route") as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource("trip-route", { type: "geojson", data: geojson });

      map.addLayer({
        id: "trip-route-glow", type: "line", source: "trip-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#00F0FF", "line-width": 6, "line-opacity": 0.15 },
      });
      map.addLayer({
        id: "trip-route-line", type: "line", source: "trip-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#00F0FF", "line-width": 3, "line-opacity": 0.85 },
      });
    }

    if (routeCoordinates.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      routeCoordinates.forEach(c => bounds.extend(c as [number, number]));
      stations.forEach(st => bounds.extend([st.lng, st.lat]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 1000 });
    }
  }, [mapLoaded, routeCoordinates, origin, destination, stations]);

  // ── 3. GPU-rendered circle layer for ALL normal (non-top-10) stations ──────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Separate normal stations from top-10 (top-10 remain as DOM markers below)
    const normalStations = stations.filter(st => !(st.id in recommendedRankMap));

    const featureCollection: any = {
      type: "FeatureCollection",
      features: normalStations.map(st => ({
        type: "Feature",
        properties: { sid: st.id, name: st.name },
        geometry: { type: "Point", coordinates: [st.lng, st.lat] },
      })),
    };

    const idMap = new Map<string, number>();
    normalStations.forEach((st, i) => idMap.set(st.id, i));
    normalFeatureIdsRef.current = idMap;

    if (map.getSource(NORMAL_SOURCE)) {
      (map.getSource(NORMAL_SOURCE) as maplibregl.GeoJSONSource).setData(featureCollection);

      if (selectedStationId) {
        const fid = idMap.get(selectedStationId);
        if (fid !== undefined) {
          setTimeout(() => {
            try {
              map.setFeatureState({ source: NORMAL_SOURCE, id: fid }, { selected: true });
              prevSelectedFeatRef.current = fid;
            } catch {}
          }, 30);
        }
      }
    } else {
      map.addSource(NORMAL_SOURCE, {
        type: "geojson",
        data: featureCollection,
        generateId: true,
      });

      map.addLayer({
        id: NORMAL_LAYER,
        type: "circle",
        source: NORMAL_SOURCE,
        paint: {
          "circle-radius": [
            "case", ["boolean", ["feature-state", "selected"], false], 7, 4,
          ],
          "circle-color": [
            "case", ["boolean", ["feature-state", "selected"], false],
            "#00E5FF", "rgba(255,255,255,0.18)",
          ],
          "circle-stroke-width": [
            "case", ["boolean", ["feature-state", "selected"], false], 1.5, 0.5,
          ],
          "circle-stroke-color": [
            "case", ["boolean", ["feature-state", "selected"], false],
            "#00E5FF", "rgba(255,255,255,0.07)",
          ],
          "circle-opacity": 0.9,
        },
      });

      map.on("click", NORMAL_LAYER, (e) => {
        const sid = e.features?.[0]?.properties?.sid;
        if (sid) onSelectRef.current(sid as string);
      });
      map.on("mouseenter", NORMAL_LAYER, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", NORMAL_LAYER, () => { map.getCanvas().style.cursor = ""; });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, stations, recommendedRankMap]);

  // ── 4. DOM markers: vehicle + destination + top-10 only ───────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    specialMarkersRef.current.forEach(m => m.remove());
    specialMarkersRef.current = [];

    // Vehicle marker
    const vehicleEl = document.createElement("div");
    vehicleEl.className = "relative w-8 h-8 flex items-center justify-center cursor-pointer";
    vehicleEl.innerHTML = `
      <div class="absolute inset-0 bg-[#00E5FF]/25 rounded-full animate-ping" style="animation-duration:2s;"></div>
      <div class="w-4 h-4 bg-[#00E5FF] rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,229,255,0.8)]"></div>
      <div class="absolute -top-6 text-[9px] font-mono font-bold text-[#00E5FF] bg-zinc-950/80 px-1 py-0.5 rounded border border-[#00E5FF]/30 whitespace-nowrap">VEHICLE</div>
    `;
    specialMarkersRef.current.push(
      new maplibregl.Marker({ element: vehicleEl }).setLngLat([origin.lng, origin.lat]).addTo(map)
    );

    // Destination marker
    const destEl = document.createElement("div");
    destEl.className = "flex flex-col items-center cursor-pointer";
    destEl.innerHTML = `
      <div class="w-8 h-8 bg-zinc-900 border border-white/20 text-white rounded-lg flex items-center justify-center font-mono font-bold text-xs shadow-xl hover:border-emerald-500 transition-colors">⬡</div>
      <div class="text-[9px] font-mono text-white/50 bg-zinc-950/85 px-1 rounded mt-0.5 whitespace-nowrap">DESTINATION</div>
    `;
    specialMarkersRef.current.push(
      new maplibregl.Marker({ element: destEl }).setLngLat([destination.lng, destination.lat]).addTo(map)
    );

    // Top-10 recommended markers (DOM required for rank badges + rich styling)
    stations.forEach(st => {
      const rank = recommendedRankMap[st.id];
      if (rank === undefined) return;

      const el = document.createElement("div");
      el.className = "flex flex-col items-center cursor-pointer";

      const isSelected = selectedStationId === st.id;
      const isTop3 = rank <= 3;

      let outerCls: string;
      let innerHtml: string;

      if (isSelected) {
        if (rank === 1) {
          outerCls = "border-2 border-emerald-400 bg-emerald-950 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.7)] w-9 h-9";
        } else {
          outerCls = "border-2 border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_16px_rgba(0,229,255,0.7)] w-9 h-9";
        }
        innerHtml = `<span style="font-size:11px;">⚡</span>`;
      } else if (rank === 1) {
        outerCls = "border-2 border-emerald-400 bg-[#072017] text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.45)] w-9 h-9";
        innerHtml = `
          <span style="font-size:11px;">⚡</span>
          <div style="position:absolute;top:-9px;right:-9px;background:#10B981;color:#050B14;border-radius:9999px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;font-family:monospace;border:2px solid #050B14;box-shadow:0 0 8px rgba(16,185,129,0.8);">#${rank}</div>
        `;
      } else if (isTop3) {
        outerCls = "border-2 border-cyan-400 bg-[#091c1e] text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.45)] w-9 h-9";
        innerHtml = `
          <span style="font-size:11px;">⚡</span>
          <div style="position:absolute;top:-9px;right:-9px;background:#00E5FF;color:#050B14;border-radius:9999px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;font-family:monospace;border:2px solid #050B14;box-shadow:0 0 8px rgba(0,229,255,0.8);">#${rank}</div>
        `;
      } else {
        outerCls = "border-2 border-cyan-500/50 bg-zinc-900 text-cyan-400/80 shadow-[0_0_6px_rgba(0,229,255,0.2)] w-8 h-8";
        innerHtml = `<span style="font-size:9px;font-weight:900;font-family:monospace;line-height:1">#${rank}</span>`;
      }

      el.innerHTML = `
        <div class="relative rounded-full flex items-center justify-center transition-all duration-200 ${outerCls}">
          ${innerHtml}
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(st.id);
      });

      // Hover Tooltip: Show popup on enter, hide on leave
      el.addEventListener("mouseenter", () => {
        if (hoverPopupRef.current) {
          hoverPopupRef.current.remove();
        }

        const waitText = st.predictedQueueMinutes === 0 ? "Immediate access" : `${st.predictedQueueMinutes} min wait`;
        const reasonText = st.selectionReason || "Best composite routing efficiency score.";
        const accentColor = rank === 1 ? "#00FF88" : "#00E5FF";
        const accentBg = rank === 1 ? "bg-emerald-950/70 border-emerald-500/30 text-emerald-400" : "bg-cyan-950/70 border-cyan-500/30 text-cyan-400";

        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 18,
          className: "premium-tooltip",
        });

        const tooltipHtml = `
          <div class="p-3 bg-[#0B1624]/95 backdrop-blur-md border border-white/[0.08] rounded-xl font-sans text-xs min-w-[210px] shadow-2xl text-white select-none pointer-events-none">
            <div class="flex items-center justify-between mb-1.5 border-b border-white/[0.08] pb-1.5">
              <span class="font-mono font-bold" style="color: ${accentColor}">#${rank} RECOMMENDATION</span>
              <span class="font-mono font-bold" style="color: ${accentColor}">${st.reliabilityScore ?? 95}% AI</span>
            </div>
            <div class="font-bold text-[12.5px] mb-1 text-white truncate max-w-[190px]">${st.name}</div>
            <div class="text-zinc-400 font-mono text-[10px] mb-2 flex items-center gap-1.5">
              <span class="text-white/80">${st.powerKw ?? 250} kW</span>
              <span class="text-zinc-600">•</span>
              <span>${waitText}</span>
            </div>
            <div class="text-[10.5px] leading-snug p-1.5 rounded border ${accentBg} italic font-medium">
              ${reasonText}
            </div>
          </div>
        `;

        popup.setLngLat([st.lng, st.lat])
          .setHTML(tooltipHtml)
          .addTo(map);

        hoverPopupRef.current = popup;
      });

      el.addEventListener("mouseleave", () => {
        if (hoverPopupRef.current) {
          hoverPopupRef.current.remove();
          hoverPopupRef.current = null;
        }
      });

      specialMarkersRef.current.push(
        new maplibregl.Marker({ element: el }).setLngLat([st.lng, st.lat]).addTo(map)
      );
    });
  }, [mapLoaded, stations, selectedStationId, origin, destination, recommendedRankMap]);

  // ── 5. Selection → update GeoJSON feature-state (zero DOM work) ────────────
  //
  // When a normal charger is clicked/selected, this effect fires and calls
  // setFeatureState — a single GPU-side flag flip. No DOM nodes are created
  // or destroyed. This is the fast path for selection changes.
  //
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Deselect the previous normal-station circle
    if (prevSelectedFeatRef.current !== null) {
      try {
        map.setFeatureState(
          { source: NORMAL_SOURCE, id: prevSelectedFeatRef.current },
          { selected: false }
        );
      } catch { /* source may not exist yet */ }
    }

    // Select the new normal-station circle (if the selected id is a normal station)
    if (selectedStationId) {
      const fid = normalFeatureIdsRef.current.get(selectedStationId);
      if (fid !== undefined) {
        try {
          map.setFeatureState(
            { source: NORMAL_SOURCE, id: fid },
            { selected: true }
          );
          prevSelectedFeatRef.current = fid;
        } catch {}
      } else {
        // Selected station is a top-10 DOM marker — no circle feature to update
        prevSelectedFeatRef.current = null;
      }
    } else {
      prevSelectedFeatRef.current = null;
    }
  }, [selectedStationId, mapLoaded]);

  // ── 6. Fly to selected station ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedStationId) return;
    const sel = stations.find(st => st.id === selectedStationId);
    if (sel) {
      map.flyTo({ center: [sel.lng, sel.lat], zoom: 13, essential: true, duration: 1200 });
    }
  }, [selectedStationId, mapLoaded, stations]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.06]">
      {!mapLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-xs font-mono text-zinc-500">INITIALIZING VECTOR TELEMETRY...</span>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      <style jsx global>{`
        .maplibregl-ctrl-attrib { display: none !important; }
      `}</style>
    </div>
  );
}
