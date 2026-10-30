import { afterEach, describe, expect, it, vi } from "vitest";
import overpass from "./fixtures/overpass.json";
import ocm from "./fixtures/ocm.json";
import {
  buildOcmByIdUrl,
  buildOverpassByIdQuery,
  fetchStationById,
  fetchStations,
  fetchWithRetry,
} from "@/lib/providers";

afterEach(() => vi.unstubAllGlobals());

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("fetchWithRetry", () => {
  it("retries once on a 503 and returns the second response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockResolvedValueOnce(json({ ok: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await fetchWithRetry("https://example.test/x", {});
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries once on a network error", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(json({}));
    vi.stubGlobal("fetch", fetchMock);
    expect((await fetchWithRetry("https://example.test/x", {})).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry client errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await fetchWithRetry("https://example.test/x", {})).status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up after the retry budget and throws the last network error", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchWithRetry("https://example.test/x", {})).rejects.toThrow("fetch failed");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("fetchStations fallback", () => {
  it("falls back to OpenStreetMap when Open Charge Map fails, and says why", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.startsWith("https://api.openchargemap.io")
        ? new Response("", { status: 500 })
        : json(overpass)
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchStations(
      { lat: 48.86, lng: 2.35, radiusKm: 5 },
      { OCM_API_KEY: "k" }
    );
    expect(result.source).toBe("osm");
    expect(result.fallbackReason).toContain("Open Charge Map responded 500");
    expect(result.stations.length).toBe(3);
  });

  it("uses OCM when it answers, sending the key as a header, never in the URL", async () => {
    const fetchMock = vi.fn(async () => json(ocm));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchStations(
      { lat: 52.52, lng: 13.4, radiusKm: 5 },
      { OCM_API_KEY: "secret-key" }
    );
    expect(result.source).toBe("ocm");
    expect(result.fallbackReason).toBeNull();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain("secret-key");
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBe("secret-key");
  });

  it("uses OpenStreetMap directly when no key is configured", async () => {
    const fetchMock = vi.fn(async () => json(overpass));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchStations({ lat: 48.86, lng: 2.35, radiusKm: 5 }, {});
    expect(result.source).toBe("osm");
    expect(result.fallbackReason).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails over to the next Overpass mirror when the first is unreachable", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.startsWith("https://overpass-api.de") ? new Response("", { status: 504 }) : json(overpass)
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchStations({ lat: 48.86, lng: 2.35, radiusKm: 5 }, {});
    expect(result.source).toBe("osm");
    expect(result.stations.length).toBe(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((fetchMock.mock.calls[1] as unknown as [string])[0]).toContain("overpass.kumi.systems");
  });

  it("throws when the only provider fails, so the API can answer 502", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 504 })));
    await expect(fetchStations({ lat: 1, lng: 1, radiusKm: 5 }, {})).rejects.toThrow(
      /Overpass responded 504/
    );
  });
});

describe("fetchStationById", () => {
  it("builds by-id URLs", () => {
    const url = new URL(buildOcmByIdUrl("123"));
    expect(url.searchParams.get("chargepointid")).toBe("123");
    expect(buildOverpassByIdQuery("way", "77")).toBe(
      "[out:json][timeout:25];way(77);out center tags;"
    );
  });

  it("looks up an OSM way and normalises it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json({ elements: [overpass.elements[1]] }))
    );
    const station = await fetchStationById("osm:w7001", {});
    expect(station).toMatchObject({ id: "osm:w7001", cost: "Free", distanceKm: null });
  });

  it("returns null for ocm ids when no key is configured, without calling out", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchStationById("ocm:101", {})).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("looks up an OCM station with a key and returns null when it does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(json([ocm[0]]))
        .mockResolvedValueOnce(json([]))
    );
    expect(await fetchStationById("ocm:101", { OCM_API_KEY: "k" })).toMatchObject({
      id: "ocm:101",
    });
    expect(await fetchStationById("ocm:999", { OCM_API_KEY: "k" })).toBeNull();
  });

  it("rejects unknown id shapes", async () => {
    expect(await fetchStationById("osm:x1", {})).toBeNull();
    expect(await fetchStationById("nope", {})).toBeNull();
  });
});
