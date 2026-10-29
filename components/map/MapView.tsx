"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STATUS_COLORS } from "@/lib/statusMeta";
import { haversineKm } from "@/lib/format";
import type { Station } from "@/types/station";

const STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: "background", type: "background", paint: { "background-color": "#EEF0EA" } }],
};
const FALLBACK_FONT = ["Open Sans Regular", "Arial Unicode MS Regular"];

export interface ViewState {
  lat: number;
  lng: number;
  zoom: number;
  /** Half the diagonal of the visible area, clamped to what the API accepts. */
  radiusKm: number;
  userInitiated: boolean;
}

export interface FlyTarget {
  lat: number;
  lng: number;
  zoom: number;
  nonce: number;
}

interface Props {
  stations: Station[];
  selectedId: string | null;
  userLocation: { lat: number; lng: number } | null;
  target: FlyTarget | null;
  onSelect: (id: string) => void;
  onViewChange: (view: ViewState) => void;
  onUnavailable: (message: string) => void;
}

function toGeoJSON(stations: Station[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: stations.map((s) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.lng, s.lat] },
      properties: { id: s.id, reliability: s.reliability },
    })),
  };
}

function userGeoJSON(loc: Props["userLocation"]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: loc
      ? [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
            properties: {},
          },
        ]
      : [],
  };
}

export default function MapView(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const readyRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  const latest = useRef(props);
  latest.current = props;

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [10, 25],
        zoom: 1.6,
        minZoom: 1,
        attributionControl: {
          compact: true,
          customAttribution: "Charger data: OpenStreetMap contributors, Open Charge Map",
        },
      });
    } catch {
      latest.current.onUnavailable(
        "The map needs WebGL, which this browser does not provide. The list still works."
      );
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    let usedFallback = false;
    const addLayers = () => {
      if (map.getSource("stations")) return;
      const textLayer = map
        .getStyle()
        .layers?.find((l) => l.type === "symbol" && l.layout && "text-font" in l.layout);
      const font =
        (textLayer?.type === "symbol"
          ? (textLayer.layout?.["text-font"] as string[] | undefined)
          : undefined) ?? FALLBACK_FONT;

      map.addSource("stations", {
        type: "geojson",
        data: toGeoJSON(latest.current.stations),
        cluster: true,
        clusterRadius: 48,
        clusterMaxZoom: 13,
      });
      map.addSource("user", { type: "geojson", data: userGeoJSON(latest.current.userLocation) });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "stations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#0B3D2E",
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 19, 50, 24],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "stations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": font as string[],
          "text-size": 12,
        },
        paint: { "text-color": "#C8F03C" },
      });
      map.addLayer({
        id: "selected-ring",
        type: "circle",
        source: "stations",
        filter: ["==", ["get", "id"], ""],
        paint: {
          "circle-radius": 15,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-color": "#0B3D2E",
          "circle-stroke-width": 3,
        },
      });
      map.addLayer({
        id: "stations-points",
        type: "circle",
        source: "stations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 5, 14, 9],
          "circle-color": [
            "match",
            ["get", "reliability"],
            "verified",
            STATUS_COLORS.verified,
            "reported-broken",
            STATUS_COLORS["reported-broken"],
            "operator-offline",
            STATUS_COLORS["operator-offline"],
            STATUS_COLORS.unverified,
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "user-dot",
        type: "circle",
        source: "user",
        paint: {
          "circle-radius": 7,
          "circle-color": "#2563EB",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
        },
      });
      readyRef.current = true;
      // Apply anything that arrived while the style was loading.
      syncData();
      syncSelected();
    };

    const syncData = () => {
      if (!readyRef.current) return;
      (map.getSource("stations") as GeoJSONSource).setData(toGeoJSON(latest.current.stations));
      (map.getSource("user") as GeoJSONSource).setData(userGeoJSON(latest.current.userLocation));
    };
    const syncSelected = () => {
      if (!readyRef.current) return;
      map.setFilter("selected-ring", ["==", ["get", "id"], latest.current.selectedId ?? ""]);
    };
    syncRef.current = () => {
      syncData();
      syncSelected();
    };

    map.on("load", addLayers);
    map.on("error", (e) => {
      // If the hosted basemap cannot be reached, keep the product usable on a plain background.
      const failedStyle = !map.isStyleLoaded() && !readyRef.current && !usedFallback;
      if (failedStyle) {
        usedFallback = true;
        latest.current.onUnavailable("The basemap could not be loaded. Chargers are still shown.");
        map.setStyle(FALLBACK_STYLE);
        map.once("styledata", addLayers);
      } else if (process.env.NODE_ENV !== "production") {
        console.warn("MapLibre error", e.error);
      }
    });

    map.on("click", "stations-points", (e) => {
      const id = e.features?.[0]?.properties?.id;
      if (typeof id === "string") latest.current.onSelect(id);
    });
    map.on("click", "clusters", async (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const source = map.getSource("stations") as GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(feature.properties?.cluster_id);
      map.easeTo({
        center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
        zoom,
      });
    });
    for (const layer of ["stations-points", "clusters"]) {
      map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
    }

    map.on("moveend", (e) => {
      const c = map.getCenter();
      const ne = map.getBounds().getNorthEast();
      const radiusKm = Math.min(
        50,
        Math.max(1, Math.round(haversineKm(c.lat, c.lng, ne.lat, ne.lng) / 2))
      );
      latest.current.onViewChange({
        lat: c.lat,
        lng: c.lng,
        zoom: map.getZoom(),
        radiusKm,
        userInitiated: Boolean((e as { originalEvent?: unknown }).originalEvent),
      });
    });

    return () => {
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Push data/selection changes into the map.
  useEffect(() => {
    syncRef.current();
  }, [props.stations, props.selectedId, props.userLocation]);

  // Fly to a requested place.
  useEffect(() => {
    const { target } = props;
    if (target && mapRef.current) {
      mapRef.current.flyTo({
        center: [target.lng, target.lat],
        zoom: target.zoom,
        essential: true,
      });
    }
  }, [props.target]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pan to the selected station without changing zoom drastically.
  useEffect(() => {
    const s = props.stations.find((x) => x.id === props.selectedId);
    if (s && mapRef.current) {
      const map = mapRef.current;
      map.easeTo({ center: [s.lng, s.lat], zoom: Math.max(map.getZoom(), 14), duration: 500 });
    }
  }, [props.selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="h-full w-full" />;
}
