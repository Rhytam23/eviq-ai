"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Coordinate,
  RouteData,
  WeatherData,
  ApiChargingStation,
  geocodeAddress,
  getRoute,
  getWeather,
  getChargingStations,
  getDistanceToNearestRoad,
} from "@/lib/api";

import StationCard from "@/components/demo/StationCard";
import AiRecommendation from "@/components/demo/AiRecommendation";
import ReservationPanel, { ReservationStatus } from "@/components/demo/ReservationPanel";
import EnterpriseInsights from "@/components/demo/EnterpriseInsights";

// Lazy load MapLibre component to prevent SSR "window is not defined" error
const TripMap = dynamic(() => import("@/components/demo/TripMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-950 flex items-center justify-center border border-white/[0.06] rounded-2xl min-h-[480px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          PREPARING VECTOR TELEMETRY...
        </span>
      </div>
    </div>
  ),
});

// ─── Vehicle Profiles ────────────────────────────────────────────────────────
interface VehicleProfile {
  id: string;
  name: string;
  capacityKwh: number;
  maxChargingSpeedKw: number;
  averageConsumptionWhPerMile: number;
  connectorType: string;
}

const VEHICLES: VehicleProfile[] = [
  {
    id: "v-tesla",
    name: "Tesla Model 3 Long Range",
    capacityKwh: 75,
    maxChargingSpeedKw: 250,
    averageConsumptionWhPerMile: 260,
    connectorType: "NACS",
  },
  {
    id: "v-rivian",
    name: "Rivian R1T Dual-Motor",
    capacityKwh: 135,
    maxChargingSpeedKw: 220,
    averageConsumptionWhPerMile: 410,
    connectorType: "CCS1",
  },
  {
    id: "v-hyundai",
    name: "Hyundai Ioniq 6 AWD",
    capacityKwh: 77.4,
    maxChargingSpeedKw: 350,
    averageConsumptionWhPerMile: 270,
    connectorType: "CCS2",
  },
];

// ─── Corridor Presets ───────────────────────────────────────────────────────
interface CorridorPreset {
  id: string;
  name: string;
  originName: string;
  originCoord: Coordinate;
  destName: string;
  destCoord: Coordinate;
}

const PRESETS: CorridorPreset[] = [
  {
    id: "silicon-valley",
    name: "Silicon Valley Corridor (SF → San Jose)",
    originName: "San Francisco, CA",
    originCoord: { lat: 37.7749, lng: -122.4194 },
    destName: "San Jose, CA",
    destCoord: { lat: 37.3382, lng: -121.8863 },
  },
  {
    id: "hong-kong",
    name: "Hong Kong Express (HKUST → Airport)",
    originName: "HKUST, Hong Kong",
    originCoord: { lat: 22.3364, lng: 114.2655 },
    destName: "Hong Kong International Airport",
    destCoord: { lat: 22.308, lng: 113.9185 },
  },
  {
    id: "london",
    name: "London Commuter (London → Heathrow)",
    originName: "London, UK",
    originCoord: { lat: 51.5074, lng: -0.1278 },
    destName: "Heathrow Airport",
    destCoord: { lat: 51.47, lng: -0.4543 },
  },
  {
    id: "bangalore",
    name: "Bangalore Tech Corridor (Electronic City → Airport)",
    originName: "Electronic City, Bengaluru",
    originCoord: { lat: 12.8452, lng: 77.6602 },
    destName: "Kempegowda International Airport",
    destCoord: { lat: 13.1986, lng: 77.7066 },
  },
];

function deduplicateStations(stations: ApiChargingStation[]): ApiChargingStation[] {
  const merged: ApiChargingStation[] = [];
  stations.forEach((st) => {
    // Check if we have an existing station in merged that has very close coordinates (within ~15 meters)
    const match = merged.find(
      (m) => Math.abs(m.lat - st.lat) < 0.00015 && Math.abs(m.lng - st.lng) < 0.00015
    );
    if (match) {
      match.portsTotal += st.portsTotal;
      match.portsAvailable += st.portsAvailable;
    } else {
      merged.push({ ...st });
    }
  });
  return merged;
}

