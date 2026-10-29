import { cache } from "react";
import { getStation, type StationLookup } from "@/lib/stationService";
import { isStationId } from "@/lib/validation";

type ShareLookup =
  | (StationLookup & { found: true })
  | { found: false; reason: "invalid" | "not-found" | "unavailable" };

/** Request-scoped lookup shared by the page, its metadata and its preview image. */
export const lookupStation = cache(async (rawId: string): Promise<ShareLookup> => {
  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    return { found: false, reason: "invalid" };
  }
  if (!isStationId(id)) return { found: false, reason: "invalid" };
  try {
    const lookup = await getStation(id);
    return lookup.found ? lookup : { found: false, reason: "not-found" };
  } catch (err) {
    console.error("Station lookup failed", err);
    return { found: false, reason: "unavailable" };
  }
});
