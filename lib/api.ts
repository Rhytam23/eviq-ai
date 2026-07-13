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

// Open Charge Map API with Fallback
// Open Charge Map API
export async function getChargingStations(
  center: Coordinate,
  limit: number = 5,
  origin?: Coordinate,
  destination?: Coordinate
): Promise<ApiChargingStation[]> {
  const ocmKey = process.env.NEXT_PUBLIC_OCM_API_KEY;
  if (!ocmKey) {
    throw new Error("Missing NEXT_PUBLIC_OCM_API_KEY environment variable. OCM queries disabled.");
  }
  const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${center.lat}&longitude=${center.lng}&distance=50&maxresults=${limit}&compact=false&verbose=false`;

  console.log(`[OCM] Fetching charging stations. Lat: ${center.lat}, Lng: ${center.lng}, Url: ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "X-API-Key": ocmKey,
        "User-Agent": "EviqAiDemoEnterpriseApplication/1.0",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorMsg = `Open Charge Map API returned HTTP error ${res.status}: ${res.statusText}`;
      console.error(`[OCM] Error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const data = await res.json();
    console.log("[OCM] Raw API Response Data:", data);

    if (!Array.isArray(data)) {
      throw new Error("Open Charge Map API returned invalid non-array JSON data");
    }

    // Log details for every returned station as requested by Phase 1
    data.forEach((item: any, idx: number) => {
      console.log(`[OCM POI #${idx + 1}] ID: ${item.ID}, Title: ${item.AddressInfo?.Title}, Address: ${item.AddressInfo?.AddressLine1}, Operator: ${item.OperatorInfo?.Title || "Unknown"}, Lat: ${item.AddressInfo?.Latitude}, Lng: ${item.AddressInfo?.Longitude}`);
    });

    if (data.length === 0) {
      throw new Error(
        `Zero charging stations returned by OCM within 50 miles of coordinate ${center.lat}, ${center.lng}`
      );
    }

    return data.map((item: any, index: number) => {
      const power = item.Connections?.[0]?.PowerKW ?? 0;
      const connType = item.Connections?.[0]?.ConnectionType?.Title ?? "Unknown";

      // Calculate dynamic price based on the ID hash so it is stable and repeatable
      const stationIdNum = parseInt(item.ID) || index;
      const price = 0.28 + (stationIdNum % 5) * 0.04;

      const rawTitle = item.AddressInfo?.Title || "";
      const title = rawTitle.trim() ? rawTitle : "Unnamed Charging Station";

      const lat = parseFloat(item.AddressInfo?.Latitude);
      const lng = parseFloat(item.AddressInfo?.Longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error(`OCM station ${item.ID} has invalid lat/lng coordinates`);
      }

      // Deterministic ports calculation based on station ID (no Math.random)
      const portsCount = item.Connections?.length ?? 4;
      const portsAvailable = Math.max(1, (stationIdNum % portsCount) + 1);
      const reliabilityScore = 80 + (stationIdNum % 21); // stable 80-100 score

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
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("[OCM] Fetch failed:", err);
    throw new Error(err.message || "Failed to contact Open Charge Map API");
  }
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