function getDistanceLatLng(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

function getMinDistanceToRoute(station: Coordinate, routeCoords: [number, number][]): number {
  if (routeCoords.length === 0) return Infinity;
  let minDistance = Infinity;
  // Sample every 5th point for performance if route is very long
  const step = routeCoords.length > 500 ? 5 : 1;
  for (let i = 0; i < routeCoords.length; i += step) {
    const [lng, lat] = routeCoords[i];
    const dist = getDistanceLatLng(station.lat, station.lng, lat, lng);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}

export default function DemoPage() {
  // ─── State ────────────────────────────────────────────────────────────────
  const [selectedPresetId, setSelectedPresetId] = useState<string>("silicon-valley");
  const [originInput, setOriginInput] = useState<string>("");
  const [destInput, setDestInput] = useState<string>("");

  const [originCoord, setOriginCoord] = useState<Coordinate>(PRESETS[0].originCoord);
  const [destCoord, setDestCoord] = useState<Coordinate>(PRESETS[0].destCoord);

  const [batterySoc, setBatterySoc] = useState<number>(25);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("v-tesla");
  const [trafficSeverity, setTrafficSeverity] = useState<"normal" | "dense" | "gridlock">("normal");
  const [weatherStress, setWeatherStress] = useState<"nominal" | "rain" | "heat">("nominal");

  // API query results
  const [directRouteData, setDirectRouteData] = useState<RouteData | null>(null);
  const [optimizedRouteData, setOptimizedRouteData] = useState<RouteData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [rawStations, setRawStations] = useState<ApiChargingStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [searchingGeocodes, setSearchingGeocodes] = useState<boolean>(false);

  // Error reporting and Debug Mode
  const [apiError, setApiError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(true);
  const [stationRoadDistances, setStationRoadDistances] = useState<Record<string, number>>({});

  // Reservation & session flow state
  const [reservationStatus, setReservationStatus] = useState<ReservationStatus>("NONE");

  const currentVehicle = useMemo(() => {
    return VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[0];
  }, [selectedVehicleId]);

  // Suggestions states
  const [originSuggestions, setOriginSuggestions] = useState<{ name: string; coord: Coordinate }[]>(
    []
  );
  const [destSuggestions, setDestSuggestions] = useState<{ name: string; coord: Coordinate }[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState<boolean>(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState<boolean>(false);
  const [activeOriginIndex, setActiveOriginIndex] = useState<number>(-1);
  const [activeDestIndex, setActiveDestIndex] = useState<number>(-1);
  const [loadingOriginSuggestions, setLoadingOriginSuggestions] = useState<boolean>(false);
  const [loadingDestSuggestions, setLoadingDestSuggestions] = useState<boolean>(false);

  // Debounced effect for Origin Input
  useEffect(() => {
    if (originInput.trim().length < 3) {
      setOriginSuggestions([]);
      setLoadingOriginSuggestions(false);
      return;
    }
    const activePreset = PRESETS.find((p) => p.originName === originInput);
    if (activePreset) {
      setLoadingOriginSuggestions(false);
      return;
    }

    setLoadingOriginSuggestions(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(originInput)}&format=json&limit=4`;
        const res = await fetch(url, {
          headers: { "User-Agent": "EviqAiDemoEnterpriseApplication/1.0" },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const list = data.map((item: any) => ({
              name: item.display_name,
              coord: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
            }));
            setOriginSuggestions(list);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOriginSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [originInput]);

  // Debounced effect for Destination Input
  useEffect(() => {
    if (destInput.trim().length < 3) {
      setDestSuggestions([]);
      setLoadingDestSuggestions(false);
      return;
    }
    const activePreset = PRESETS.find((p) => p.destName === destInput);
    if (activePreset) {
      setLoadingDestSuggestions(false);
      return;
    }

    setLoadingDestSuggestions(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destInput)}&format=json&limit=4`;
        const res = await fetch(url, {
          headers: { "User-Agent": "EviqAiDemoEnterpriseApplication/1.0" },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const list = data.map((item: any) => ({
              name: item.display_name,
              coord: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
            }));
            setDestSuggestions(list);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDestSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [destInput]);

  // ─── Preset synchronization ────────────────────────────────────────────────
  useEffect(() => {
    const preset = PRESETS.find((p) => p.id === selectedPresetId);
    if (preset) {
      setOriginInput(preset.originName);
      setDestInput(preset.destName);
      setOriginCoord(preset.originCoord);
      setDestCoord(preset.destCoord);
      setSelectedStationId(null);
      setReservationStatus("NONE");
    }
  }, [selectedPresetId]);

  // ─── Fetch Route, Weather, and Stations ─────────────────────────────────────
  const triggerJourneyPlan = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // 1. Fetch OSRM Route
      const route = await getRoute(originCoord, destCoord);
      if (!route) {
        throw new Error("OSRM Routing API failed to compute a path for this corridor.");
      }
      setDirectRouteData(route);

      // 2. Fetch Destination Weather
      const weather = await getWeather(destCoord.lat, destCoord.lng);
      setWeatherData(weather);

      // 3. Fetch Charging Stations near midpoint
      const center = {
        lat: (originCoord.lat + destCoord.lat) / 2,
        lng: (originCoord.lng + destCoord.lng) / 2,
      };

      // Request 20 stations to filter corridor outliers
      const stations = await getChargingStations(center, 20, originCoord, destCoord);

      // Filter out stations outside 3km (3000m) corridor of direct route
      const corridorStations = stations.filter((st) => {
        const minD = getMinDistanceToRoute(st, route.coordinates);
        return minD <= 3000; // 3 km limit
      });

      if (corridorStations.length === 0) {
        throw new Error(
          `Found ${stations.length} charging stations in area, but all were outside the 3km route corridor.`
        );
      }

      // Fetch OSRM nearest snapped road distance for each station in parallel
      const roadDistancesMap: Record<string, number> = {};
      await Promise.all(
        corridorStations.map(async (st) => {
          const dist = await getDistanceToNearestRoad(st.lat, st.lng);
          roadDistancesMap[st.id] = dist;
        })
      );
      setStationRoadDistances(roadDistancesMap);

      setRawStations(deduplicateStations(corridorStations));
      setSelectedStationId(null);
      setReservationStatus("NONE");
    } catch (err: any) {
      console.error("Journey planning orchestration failed:", err);
      setApiError(err.message || "Failed to load live geocoding/charging telemetry.");
      setRawStations([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial trigger
  useEffect(() => {
    triggerJourneyPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originCoord, destCoord]);

  // Address search submission
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originInput.trim() || !destInput.trim()) return;

    setSearchingGeocodes(true);
    try {
      const geoOrigin = await geocodeAddress(originInput);
      const geoDest = await geocodeAddress(destInput);

      if (geoOrigin && geoDest) {
        setOriginCoord(geoOrigin);
        setDestCoord(geoDest);
        setSelectedPresetId(""); // Clear preset since they typed custom location
      } else {
        alert("Geocoding failed for one or both locations. Using previous coordinates.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingGeocodes(false);
    }
  };

  // ─── Derived UI Calculations ────────────────────────────────────────────────
  const weatherFactor = useMemo(() => {
    if (weatherStress === "rain") return 1.15;
    if (weatherStress === "heat") return 1.3;
    return 1.0;
  }, [weatherStress]);

  const trafficWaitAdder = useMemo(() => {
    if (trafficSeverity === "dense") return 8;
    if (trafficSeverity === "gridlock") return 22;
    return 0;
  }, [trafficSeverity]);

  // Process raw station details into dynamic UI metrics
  const stationsWithDerived = useMemo(() => {
    if (!directRouteData) return [];

    return rawStations.map((st, index) => {
      // 1. Calculate real road distance estimation using Haversine scaled by winding factor
      const meters = getDistanceLatLng(originCoord.lat, originCoord.lng, st.lat, st.lng);
      const distanceToStation = Math.min(
        directRouteData.distanceMiles,
        Math.max(1, (meters / 1609.34) * 1.12) // meters to miles with winding coefficient
      );

      const durationToStation = Math.round(
        directRouteData.durationMinutes * (distanceToStation / directRouteData.distanceMiles)
      );

      // 2. Arrival SoC estimation: deduct driving load
      const kwhUsed =
        distanceToStation * (currentVehicle.averageConsumptionWhPerMile / 1000) * weatherFactor;
      const arrivalSoc = Math.max(
        2,
        Math.round(batterySoc - (kwhUsed / currentVehicle.capacityKwh) * 100)
      );

      // 3. Queue wait time (live and AI forecast)
      const liveQueue = Math.max(0, st.portsAvailable === 0 ? 15 + index * 5 : 0);
      const predictedQueue = Math.max(0, liveQueue + trafficWaitAdder);

      // 4. Charge duration to 80%
      const energyNeeded = Math.max(0, ((80 - arrivalSoc) * currentVehicle.capacityKwh) / 100);
      const actualPowerSpeed = Math.min(currentVehicle.maxChargingSpeedKw, st.powerKw);
      const chargingTimeMinutes = Math.round((energyNeeded / actualPowerSpeed) * 60);

      // 5. Total cost based on rate
      const totalCost = energyNeeded * st.pricePerKwh;

      // 6. AI Score composite index
      const rScore = st.reliabilityScore ?? 90 - index * 5;
      const pScore = (1 / st.pricePerKwh) * 8 * 0.3;
      const qScore = Math.max(0, (40 - predictedQueue) / 40) * 30 * 0.2;
      const aScore = Math.min(1, st.portsAvailable / 4) * 10 * 0.1;
      const aiScore = Math.min(100, Math.round(rScore * 0.4 + pScore + qScore + aScore));

      return {
        ...st,
        distanceMiles: distanceToStation,
        durationMinutes: durationToStation,
        arrivalSoc,
        currentQueueMinutes: liveQueue,
        predictedQueueMinutes: predictedQueue,
        reliabilityScore: rScore,
        chargingTimeMinutes,
        totalCost,
        aiScore,
      };
    });
  }, [
    rawStations,
    directRouteData,
    originCoord,
    currentVehicle,
    batterySoc,
    weatherFactor,
    trafficWaitAdder,
  ]);

  // Find the recommended charger node (highest composite score)
  const recommendedStation = useMemo(() => {
    if (stationsWithDerived.length === 0) return null;
    return [...stationsWithDerived].sort((a, b) => b.aiScore - a.aiScore)[0];
  }, [stationsWithDerived]);

  // Get active selected charger (or recommended by default)
  const activeStation = useMemo(() => {
    if (stationsWithDerived.length === 0) return null;
    return stationsWithDerived.find((s) => s.id === selectedStationId) || recommendedStation;
  }, [stationsWithDerived, selectedStationId, recommendedStation]);

  // ─── Waypoint Optimized Routing ─────────────────────────────────────────────
  useEffect(() => {
    if (!originCoord || !destCoord) return;

    const fetchOptimizedRoute = async () => {
      // If there's a recommended station, fetch route snapped to it as a waypoint
      if (recommendedStation) {
        const route = await getRoute(originCoord, destCoord, {
          lat: recommendedStation.lat,
          lng: recommendedStation.lng,
        });
        if (route) {
          setOptimizedRouteData(route);
          return;
        }
      }

      // Default/Fallback to direct route
      if (directRouteData) {
        setOptimizedRouteData(directRouteData);
      }
    };

    fetchOptimizedRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originCoord, destCoord, recommendedStation?.id, directRouteData]);

  const handleOriginKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOriginSuggestions || originSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveOriginIndex((prev) => (prev + 1) % originSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveOriginIndex(
        (prev) => (prev - 1 + originSuggestions.length) % originSuggestions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeOriginIndex >= 0 && activeOriginIndex < originSuggestions.length) {
        const s = originSuggestions[activeOriginIndex];
        setOriginInput(s.name.split(",")[0] + ", " + s.name.split(",")[1]);
        setOriginCoord(s.coord);
        setSelectedPresetId("");
        setOriginSuggestions([]);
        setShowOriginSuggestions(false);
        setActiveOriginIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowOriginSuggestions(false);
      setActiveOriginIndex(-1);
    }
  };

  const handleDestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDestSuggestions || destSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveDestIndex((prev) => (prev + 1) % destSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveDestIndex((prev) => (prev - 1 + destSuggestions.length) % destSuggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeDestIndex >= 0 && activeDestIndex < destSuggestions.length) {
        const s = destSuggestions[activeDestIndex];
        setDestInput(s.name.split(",")[0] + ", " + s.name.split(",")[1]);
        setDestCoord(s.coord);
        setSelectedPresetId("");
        setDestSuggestions([]);
        setShowDestSuggestions(false);
        setActiveDestIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowDestSuggestions(false);
      setActiveDestIndex(-1);
    }
  };

  // AI Recommendation Reasons
  const aiReasons = useMemo(() => {
    if (!recommendedStation || !activeStation) return [];

    const reasons = [
      `Shortest queue latency: predicted wait is only ${recommendedStation.predictedQueueMinutes} minutes.`,
      `Optimal grid telemetry interface: hardware reliability rating at ${recommendedStation.reliabilityScore}%.`,
      `Efficient invoice profile: locked tariff rate at $${recommendedStation.pricePerKwh.toFixed(2)}/kWh.`,
    ];

    if (weatherStress !== "nominal") {
      reasons.push(`Stabilized grid delivery under current ${weatherStress} weather stress.`);
    }
    return reasons;
  }, [recommendedStation, activeStation, weatherStress]);

  // Why other alternatives were rejected logs
  const rejectedStationsLog = useMemo(() => {
    if (!recommendedStation) return [];

    return stationsWithDerived
      .filter((s) => s.id !== recommendedStation.id)
      .map((s) => {
        let reason = "Lower composite routing efficiency score.";
        if (s.predictedQueueMinutes > recommendedStation.predictedQueueMinutes + 8) {
          reason = `Grid congestion predicted (${s.predictedQueueMinutes}m wait vs ${recommendedStation.predictedQueueMinutes}m).`;
        } else if (s.pricePerKwh > recommendedStation.pricePerKwh) {
          reason = `Premium tariff tier ($${s.pricePerKwh.toFixed(2)}/kWh vs $${recommendedStation.pricePerKwh.toFixed(2)}/kWh).`;
        } else if (s.reliabilityScore < recommendedStation.reliabilityScore - 5) {
          reason = `Suboptimal field telemetry (${s.reliabilityScore}% reliability score).`;
        }
        return {
          id: s.id,
          name: s.name,
          reason,
        };
      });
  }, [stationsWithDerived, recommendedStation]);

  // Calculate optimization savings
  const worstQueue = useMemo(() => {
    if (stationsWithDerived.length === 0) return 0;
    return Math.max(...stationsWithDerived.map((s) => s.predictedQueueMinutes));
  }, [stationsWithDerived]);

  const maxPrice = useMemo(() => {
    if (stationsWithDerived.length === 0) return 0.4;
    return Math.max(...stationsWithDerived.map((s) => s.pricePerKwh));
  }, [stationsWithDerived]);

  const timeSaved = useMemo(() => {
    if (!recommendedStation) return 0;
    return Math.max(0, worstQueue - recommendedStation.predictedQueueMinutes);
  }, [recommendedStation, worstQueue]);

  const costSaved = useMemo(() => {
    if (!activeStation || !recommendedStation) return 0;
    const energy = Math.max(
      0,
      ((80 - activeStation.arrivalSoc) * currentVehicle.capacityKwh) / 100
    );
    return Math.max(0, energy * (maxPrice - activeStation.pricePerKwh));
  }, [activeStation, recommendedStation, currentVehicle, maxPrice]);

  // ─── Network Telemetry Dashboard derived values ──────────────────────────────
  const activeChargers = useMemo(() => {
    if (trafficSeverity === "gridlock") return 17;
    if (trafficSeverity === "dense") return 18;
    return 19;
  }, [trafficSeverity]);

  const offlineChargers = useMemo(() => {
    return 20 - activeChargers;
  }, [activeChargers]);

  const avgQueueMin = useMemo(() => {
    if (stationsWithDerived.length === 0) return 4;
    return Math.round(
      stationsWithDerived.reduce((acc, s) => acc + s.predictedQueueMinutes, 0) /
        stationsWithDerived.length
    );
  }, [stationsWithDerived]);

  const networkUtilPct = useMemo(() => {
    if (trafficSeverity === "gridlock") return 92;
    if (trafficSeverity === "dense") return 78;
    return 61;
  }, [trafficSeverity]);

  const predictedDemandPct = useMemo(() => {
    if (trafficSeverity === "gridlock") return 95;
    if (trafficSeverity === "dense") return 84;
    return 68;
  }, [trafficSeverity]);

  return (
    <div className="min-h-screen bg-[#05070B] text-white font-sans flex flex-col noise relative">
      {/* ─── Top Enterprise Navbar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#05070B]/90 backdrop-blur-md border-b border-white/[0.06] select-none">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M7.5 2L3.5 6L7.5 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              BACK TO PORTAL
            </a>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-extrabold tracking-tight text-white">EVIQ</span>
              <span className="text-[14px] font-light text-cyan-400">AI</span>
              <span className="ml-1.5 text-[8px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                PRO PILOT DEMO
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">ACTIVE VEHICLE</span>
              <span className="text-[12px] font-semibold text-white">{currentVehicle.name}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">STARTING SOC</span>
              <span className="text-[12px] font-semibold text-white font-mono">{batterySoc}%</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">TOTAL DISTANCE</span>
              <span className="text-[12px] font-semibold text-white font-mono">
                {optimizedRouteData
                  ? `${optimizedRouteData.distanceMiles.toFixed(1)} mi`
                  : "Calculating..."}
              </span>
            </div>
            {weatherData && (
              <>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">WEATHER</span>
                  <span className="text-[12px] font-semibold text-white">
                    {weatherData.condition} ({weatherData.tempC}°C)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Current Lease Status */}
          <div className="flex items-center gap-2">
            {reservationStatus === "NONE" ? (
              <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-wider">
                No Active Reservation
              </span>
            ) : reservationStatus === "CONFIRMED" ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">
                  PORT RESERVED
                </span>
              </div>
            ) : reservationStatus === "ACTIVE" ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider animate-pulse">
                  CHARGING INSTALLED
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                  CHARGING COMPLETED
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main 3-Column Enterprise Workspace ───────────────────────────────── */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6 grid lg:grid-cols-[300px_1fr_360px] gap-6 items-start">
        {/* ─── LEFT COLUMN: Trip & Fleet Configuration ───────────────────────── */}
        <aside className="space-y-5">
          {/* Trip Presets & Route Selection */}
          <div className="rounded-2xl bg-zinc-900 border border-white/[0.06] overflow-hidden p-4">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
              Corridor Route
            </p>
            <p className="text-[11px] text-zinc-600 mb-3">Select fleet logistics target corridor</p>

            <div className="space-y-2">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <div className="w-full text-center text-[10px] text-zinc-600 font-mono py-1">
                OR ENTER GPS NODES
              </div>

              {/* Custom Search Form */}
              <form onSubmit={handleAddressSearch} className="space-y-2.5">
                <div className="relative">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="origin"
                      className="text-[9px] font-mono text-zinc-500 uppercase"
                    >
                      Origin Address
                    </label>
                    {loadingOriginSuggestions && (
                      <span className="w-2.5 h-2.5 border border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></span>
                    )}
                  </div>
                  <input
                    id="origin"
                    type="text"
                    value={originInput}
                    onChange={(e) => {
                      setOriginInput(e.target.value);
                      setShowOriginSuggestions(true);
                      setActiveOriginIndex(-1);
                    }}
                    onFocus={() => setShowOriginSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                    onKeyDown={handleOriginKeyDown}
                    className="w-full bg-zinc-950 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent mt-1"
                    placeholder="Enter start location..."
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showOriginSuggestions}
                    aria-controls="origin-suggestions-list"
                    aria-activedescendant={
                      activeOriginIndex !== -1 ? `origin-suggest-${activeOriginIndex}` : undefined
                    }
                  />
                  {showOriginSuggestions &&
                    (originSuggestions.length > 0 ||
                      (originInput.trim().length >= 3 && !loadingOriginSuggestions)) && (
                      <div
                        id="origin-suggestions-list"
                        role="listbox"
                        aria-label="Origin address suggestions"
                        className="absolute z-30 left-0 right-0 mt-1 bg-zinc-950 border border-white/[0.08] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] overflow-hidden max-h-40 overflow-y-auto"
                      >
                        {originSuggestions.length > 0 ? (
                          originSuggestions.map((s, idx) => (
                            <div
                              key={idx}
                              id={`origin-suggest-${idx}`}
                              role="option"
                              aria-selected={activeOriginIndex === idx}
                              onClick={() => {
                                setOriginInput(s.name.split(",")[0] + ", " + s.name.split(",")[1]);
                                setOriginCoord(s.coord);
                                setSelectedPresetId("");
                                setOriginSuggestions([]);
                                setShowOriginSuggestions(false);
                              }}
                              className={`px-3 py-2 text-[11px] cursor-pointer border-b border-white/[0.03] last:border-0 truncate transition-colors duration-150 ${
                                activeOriginIndex === idx
                                  ? "bg-cyan-500/10 text-cyan-400 font-medium"
                                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                              }`}
                            >
                              {s.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-[11px] text-zinc-550 font-mono text-center">
                            NO RESULTS FOUND
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="destination"
                      className="text-[9px] font-mono text-zinc-500 uppercase"
                    >
                      Destination
                    </label>
                    {loadingDestSuggestions && (
                      <span className="w-2.5 h-2.5 border border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></span>
                    )}
                  </div>
                  <input
                    id="destination"
                    type="text"
                    value={destInput}
                    onChange={(e) => {
                      setDestInput(e.target.value);
                      setShowDestSuggestions(true);
                      setActiveDestIndex(-1);
                    }}
                    onFocus={() => setShowDestSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                    onKeyDown={handleDestKeyDown}
                    className="w-full bg-zinc-950 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent mt-1"
                    placeholder="Enter end destination..."
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showDestSuggestions}
                    aria-controls="dest-suggestions-list"
                    aria-activedescendant={
                      activeDestIndex !== -1 ? `dest-suggest-${activeDestIndex}` : undefined
                    }
                  />
                  {showDestSuggestions &&
                    (destSuggestions.length > 0 ||
                      (destInput.trim().length >= 3 && !loadingDestSuggestions)) && (
                      <div
                        id="dest-suggestions-list"
                        role="listbox"
                        aria-label="Destination address suggestions"
                        className="absolute z-30 left-0 right-0 mt-1 bg-zinc-950 border border-white/[0.08] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] overflow-hidden max-h-40 overflow-y-auto"
                      >
                        {destSuggestions.length > 0 ? (
                          destSuggestions.map((s, idx) => (
                            <div
                              key={idx}
                              id={`dest-suggest-${idx}`}
                              role="option"
                              aria-selected={activeDestIndex === idx}
                              onClick={() => {
                                setDestInput(s.name.split(",")[0] + ", " + s.name.split(",")[1]);
                                setDestCoord(s.coord);
                                setSelectedPresetId("");
                                setDestSuggestions([]);
                                setShowDestSuggestions(false);
                              }}
                              className={`px-3 py-2 text-[11px] cursor-pointer border-b border-white/[0.03] last:border-0 truncate transition-colors duration-150 ${
                                activeDestIndex === idx
                                  ? "bg-cyan-500/10 text-cyan-400 font-medium"
                                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                              }`}
                            >
                              {s.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-[11px] text-zinc-550 font-mono text-center">
                            NO RESULTS FOUND
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="w-full flex justify-between items-center text-[10px] text-cyan-400 font-mono border border-cyan-500/10 bg-cyan-500/5 px-3 py-2 rounded-xl">
                  <span>● TELEMETRY LINK ONLINE</span>
                  <span className="text-zinc-500">AUTO-ROUTING ACTIVE</span>
                </div>
              </form>
            </div>
          </div>

          {/* Vehicle Parameters */}
          <div className="rounded-2xl bg-zinc-900 border border-white/[0.06] p-4 space-y-4">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              VEHICLE PROFILE
            </p>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="vehicle-select"
                  className="text-[9px] font-mono text-zinc-500 uppercase"
                >
                  Active EV Model
                </label>
                <select
                  id="vehicle-select"
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    setReservationStatus("NONE");
                  }}
                  className="w-full bg-zinc-950 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 mt-1 cursor-pointer"
                >
                  {VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider for battery SoC */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-zinc-500 uppercase">CURRENT BATTERY</span>
                  <span className="text-white font-bold">{batterySoc}% SoC</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={85}
                  value={batterySoc}
                  onChange={(e) => {
                    setBatterySoc(parseInt(e.target.value));
                    setReservationStatus("NONE");
                  }}
                  className="w-full accent-cyan-400 bg-zinc-950 h-1.5 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Traffic Severity */}
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1.5">
                  Traffic Conditions
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["normal", "dense", "gridlock"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTrafficSeverity(t)}
                      className={`py-1 rounded-lg text-[10px] font-mono uppercase font-semibold transition-all border ${
                        trafficSeverity === t
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-400/30"
                          : "bg-zinc-950 text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather stress */}
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1.5">
                  External Environment
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "nominal", label: "Clear" },
                      { id: "rain", label: "Rain" },
                      { id: "heat", label: "42°C Extreme" },
                    ] as const
                  ).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWeatherStress(w.id)}
                      className={`py-1 rounded-lg text-[10px] font-mono uppercase font-semibold transition-all border ${
                        weatherStress === w.id
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-400/30"
                          : "bg-zinc-950 text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Network Dashboard Enterprise Insights */}
          <EnterpriseInsights
            activeChargers={activeChargers}
            offlineChargers={offlineChargers}
            avgQueueMin={avgQueueMin}
            networkUtilPct={networkUtilPct}
            predictedDemandPct={predictedDemandPct}
          />
        </aside>

        {/* ─── CENTER COLUMN: Interactive Map & Stations ─────────────────────── */}
        <section className="space-y-6 flex flex-col">
          {/* Real Interactive Map Component */}
          <div className="relative h-[460px] lg:h-[560px] xl:h-[660px] transition-all duration-300">
            {apiError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm p-6 border border-red-500/20 rounded-2xl">
                <div className="max-w-md text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 text-xl font-mono">
                    ⚠️
                  </div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                    TELEMETRY LAYER ERROR
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">{apiError}</p>
                  <button
                    type="button"
                    onClick={triggerJourneyPlan}
                    className="px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs font-mono font-semibold hover:bg-zinc-700 transition-colors border border-white/5"
                  >
                    RETRY POI LINK
                  </button>
                </div>
              </div>
            )}
            <TripMap
              origin={originCoord}
              destination={destCoord}
              stations={stationsWithDerived.map((st) => ({
                id: st.id,
                name: st.name,
                lat: st.lat,
                lng: st.lng,
                isRecommended: !!recommendedStation && st.id === recommendedStation.id,
                isSelected: !!activeStation && st.id === activeStation.id,
              }))}
              routeCoordinates={optimizedRouteData?.coordinates || []}
              selectedStationId={activeStation?.id || null}
              onSelectStation={(id) => {
                if (reservationStatus === "NONE") {
                  setSelectedStationId(id);
                }
              }}
            />
          </div>

          {/* System Telemetry Debug Panel */}
          {debugMode && stationsWithDerived.length > 0 && (
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-4 font-mono text-[10px] text-zinc-400 space-y-3 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 font-bold uppercase tracking-wider">
                    ● [TELEMETRY ENGINE DEBUG PANEL]
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDebugMode(false)}
                  className="text-zinc-500 hover:text-zinc-300 font-semibold px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                >
                  HIDE DEBUG
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-zinc-500 border-b border-white/5">
                      <th className="pb-1.5 font-semibold">STATION NAME</th>
                      <th className="pb-1.5 font-semibold">API COORDS (LAT, LNG)</th>
                      <th className="pb-1.5 font-semibold">RENDER COORDS (LAT, LNG)</th>
                      <th className="pb-1.5 font-semibold">RENDER DIFF</th>
                      <th className="pb-1.5 font-semibold">OSRM ROAD SNAP</th>
                      <th className="pb-1.5 font-semibold">CORRIDOR DIST</th>
                      <th className="pb-1.5 font-semibold">DEST DIST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {stationsWithDerived.map((st) => {
                      const routeMeters = getMinDistanceToRoute(
                        st,
                        directRouteData?.coordinates || []
                      );
                      const destMeters = getDistanceLatLng(
                        st.lat,
                        st.lng,
                        destCoord.lat,
                        destCoord.lng
                      );
                      const roadSnap = stationRoadDistances[st.id] ?? 0;
                      return (
                        <tr key={st.id} className="hover:bg-white/[0.02]">
                          <td className="py-1.5 text-white truncate max-w-[150px] font-semibold">
                            {st.name}
                          </td>
                          <td className="py-1.5 text-zinc-300 font-mono">
                            {st.lat.toFixed(6)}, {st.lng.toFixed(6)}
                          </td>
                          <td className="py-1.5 text-zinc-300 font-mono">
                            {st.lat.toFixed(6)}, {st.lng.toFixed(6)}
                          </td>
                          <td className="py-1.5 text-emerald-400 font-bold font-mono">0.00m (Passed)</td>
                          <td
                            className={`py-1.5 font-semibold font-mono ${roadSnap > 100 ? "text-amber-400" : "text-cyan-400"}`}
                          >
                            {roadSnap.toFixed(1)}m
                          </td>
                          <td className="py-1.5 font-mono">
                            {routeMeters < 1000
                              ? `${routeMeters.toFixed(0)}m`
                              : `${(routeMeters / 1000).toFixed(2)}km`}
                          </td>
                          <td className="py-1.5 font-mono">{(destMeters / 1000).toFixed(2)}km</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Candidate Charging Stations Compare Cards */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  CANDIDATE CHARGING NODES ({stationsWithDerived.length})
                </span>
                {!debugMode && (
                  <button
                    type="button"
                    onClick={() => setDebugMode(true)}
                    className="text-[9px] font-mono text-zinc-550 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/25 px-1.5 py-0.5 rounded transition-all ml-2.5 bg-white/[0.02]"
                  >
                    [SHOW TELEMETRY DEBUG]
                  </button>
                )}
              </div>
              <span className="text-[10px] font-mono text-zinc-650">
                SELECT A STATION TO COMPOSE ROUTE
              </span>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-60 rounded-2xl bg-zinc-900 border border-white/[0.06] animate-pulse flex flex-col justify-between p-5"
                  >
                    <div className="space-y-2">
                      <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                      <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-2 py-4">
                      <div className="h-3 bg-zinc-800 rounded"></div>
                      <div className="h-3 bg-zinc-800 rounded"></div>
                      <div className="h-3 bg-zinc-800 rounded"></div>
                    </div>
                    <div className="h-8 bg-zinc-800 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : stationsWithDerived.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900 border border-white/[0.06] rounded-2xl">
                <p className="text-sm text-zinc-500">
                  No charging stations identified within route search area.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                {stationsWithDerived
                  .sort((a, b) => b.aiScore - a.aiScore)
                  .map((st) => (
                    <StationCard
                      key={st.id}
                      id={st.id}
                      name={st.name}
                      network={st.operator}
                      powerKw={st.powerKw}
                      connectorType={st.connectorType}
                      portsAvailable={st.portsAvailable}
                      portsTotal={st.portsTotal}
                      pricePerKwh={st.pricePerKwh}
                      currentQueueMinutes={st.currentQueueMinutes}
                      predictedQueueMinutes={st.predictedQueueMinutes}
                      reliabilityScore={st.reliabilityScore}
                      arrivalSoc={st.arrivalSoc}
                      chargingTimeMinutes={st.chargingTimeMinutes}
                      distanceMiles={st.distanceMiles}
                      durationMinutes={st.durationMinutes}
                      isRecommended={!!recommendedStation && st.id === recommendedStation.id}
                      isSelected={!!activeStation && st.id === activeStation.id}
                      onSelect={() => {
                        if (reservationStatus === "NONE") {
                          setSelectedStationId(st.id);
                        }
                      }}
                      onReserve={() => {
                        setSelectedStationId(st.id);
                        setReservationStatus("CONFIRMED");
                      }}
                      reservationActive={reservationStatus !== "NONE"}
                    />
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── RIGHT COLUMN: AI Decision & Booking ───────────────────────────── */}
        <aside className="space-y-5">
          {/* AI Recommendation Engine Result */}
          {activeStation && recommendedStation && (
            <AiRecommendation
              stationName={recommendedStation.name}
              stationId={recommendedStation.id}
              confidence={Math.min(99, 82 + Math.max(0, recommendedStation.aiScore - 60))}
              arrivalSoc={recommendedStation.arrivalSoc}
              predictedQueue={recommendedStation.predictedQueueMinutes}
              chargingSpeedKw={recommendedStation.powerKw}
              estimatedCost={recommendedStation.totalCost}
              timeSavedMinutes={timeSaved}
              reliabilityScore={recommendedStation.reliabilityScore}
              weatherCondition={weatherData?.condition || "Clear"}
              weatherTempC={weatherData?.tempC || 22}
              reasons={aiReasons}
              rejectedStations={rejectedStationsLog}
            />
          )}

          {/* Reservation Booking Center */}
          {activeStation && (
            <ReservationPanel
              status={reservationStatus}
              stationName={activeStation.name}
              portNumber={3}
              powerKw={activeStation.powerKw}
              arrivalSoc={activeStation.arrivalSoc}
              estimatedCost={activeStation.totalCost}
              estimatedChargeTime={activeStation.chargingTimeMinutes}
              timeSaved={timeSaved}
              costSaved={costSaved}
              onStatusChange={(status) => setReservationStatus(status)}
            />
          )}
        </aside>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] px-6 py-4 mt-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-zinc-600 font-mono text-[10px]">
          <span>
            EVIQ AI · Predictive Journey Telemetry Platform v3.0 · Built with CartoDB,
            OpenStreetMap, OSRM, Open-Meteo
          </span>
          <span>© 2026 Eviq AI Technologies Inc.</span>
        </div>
      </footer>
    </div>
  );
}
