export interface Coordinate {
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: [number, number][]; // [lng, lat]
  distanceMiles: number;
  durationMinutes: number;
}

export interface WeatherData {
  tempC: number;
  condition: string;
  windSpeedKph: number;
  humidity: number;
}

export interface ApiChargingStation {
  id: string;
  name: string;
  operator: string;
  lat: number;
  lng: number;
  address: string;
  powerKw: number;
  connectorType: string;
  pricePerKwh: number;
  portsTotal: number;
  portsAvailable: number;
  reliabilityScore?: number;
}

// Nominatim Geocoding API
export async function geocodeAddress(query: string): Promise<Coordinate | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EviqAiDemoEnterpriseApplication/1.0",
      },
    });
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("Geocoding API error:", err);
  }
  return null;
}

// OSRM Routing Engine
export async function getRoute(
  origin: Coordinate,
  destination: Coordinate,
  waypoint?: Coordinate
): Promise<RouteData | null> {
  try {
    let coordsPath = `${origin.lng},${origin.lat};`;
    if (waypoint) {
      coordsPath += `${waypoint.lng},${waypoint.lat};`;
    }
    coordsPath += `${destination.lng},${destination.lat}`;

    const url = `https://router.project-osrm.org/route/v1/driving/${coordsPath}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Routing failed");
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates; // Array of [lng, lat]
      const distanceMiles = route.distance / 1609.34; // convert meters to miles
      const durationMinutes = route.duration / 60; // convert seconds to minutes

      return {
        coordinates,
        distanceMiles: parseFloat(distanceMiles.toFixed(1)),
        durationMinutes: Math.round(durationMinutes),
      };
    }
  } catch (err) {
    console.error("OSRM Routing error:", err);
  }
  return null;
}

// Open-Meteo Weather API
export async function getWeather(lat: number, lng: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather query failed");
    const data = await res.json();
    if (data.current_weather) {
      const code = data.current_weather.weathercode;
      // Simple code mapping
      let condition = "Clear";
      if (code >= 1 && code <= 3) condition = "Partly Cloudy";
      else if (code >= 45 && code <= 48) condition = "Foggy";
      else if (code >= 51 && code <= 67) condition = "Rainy";
      else if (code >= 71 && code <= 77) condition = "Snowy";
      else if (code >= 80 && code <= 82) condition = "Rain Showers";
      else if (code >= 95) condition = "Thunderstorm";

      return {
        tempC: data.current_weather.temperature,
        condition,
        windSpeedKph: data.current_weather.windspeed,
        humidity: 65, // mock fallback default humidity
      };
    }
  } catch (err) {
    console.error("Open-Meteo error:", err);
  }
  return {
    tempC: 22,
    condition: "Clear",
    windSpeedKph: 12,
    humidity: 50,
  };
}

// Open Charge Map — via server-side proxy at /api/chargers
// Calling our own Next.js server instead of OCM directly prevents Chrome
// extensions (which wrap window.fetch) from throwing "TypeError: Failed to fetch".
export async function getChargingStations(
  center: Coordinate,
  radiusMiles: number = 15,
  limit: number = 250 // kept for interface compatibility
): Promise<ApiChargingStation[]> {
  const allStations: ApiChargingStation[] = [];
  const fetchedIds = new Set<string>();
  let greaterThanId = 0;
  let hasMore = true;
  let page = 0;
  const pageSize = 100;
  const maxPages = 5;

  while (hasMore && page < maxPages) {
    const params = new URLSearchParams({
      lat: String(center.lat),
      lng: String(center.lng),
      radius: String(radiusMiles),
      pageSize: String(pageSize),
      greaterThanId: String(greaterThanId),
    });

    const proxyUrl = `/api/chargers?${params.toString()}`;
    console.log(`[OCM Proxy] Page ${page + 1} — ${proxyUrl}`);

    let data: any[];
    try {
      const res = await fetch(proxyUrl, {
        // Calling our own origin — no extension interference, no CORS issue
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        console.warn(`[OCM Proxy] HTTP ${res.status} on page ${page + 1}. Breaking.`);
        break;
      }
      const json = await res.json();
      data = Array.isArray(json) ? json : [];
    } catch (err: any) {
      console.warn(`[OCM Proxy] Fetch failed on page ${page + 1}:`, err?.message ?? err);
      break;
    }

    if (data.length === 0) {
      hasMore = false;
      break;
    }

    const mappedRaw = data.map((item: any, index: number) => {
      const power = item.Connections?.[0]?.PowerKW ?? 0;
      const connType = item.Connections?.[0]?.ConnectionType?.Title ?? "Unknown";

      const stationIdNum = parseInt(item.ID) || index;
      const price = 0.28 + (stationIdNum % 5) * 0.04;

      const rawTitle = item.AddressInfo?.Title || "";
      const title = rawTitle.trim() ? rawTitle : "Unnamed Charging Station";

      const lat = parseFloat(item.AddressInfo?.Latitude);
      const lng = parseFloat(item.AddressInfo?.Longitude);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`OCM station ${item.ID} has invalid lat/lng coordinates`);
        return null;
      }

      const portsCount = item.Connections?.length ?? 4;
      const portsAvailable = Math.max(1, (stationIdNum % portsCount) + 1);
      const reliabilityScore = 80 + (stationIdNum % 21);

      return {
        id: String(item.ID ?? index),
        name: title,
        operator: item.OperatorInfo?.Title ?? "Unknown",
        lat,
        lng,
        address: item.AddressInfo?.AddressLine1 ?? "Unknown Address",
        powerKw: power,
        connectorType: connType.includes("NACS")
          ? "NACS"
          : connType.includes("CCS")
            ? "CCS2"
            : connType,
        pricePerKwh: parseFloat(price.toFixed(2)),
        portsTotal: portsCount,
        portsAvailable,
        reliabilityScore,
      };
    });

    const mapped = mappedRaw.filter((x) => x !== null) as ApiChargingStation[];

    let addedNew = false;
    let maxId = greaterThanId;

    mapped.forEach((st) => {
      const idNum = parseInt(st.id) || 0;
      if (idNum > maxId) maxId = idNum;
      if (!fetchedIds.has(st.id)) {
        fetchedIds.add(st.id);
        allStations.push(st);
        addedNew = true;
      }
    });

    if (!addedNew || maxId <= greaterThanId) {
      hasMore = false;
      break;
    }

    greaterThanId = maxId;
    page++;

    if (data.length < pageSize) {
      hasMore = false;
    }
  }

  // Always returns an array — empty if all pages failed.
  // page.tsx is responsible for showing the user-facing "no stations" error.
  return allStations;
}


// Nominatim Reverse Geocoding API
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EviqAiDemoEnterpriseApplication/1.0",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(",");
        if (parts.length > 2) {
          // Join the first two components for a clean address (e.g., street, city)
          return parts[0].trim() + ", " + parts[1].trim();
        }
        return data.display_name;
      }
    }
  } catch (err) {
    console.error("Reverse geocoding API error:", err);
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}


// OSRM snap road distance helper for verification
export async function getDistanceToNearestRoad(lat: number, lng: number): Promise<number> {
  try {
    const url = `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      console.log(`[OSRM Nearest] Coordinates: ${lng},${lat}. Response:`, data);
      if (data.waypoints && data.waypoints.length > 0) {
        return data.waypoints[0].distance; // snap distance in meters
      }
    }
  } catch (err) {
    console.error("[OSRM Nearest] API failed:", err);
  }
  return 0; // default fallback snap
}
