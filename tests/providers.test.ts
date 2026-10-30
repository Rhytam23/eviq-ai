import { describe, expect, it } from "vitest";
import ocm from "./fixtures/ocm.json";
import overpass from "./fixtures/overpass.json";
import {
  buildOcmUrl,
  buildOverpassQuery,
  buildOverpassUrl,
  normalizeConnectorType,
  normalizeOcm,
  normalizeOsm,
  parseOsmKw,
  type OcmPoi,
  type OsmElement,
} from "@/lib/providers";

const origin = { lat: 52.52, lng: 13.405 };

describe("normalizeConnectorType", () => {
  it.each([
    ["CCS (Type 2)", "CCS"],
    ["CCS (Type 1)", "CCS"],
    ["CHAdeMO", "CHAdeMO"],
    ["NACS / Tesla Supercharger", "NACS"],
    ["Tesla (Model S/X)", "NACS"],
    ["Type 2 (Socket Only)", "Type 2"],
    ["Type 2 (Tethered Connector)", "Type 2"],
    ["Type 1 (J1772)", "Type 1"],
    ["Bharat DC-001 (3.3kW)", "Bharat DC"],
    ["Bharat AC-001", "Bharat AC"],
    ["Schuko", "Other"],
    [undefined, "Other"],
  ])("%s -> %s", (title, expected) => {
    expect(normalizeConnectorType(title)).toBe(expected);
  });
});

describe("normalizeOcm", () => {
  const pois = ocm as unknown as OcmPoi[];

  it("maps real OCM fields and merges identical connectors", () => {
    const s = normalizeOcm(pois[0], origin)!;
    expect(s.id).toBe("ocm:101");
    expect(s.source).toBe("ocm");
    expect(s.name).toBe("Town Hall Car Park");
    expect(s.operator).toBe("Example Operator");
    expect(s.address).toBe("1 Market Street, Exampleville");
    expect(s.operatorStatus).toBe("operational");
    expect(s.statusUpdatedAt).toBe("2026-09-30T08:15:00Z");
    expect(s.cost).toBe("0.45 EUR/kWh");
    expect(s.points).toBe(4);
    expect(s.maxKw).toBe(150);
    expect(s.connectors).toEqual([
      { type: "CCS", kw: 150, quantity: 3 },
      { type: "CHAdeMO", kw: 50, quantity: 1 },
      { type: "Type 2", kw: 22, quantity: 1 },
    ]);
    expect(s.distanceKm).toBeGreaterThan(0);
    expect(s.distanceKm).toBeLessThan(1);
  });

  it("reports offline operators and never invents missing fields", () => {
    const s = normalizeOcm(pois[1], origin)!;
    expect(s.operatorStatus).toBe("offline");
    expect(s.name).toBe("Other Operator");
    expect(s.cost).toBeNull();
    expect(s.points).toBeNull();
    expect(s.statusUpdatedAt).toBeNull();
    expect(s.address).toBeNull();
    expect(s.maxKw).toBeNull();
    expect(s.connectors.map((c) => c.type).sort()).toEqual(["NACS", "Other"]);
  });

  it("leaves operator status unknown when OCM has no status", () => {
    const s = normalizeOcm(pois[2], origin)!;
    expect(s.operatorStatus).toBe("unknown");
    expect(s.connectors).toEqual([{ type: "Type 1", kw: 7.4, quantity: 2 }]);
  });

  it("drops entries without coordinates", () => {
    expect(normalizeOcm(pois[3], origin)).toBeNull();
  });
});

describe("normalizeOsm", () => {
  const elements = overpass.elements as unknown as OsmElement[];

  it("maps tags, sockets and power", () => {
    const s = normalizeOsm(elements[0], origin)!;
    expect(s.id).toBe("osm:n5551");
    expect(s.source).toBe("osm");
    expect(s.name).toBe("Place Example");
    expect(s.operator).toBe("Example Network");
    expect(s.address).toBe("Rue Exemple 12, Paris");
    expect(s.points).toBe(6);
    expect(s.cost).toBe("Paid (price not listed)");
    expect(s.operatorStatus).toBe("unknown");
    expect(s.connectors).toEqual([
      { type: "CCS", kw: 150, quantity: 4 },
      { type: "Type 2", kw: 22, quantity: 2 },
    ]);
    expect(s.maxKw).toBe(150);
  });

  it("uses way centers and reads fee=no as free", () => {
    const s = normalizeOsm(elements[1], origin)!;
    expect(s.id).toBe("osm:w7001");
    expect(s.lat).toBe(48.86);
    expect(s.cost).toBe("Free");
    expect(s.connectors).toEqual([{ type: "CHAdeMO", kw: null, quantity: 1 }]);
    expect(s.name).toBe("Charging station");
  });

  it("flags operational_status=broken and ignores socket:*=no", () => {
    const s = normalizeOsm(elements[2], origin)!;
    expect(s.operatorStatus).toBe("offline");
    expect(s.name).toBe("Brand X");
    expect(s.connectors).toEqual([{ type: "NACS", kw: 250, quantity: 8 }]);
  });

  it("drops elements without coordinates", () => {
    expect(normalizeOsm(elements[3], origin)).toBeNull();
  });
});

describe("parseOsmKw", () => {
  it.each([
    ["22 kW", 22],
    ["22kW", 22],
    ["150000", 150],
    ["11.5", 11.5],
    ["7,4 kW", 7.4],
    ["22000 W", 22],
    ["fast", null],
    ["", null],
    [undefined, null],
    ["0", null],
  ])("%s -> %s", (input, expected) => {
    expect(parseOsmKw(input)).toBe(expected);
  });
});

describe("upstream URLs", () => {
  it("builds the OCM URL with encoded params and no key", () => {
    const url = new URL(buildOcmUrl({ lat: 52.52, lng: 13.405, radiusKm: 10 }));
    expect(url.origin + url.pathname).toBe("https://api.openchargemap.io/v3/poi/");
    expect(url.searchParams.get("latitude")).toBe("52.52");
    expect(url.searchParams.get("distance")).toBe("10");
    expect(url.searchParams.get("distanceunit")).toBe("KM");
    expect(url.searchParams.get("maxresults")).toBe("200");
    expect(url.searchParams.has("key")).toBe(false);
  });

  it("builds a bounded Overpass query", () => {
    const query = buildOverpassQuery({ lat: 48.8566, lng: 2.3522, radiusKm: 5 });
    expect(query).toContain("around:5000,48.8566,2.3522");
    expect(query).toContain("out center tags 400;");
    const url = new URL(buildOverpassUrl({ lat: 48.8566, lng: 2.3522, radiusKm: 5 }));
    expect(url.searchParams.get("data")).toBe(query);
  });
});
