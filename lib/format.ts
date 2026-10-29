const MILES_REGIONS = ["US", "GB", "LR", "MM"];

export function prefersMiles(locale: string | undefined): boolean {
  const region = locale?.split("-")[1]?.toUpperCase();
  return !!region && MILES_REGIONS.includes(region);
}

export function formatDistance(km: number | null, miles: boolean): string {
  if (km === null) return "";
  if (miles) {
    const mi = km / 1.609344;
    return mi < 0.1 ? "<0.1 mi" : `${mi.toFixed(mi < 10 ? 1 : 0)} mi`;
  }
  return km < 0.1 ? "<0.1 km" : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export function timeAgo(iso: string | null, now: number = Date.now()): string {
  if (!iso) return "";
  const diff = Math.max(0, now - Date.parse(iso));
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr} h ago`;
  const days = Math.floor(hr / 24);
  if (days < 60) return `${days} days ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
