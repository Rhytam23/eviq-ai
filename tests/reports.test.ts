import { beforeEach, describe, expect, it } from "vitest";
import { COOLDOWN_MINUTES, createMemoryStore, createSupabaseStore } from "@/lib/reportStore";
import { rateLimit, resetRateLimits } from "@/lib/rateLimit";
import { hashClient } from "@/lib/clientId";
import { parseReportBody, parseStationQuery, isStationId } from "@/lib/validation";
import { vi } from "vitest";

const MIN = 60_000;

describe("memory report store", () => {
  it("accepts a first report and blocks the same client for the cooldown", async () => {
    let t = Date.parse("2026-10-01T12:00:00Z");
    const store = createMemoryStore(() => t);
    const input = { stationId: "ocm:1", status: "working" as const, clientHash: "a" };

    expect(await store.add(input)).toEqual({ ok: true });
    t += 3 * MIN;
    const blocked = await store.add({ ...input, status: "broken" });
    expect(blocked).toEqual({
      ok: false,
      reason: "cooldown",
      retryAfterSec: (COOLDOWN_MINUTES - 3) * 60,
    });

    t += (COOLDOWN_MINUTES - 3) * MIN;
    expect(await store.add({ ...input, status: "broken" })).toEqual({ ok: true });
  });

  it("scopes the cooldown to client and station", async () => {
    const store = createMemoryStore(() => 1_000_000_000_000);
    expect((await store.add({ stationId: "ocm:1", status: "working", clientHash: "a" })).ok).toBe(
      true
    );
    expect((await store.add({ stationId: "ocm:2", status: "working", clientHash: "a" })).ok).toBe(
      true
    );
    expect((await store.add({ stationId: "ocm:1", status: "working", clientHash: "b" })).ok).toBe(
      true
    );
  });

  it("returns recent reports newest first, only for requested stations, and drops expired ones", async () => {
    let t = Date.parse("2026-10-01T00:00:00Z");
    const store = createMemoryStore(() => t);
    await store.add({ stationId: "ocm:1", status: "working", clientHash: "a" });
    t += 20 * MIN;
    await store.add({ stationId: "ocm:1", status: "broken", clientHash: "b" });
    await store.add({ stationId: "ocm:9", status: "busy", clientHash: "b" });

    const recent = await store.recent(["ocm:1"]);
    expect([...recent.keys()]).toEqual(["ocm:1"]);
    expect(recent.get("ocm:1")!.map((r) => r.status)).toEqual(["broken", "working"]);

    t += 73 * 3_600_000;
    expect((await store.recent(["ocm:1"])).size).toBe(0);
  });
});

describe("supabase report store", () => {
  const config = { url: "https://example.supabase.co/", serviceRoleKey: "service-key" };
  const now = () => Date.parse("2026-10-01T12:00:00Z");

  beforeEach(() => vi.restoreAllMocks());

  it("inserts when the cooldown lookup is empty, sending the service key", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("[]", { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createSupabaseStore(config, now).add({
      stationId: "osm:n1",
      status: "working",
      clientHash: "h".repeat(64),
    });
    expect(result).toEqual({ ok: true });

    const [lookupUrl, lookupInit] = fetchMock.mock.calls[0];
    const url = new URL(lookupUrl as string);
    expect(url.origin + url.pathname).toBe("https://example.supabase.co/rest/v1/reports");
    expect(url.searchParams.get("station_id")).toBe("eq.osm:n1");
    expect(url.searchParams.get("created_at")).toBe("gte.2026-10-01T11:50:00.000Z");
    expect((lookupInit as RequestInit).headers).toMatchObject({ apikey: "service-key" });

    const [, insertInit] = fetchMock.mock.calls[1];
    expect(JSON.parse((insertInit as RequestInit).body as string)).toEqual({
      station_id: "osm:n1",
      status: "working",
      client_hash: "h".repeat(64),
    });
  });

  it("returns a cooldown when a recent row exists, without inserting", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ created_at: "2026-10-01T11:55:00.000Z" }]), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);
    const result = await createSupabaseStore(config, now).add({
      stationId: "ocm:5",
      status: "broken",
      clientHash: "h".repeat(64),
    });
    expect(result).toEqual({ ok: false, reason: "cooldown", retryAfterSec: 5 * 60 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws on upstream failure so the API can report it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    await expect(createSupabaseStore(config, now).recent(["ocm:1"])).rejects.toThrow(/500/);
  });

  it("maps recent rows by station", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            { station_id: "ocm:1", status: "broken", created_at: "2026-10-01T11:00:00Z" },
            { station_id: "ocm:1", status: "working", created_at: "2026-10-01T09:00:00Z" },
          ]),
          { status: 200 }
        )
      )
    );
    const recent = await createSupabaseStore(config, now).recent(["ocm:1"]);
    expect(recent.get("ocm:1")).toEqual([
      { status: "broken", at: "2026-10-01T11:00:00Z" },
      { status: "working", at: "2026-10-01T09:00:00Z" },
    ]);
  });
});

describe("validation", () => {
  it("validates station ids", () => {
    expect(isStationId("ocm:12345")).toBe(true);
    expect(isStationId("osm:n99")).toBe(true);
    expect(isStationId("osm:w99")).toBe(true);
    for (const bad of [
      "",
      "ocm:",
      "ocm:abc",
      "osm:x1",
      "ocm:1;drop",
      "ocm:12345678901",
      5,
      null,
      "a".repeat(500),
    ]) {
      expect(isStationId(bad)).toBe(false);
    }
  });

  it("accepts only exact report bodies", () => {
    expect(parseReportBody({ stationId: "ocm:1", status: "working" }).ok).toBe(true);
    for (const bad of [
      null,
      [],
      "x",
      {},
      { stationId: "ocm:1" },
      { stationId: "ocm:1", status: "great" },
      { stationId: "nope", status: "busy" },
      { stationId: "ocm:1", status: "busy", extra: 1 },
    ]) {
      expect(parseReportBody(bad).ok).toBe(false);
    }
  });

  it("validates and clamps the station query", () => {
    const ok = parseStationQuery(new URLSearchParams("lat=52.52049&lng=13.40551&radiusKm=25"));
    expect(ok).toEqual({ ok: true, value: { lat: 52.52, lng: 13.406, radiusKm: 25 } });
    expect(parseStationQuery(new URLSearchParams("lat=1&lng=2"))).toMatchObject({
      ok: true,
      value: { radiusKm: 10 },
    });
    for (const q of [
      "lng=2",
      "lat=91&lng=0",
      "lat=0&lng=181",
      "lat=abc&lng=0",
      "lat=0&lng=0&radiusKm=0",
      "lat=0&lng=0&radiusKm=51",
      "lat=0&lng=0&radiusKm=",
    ]) {
      expect(parseStationQuery(new URLSearchParams(q)).ok).toBe(false);
    }
  });
});

describe("rate limit and client hash", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit per window then blocks with a retry hint", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 10_000, 1000 + i).allowed).toBe(true);
    const blocked = rateLimit("k", 3, 10_000, 1500);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(10);
    expect(rateLimit("other", 3, 10_000, 1500).allowed).toBe(true);
    expect(rateLimit("k", 3, 10_000, 12_000).allowed).toBe(true);
  });

  it("hashes clients deterministically without leaking the ip", () => {
    const a = hashClient("203.0.113.5", "UA/1");
    expect(a).toBe(hashClient("203.0.113.5", "UA/1"));
    expect(a).not.toBe(hashClient("203.0.113.6", "UA/1"));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain("203");
  });
});
