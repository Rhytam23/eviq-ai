/** Launch-city shortcuts. Coordinates are city centres; the map opens a 10 km search there. */
export const INDIA_CITIES = [
  { name: "Delhi NCR", lat: 28.6139, lng: 77.209 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
] as const;

export function cityMapHref(city: { lat: number; lng: number }): string {
  return `/map?${new URLSearchParams({ lat: String(city.lat), lng: String(city.lng) }).toString()}`;
}
