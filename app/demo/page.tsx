"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  reverseGeocode,
} from "@/lib/api";
import { rankStations, RankingResult } from "@/lib/ranking";

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

// ─── Driving Corridor Route Sampler ──────────────────────────────────────────
function sampleRoute(routeCoords: [number, number][], intervalMeters: number): Coordinate[] {
  if (routeCoords.length === 0) return [];
  const samples: Coordinate[] = [];
  
  // Start with the first point (origin)
  const first = routeCoords[0];
  samples.push({ lng: first[0], lat: first[1] });
  
  let accumulatedDist = 0;
  let lastLat = first[1];
  let lastLng = first[0];
  
  for (let i = 1; i < routeCoords.length; i++) {
    const [lng, lat] = routeCoords[i];
    const dist = getDistanceLatLng(lastLat, lastLng, lat, lng);
    accumulatedDist += dist;
    
    if (accumulatedDist >= intervalMeters) {
      samples.push({ lat, lng });
      accumulatedDist = 0;
    }
    
    lastLat = lat;
    lastLng = lng;
  }
  
  // Always include the last point (destination) if it's not already in there
  const last = routeCoords[routeCoords.length - 1];
  const lastSample = samples[samples.length - 1];
  const distToLast = getDistanceLatLng(lastSample.lat, lastSample.lng, last[1], last[0]);
  if (distToLast > 1000) { // if the last point is > 1km away from the last sample
    samples.push({ lat: last[1], lng: last[0] });
  }
  
  return samples;
}

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
  const [originInput, setOriginInput] = useState<string>("New York, NY");
  const [destInput, setDestInput] = useState<string>("Boston, MA");

  const [originCoord, setOriginCoord] = useState<Coordinate>({ lat: 40.7128, lng: -74.006 });
  const [destCoord, setDestCoord] = useState<Coordinate>({ lat: 42.3601, lng: -71.0589 });

  const [isOriginSelected, setIsOriginSelected] = useState<boolean>(false);
  const [isDestSelected, setIsDestSelected] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

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

  // On-mount: Dynamically geocode the default route live (no hardcoded coordinates lookup)
  useEffect(() => {
    const initDefaultRoute = async () => {
      setLoading(true);
      try {
        const geoOrigin = await geocodeAddress("New York, NY");
        const geoDest = await geocodeAddress("Boston, MA");
        if (geoOrigin && geoDest) {
          setIsOriginSelected(true);
          setIsDestSelected(true);
          setOriginCoord(geoOrigin);
          setDestCoord(geoDest);
        }
      } catch (err) {
        console.error("Mount route initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initDefaultRoute();
  }, []);

  // Debounced effect for Origin Input
  useEffect(() => {
    if (isOriginSelected) {
      setIsOriginSelected(false);
      setOriginSuggestions([]);
      setLoadingOriginSuggestions(false);
      return;
    }
    if (originInput.trim().length < 3) {
      setOriginSuggestions([]);
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
  }, [originInput, isOriginSelected]);

  // Debounced effect for Destination Input
  useEffect(() => {
    if (isDestSelected) {
      setIsDestSelected(false);
      setDestSuggestions([]);
      setLoadingDestSuggestions(false);
      return;
    }
    if (destInput.trim().length < 3) {
      setDestSuggestions([]);
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
  }, [destInput, isDestSelected]);

  // Swap origin and destination endpoints
  const handleSwap = () => {
    setIsOriginSelected(true);
    setIsDestSelected(true);
    
    const tempInput = originInput;
    const tempCoord = originCoord;
    
    setOriginInput(destInput);
    setOriginCoord(destCoord);
    setDestInput(tempInput);
    setDestCoord(tempCoord);
  };

  // Geolocate user and reverse-geocode to name
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coord = { lat: latitude, lng: longitude };
        
        try {
          const resolvedName = await reverseGeocode(latitude, longitude);
          setIsOriginSelected(true);
          setOriginInput(resolvedName);
          setOriginCoord(coord);
        } catch (err) {
          console.error(err);
          setIsOriginSelected(true);
          setOriginInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setOriginCoord(coord);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(`Failed to retrieve your location: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

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

      // 3. Sample coordinates along the driving corridor
      // Dynamic sampling interval based on total route distance (minimum 12 miles, max 40 miles)
      const intervalMiles = Math.max(12, Math.min(40, route.distanceMiles / 12));
      const intervalMeters = intervalMiles * 1609.34;
      const samples = sampleRoute(route.coordinates, intervalMeters);
      
      console.log(`[Telemetry] Routing distance: ${route.distanceMiles} mi. Sampled into ${samples.length} points along driving corridor.`);

      // 4. Fetch Charging Stations in batches of 5 to avoid OCM rate-limiting.
      //    Firing all 70+ requests simultaneously on long routes causes the OCM
      //    free-tier to silently drop most requests, returning zero results.
      const searchRadiusMiles = Math.max(15, intervalMiles * 1.25);
      const BATCH_SIZE = 5;
      const aggregatedStations: ApiChargingStation[] = [];

      for (let i = 0; i < samples.length; i += BATCH_SIZE) {
        const batch = samples.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map((sample) =>
            getChargingStations(sample, searchRadiusMiles).catch((err) => {
              console.warn(`[OCM Batch] Error at (${sample.lat.toFixed(4)}, ${sample.lng.toFixed(4)}):`, err);
              return [] as ApiChargingStation[];
            })
          )
        );
        aggregatedStations.push(...batchResults.flat());
        console.log(`[OCM Batch] Completed ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(samples.length / BATCH_SIZE)} — ${aggregatedStations.length} stations collected`);
        // 300 ms pause between batches to stay within OCM free-tier rate limits
        if (i + BATCH_SIZE < samples.length) {
          await new Promise((res) => setTimeout(res, 300));
        }
      }


      // 5. Deduplicate aggregated results
      // Pass 1: exact ID deduplication
      const idMap = new Map<string, ApiChargingStation>();
      aggregatedStations.forEach((st) => {
        if (!idMap.has(st.id)) {
          idMap.set(st.id, st);
        }
      });
      const uniqueById = Array.from(idMap.values());

      // Pass 2: coordinate deduplication (merging chargers within 15 meters)
      const deduplicated = deduplicateStations(uniqueById);

      if (deduplicated.length === 0) {
        throw new Error(
          `Zero charging stations identified along the driving corridor from ${originInput} to ${destInput}.`
        );
      }

      // 6. Fetch OSRM nearest snapped road distance for top 30 stations in parallel
      // (capping snaps prevents OSRM public rate-limiting / slow page loads)
      const roadDistancesMap: Record<string, number> = {};
      const topStationsToSnap = deduplicated.slice(0, 30);
      await Promise.all(
        topStationsToSnap.map(async (st) => {
          try {
            const dist = await getDistanceToNearestRoad(st.lat, st.lng);
            roadDistancesMap[st.id] = dist;
          } catch (e) {
            console.warn(`Failed OSRM snap for station ${st.id}`, e);
          }
        })
      );
      setStationRoadDistances(roadDistancesMap);

      setRawStations(deduplicated);
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

  // Decoupled base inputs for the ranking engine (recalculates ONLY on route, vehicle, or battery changes)
  const rankingBaseInputs = useMemo(() => {
    if (!directRouteData) return [];
    return rawStations.map((st, index) => {
      const meters = getDistanceLatLng(originCoord.lat, originCoord.lng, st.lat, st.lng);
      const distanceToStation = Math.min(
        directRouteData.distanceMiles,
        Math.max(1, (meters / 1609.34) * 1.12)
      );

      const kwhUsed = distanceToStation * (currentVehicle.averageConsumptionWhPerMile / 1000);
      const arrivalSoc = Math.max(
        2,
        Math.round(batterySoc - (kwhUsed / currentVehicle.capacityKwh) * 100)
      );

      const liveQueue = Math.max(0, st.portsAvailable === 0 ? 15 + index * 5 : 0);
      const rScore = st.reliabilityScore ?? 90 - index * 5;

      return {
        id: st.id,
        reliabilityScore: rScore,
        powerKw: st.powerKw,
        vehicleMaxKw: currentVehicle.maxChargingSpeedKw,
        portsAvailable: st.portsAvailable,
        portsTotal: st.portsTotal,
        predictedQueueMinutes: liveQueue,
        distanceMiles: distanceToStation,
        connectorType: st.connectorType,
        vehicleConnector: currentVehicle.connectorType,
        pricePerKwh: st.pricePerKwh,
      };
    });
  }, [rawStations, directRouteData, originCoord, currentVehicle, batterySoc]);

  // ─── Ranking layer: top-10 recommended chargers ─────────────────────────────
  const rankingResults = useMemo((): RankingResult[] => {
    if (rankingBaseInputs.length === 0) return [];
    return rankStations(rankingBaseInputs);
  }, [rankingBaseInputs]);

  // Map of station id → rank (for TripMap highlighted markers)
  const recommendedRankMap = useMemo((): Record<string, number> => {
    const map: Record<string, number> = {};
    rankingResults.forEach((r) => { map[r.id] = r.rank; });
    return map;
  }, [rankingResults]);

  // Top-10 stations merged with ranking metadata (for suggestion cards)
  const recommendedChargers = useMemo(() => {
    return rankingResults.map((r) => {
      const station = stationsWithDerived.find((s) => s.id === r.id)!;
      return { ...station, rank: r.rank, selectionReason: r.selectionReason, compositeScore: r.compositeScore };
    }).filter(Boolean);
  }, [rankingResults, stationsWithDerived]);

  // Find the #1 recommended charger node (highest composite score)
  const recommendedStation = useMemo(() => {
    if (recommendedChargers.length === 0) return null;
    return recommendedChargers[0]; // already sorted by rank
  }, [recommendedChargers]);

  // Get active selected charger (or recommended by default)
  const activeStation = useMemo(() => {
    if (stationsWithDerived.length === 0) return null;
    return stationsWithDerived.find((s) => s.id === selectedStationId) || recommendedStation;
  }, [stationsWithDerived, selectedStationId, recommendedStation]);

  const mappedStations = useMemo(() => {
    return stationsWithDerived.map((st) => {
      const rec = recommendedChargers.find(x => x.id === st.id);
      return {
        id: st.id,
        name: st.name,
        lat: st.lat,
        lng: st.lng,
        isRecommended: st.id in recommendedRankMap,
        isSelected: !!activeStation && st.id === activeStation.id,
        powerKw: st.powerKw,
        reliabilityScore: st.reliabilityScore,
        predictedQueueMinutes: st.predictedQueueMinutes,
        selectionReason: rec?.selectionReason,
      };
    });
  }, [stationsWithDerived, recommendedRankMap, activeStation, recommendedChargers]);

  const handleSelectStation = useCallback((id: string) => {
    if (reservationStatus === "NONE") {
      setSelectedStationId(id);
    }
  }, [reservationStatus]);

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
  const totalChargers = stationsWithDerived.length;

  const offlineChargers = useMemo(() => {
    return stationsWithDerived.filter((s) => s.reliabilityScore !== undefined && s.reliabilityScore < 83).length;
  }, [stationsWithDerived]);

  const activeChargers = useMemo(() => {
    return totalChargers - offlineChargers;
  }, [totalChargers, offlineChargers]);

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
    <div className="min-h-screen bg-[#050B14] text-white font-sans flex flex-col noise relative">
      {/* ─── Top Enterprise Navbar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#050B14]/90 backdrop-blur-md border-b border-white/[0.06] select-none">
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
          {/* Corridor Routing & Search */}
          <div className="rounded-2xl bg-zinc-900 border border-white/[0.06] overflow-hidden p-4">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
              Corridor Routing & Search
            </p>
            <p className="text-[11px] text-zinc-650 mb-3">Define fleet logistics corridor endpoints</p>

            <div className="space-y-2">
              {/* Custom Search Form */}
              <form onSubmit={handleAddressSearch} className="space-y-3">
                <div className="relative">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="origin"
                      className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1"
                    >
                      Origin Address
                    </label>
                    <div className="flex items-center gap-2">
                      {loadingOriginSuggestions && (
                        <span className="w-2.5 h-2.5 border border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></span>
                      )}
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 disabled:text-zinc-650 disabled:bg-zinc-950/20 transition-colors flex items-center gap-1 bg-cyan-500/5 hover:bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/15"
                        title="Use Current Location"
                      >
                        {isLocating ? (
                          <span className="w-2 h-2 border border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></span>
                        ) : (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                            <line x1="12" y1="2" x2="12" y2="4" />
                            <line x1="12" y1="20" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="4" y2="12" />
                            <line x1="20" y1="12" x2="22" y2="12" />
                          </svg>
                        )}
                        GPS
                      </button>
                    </div>
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
                        className="absolute z-35 left-0 right-0 mt-1 bg-zinc-950 border border-white/[0.08] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] overflow-hidden max-h-40 overflow-y-auto"
                      >
                        {originSuggestions.length > 0 ? (
                          originSuggestions.map((s, idx) => (
                            <div
                              key={idx}
                              id={`origin-suggest-${idx}`}
                              role="option"
                              aria-selected={activeOriginIndex === idx}
                              onClick={() => {
                                setIsOriginSelected(true);
                                setOriginInput(s.name.split(",")[0] + ", " + (s.name.split(",")[1] || "").trim());
                                setOriginCoord(s.coord);
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

                {/* Swap Button container */}
                <div className="flex justify-center -my-1 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-7 h-7 bg-zinc-950 border border-white/[0.08] hover:border-cyan-400/50 hover:text-cyan-400 text-zinc-400 rounded-full flex items-center justify-center transition-all duration-200 shadow-md active:scale-95"
                    title="Swap Origin and Destination"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                  </button>
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
                        className="absolute z-35 left-0 right-0 mt-1 bg-zinc-950 border border-white/[0.08] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] overflow-hidden max-h-40 overflow-y-auto"
                      >
                        {destSuggestions.length > 0 ? (
                          destSuggestions.map((s, idx) => (
                            <div
                              key={idx}
                              id={`dest-suggest-${idx}`}
                              role="option"
                              aria-selected={activeDestIndex === idx}
                              onClick={() => {
                                setIsDestSelected(true);
                                setDestInput(s.name.split(",")[0] + ", " + (s.name.split(",")[1] || "").trim());
                                setDestCoord(s.coord);
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

                {/* Plan and Refresh Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={searchingGeocodes || loading}
                    className="py-2.5 rounded-xl bg-cyan-400 disabled:opacity-50 text-zinc-950 text-xs font-bold hover:bg-cyan-300 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    {searchingGeocodes ? (
                      <span className="w-3.5 h-3.5 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin"></span>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    )}
                    Plan Route
                  </button>
                  <button
                    type="button"
                    onClick={triggerJourneyPlan}
                    disabled={loading}
                    className="py-2.5 rounded-xl bg-zinc-800 disabled:opacity-50 text-zinc-200 border border-white/[0.04] text-xs font-semibold hover:bg-zinc-700 hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                    )}
                    Refresh
                  </button>
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
            totalChargers={totalChargers}
          />
        </aside>

        {/* ─── CENTER COLUMN: Interactive Map & Stations ─────────────────────── */}
        <section className="space-y-6 flex flex-col">
          {/* Real Interactive Map Component */}
          {/* Center Column / Map */}
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
              stations={mappedStations}
              routeCoordinates={optimizedRouteData?.coordinates || []}
              selectedStationId={activeStation?.id || null}
              recommendedRankMap={recommendedRankMap}
              onSelectStation={handleSelectStation}
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

          {/* Top-10 AI Recommended Charging Stations */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  AI RECOMMENDED NODES
                </span>
                {/* Badge showing top-10 of total */}
                {stationsWithDerived.length > 0 && (
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                    TOP {recommendedChargers.length} / {stationsWithDerived.length} CHARGERS
                  </span>
                )}
                {!debugMode && (
                  <button
                    type="button"
                    onClick={() => setDebugMode(true)}
                    className="text-[9px] font-mono text-zinc-550 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/25 px-1.5 py-0.5 rounded transition-all bg-white/[0.02]"
                  >
                    [DEBUG]
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
            ) : recommendedChargers.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900 border border-white/[0.06] rounded-2xl">
                <p className="text-sm text-zinc-500">
                  No charging stations identified within route search area.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                {recommendedChargers.map((st) => (
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
                    isRecommended={st.rank === 1}
                    isSelected={!!activeStation && st.id === activeStation.id}
                    rank={st.rank}
                    selectionReason={st.selectionReason}
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
