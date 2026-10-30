"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { haversineKm } from "@/lib/format";
import { computeReliability } from "@/lib/reliability";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/statusMeta";
import type { Reliability, ReportStatus, Station } from "@/types/station";
import Filters, { type FilterState } from "./Filters";
import type { FlyTarget, ViewState } from "./MapView";
import SearchBox, { type Place } from "./SearchBox";
import type { ReportUi } from "@/components/ReportPanel";
import { submitReport } from "@/lib/reportClient";
import StationDetail from "./StationDetail";
import StationList from "./StationList";
import { useMiles } from "./useMiles";

// MapLibre touches `window`, so it is loaded in the browser only.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#EEF0EA]" />,
});

type GeoState = "locating" | "granted" | "denied" | "unavailable";
type Sheet = "peek" | "half" | "full";

interface StationsResponse {
  stations: Station[];
  source: "ocm" | "osm";
  fallbackReason: string | null;
  storage: "supabase" | "memory";
  reportsAvailable: boolean;
}

interface SearchOrigin {
  lat: number;
  lng: number;
  radiusKm: number;
  label: string;
}

const SOURCE_NAMES = { ocm: "Open Charge Map", osm: "OpenStreetMap" } as const;
const SHEET_HEIGHT: Record<Sheet, string> = {
  peek: "h-[132px]",
  half: "h-[46dvh]",
  full: "h-[86dvh]",
};
const LEGEND: Reliability[] = ["verified", "reported-broken", "operator-offline", "unverified"];

interface SearchRequest extends SearchOrigin {
  /** Increments with every search so stale responses can be told apart. */
  n: number;
}

/** `/map?lat=..&lng=..&station=..` opens a shared charger directly. */
function readDeepLink(
  params: URLSearchParams
): { lat: number; lng: number; station: string | null } | null {
  if (!params.has("lat") || !params.has("lng")) return null;
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return null;
  return { lat, lng, station: params.get("station") };
}

export default function MapApp() {
  const searchParams = useSearchParams();
  // Read once: the deep link only decides the starting state.
  const [deepLink] = useState(() => readDeepLink(searchParams));
  const counter = useRef(deepLink ? 1 : 0);
  const pendingSelect = useRef<string | null>(deepLink?.station ?? null);
  const nonce = useRef(deepLink ? 1 : 0);

  const [geo, setGeo] = useState<GeoState>(deepLink ? "granted" : "locating");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [target, setTarget] = useState<FlyTarget | null>(
    deepLink ? { lat: deepLink.lat, lng: deepLink.lng, zoom: 15, nonce: 1 } : null
  );
  const [view, setView] = useState<ViewState | null>(null);

  const [request, setRequest] = useState<SearchRequest | null>(
    deepLink
      ? { lat: deepLink.lat, lng: deepLink.lng, radiusKm: 3, label: "the shared charger", n: 1 }
      : null
  );
  const [doneN, setDoneN] = useState(0);
  const [slowN, setSlowN] = useState(0);
  const [failure, setFailure] = useState<{ n: number; message: string } | null>(null);
  const [data, setData] = useState<StationsResponse | null>(null);
  const [origin, setOrigin] = useState<SearchOrigin | null>(null);
  const [mapNotice, setMapNotice] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({ connectors: [], minKw: 0 });
  const [miles, changeMiles] = useMiles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportUi, setReportUi] = useState<Record<string, ReportUi>>({});
  const [sheet, setSheet] = useState<Sheet>("half");
  const [announce, setAnnounce] = useState("");

  const loading = request !== null && doneN !== request.n;
  const slow = loading && slowN === request?.n;
  const error = failure && failure.n === request?.n ? failure.message : null;

  /* ------------------------------- data loading ------------------------------- */

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    const slowTimer = setTimeout(() => setSlowN(request.n), 6000);
    const params = new URLSearchParams({
      lat: request.lat.toFixed(5),
      lng: request.lng.toFixed(5),
      radiusKm: String(request.radiusKm),
    });
    (async () => {
      try {
        const res = await fetch(`/api/v1/stations?${params.toString()}`, {
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Could not load chargers.");
        const result = json as StationsResponse;
        setData(result);
        setOrigin({
          lat: request.lat,
          lng: request.lng,
          radiusKm: request.radiusKm,
          label: request.label,
        });
        const wanted = pendingSelect.current;
        pendingSelect.current = null;
        setSelectedId(wanted && result.stations.some((s) => s.id === wanted) ? wanted : null);
        setReportUi({});
        setAnnounce(`${result.stations.length} chargers found near ${request.label}`);
      } catch (err) {
        if (controller.signal.aborted) return;
        setFailure({
          n: request.n,
          message: err instanceof Error ? err.message : "Could not load chargers.",
        });
      } finally {
        if (!controller.signal.aborted) setDoneN(request.n);
      }
    })();
    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [request]);

  const search = useCallback((next: SearchOrigin) => {
    counter.current += 1;
    setRequest({ ...next, n: counter.current });
  }, []);

  const flyTo = useCallback((lat: number, lng: number, zoom: number) => {
    nonce.current += 1;
    setTarget({ lat, lng, zoom, nonce: nonce.current });
  }, []);

  /** Asks the browser for a position. State is only set from callbacks, so it is safe to call from an effect. */
  const requestPosition = useCallback(() => {
    if (!("geolocation" in navigator)) {
      void Promise.resolve().then(() => setGeo("unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(here);
        setGeo("granted");
        flyTo(here.lat, here.lng, 12);
        search({ ...here, radiusKm: 5, label: "your location" });
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { timeout: 10_000, maximumAge: 300_000 }
    );
  }, [flyTo, search]);

  const locate = useCallback(() => {
    setGeo("locating");
    requestPosition();
  }, [requestPosition]);

  useEffect(() => {
    if (!deepLink) requestPosition();
  }, [deepLink, requestPosition]);

  const pickPlace = (place: Place) => {
    const label = place.name.split(",")[0].trim();
    flyTo(place.lat, place.lng, 12);
    search({ lat: place.lat, lng: place.lng, radiusKm: 10, label });
  };

  const searchThisArea = () => {
    if (!view) return;
    search({ lat: view.lat, lng: view.lng, radiusKm: view.radiusKm, label: "this area" });
  };

  /* -------------------------------- derived data ------------------------------ */

  const visible = useMemo(() => {
    if (!data) return [];
    return data.stations.filter((s) => {
      if (
        filters.connectors.length &&
        !s.connectors.some((c) => filters.connectors.includes(c.type))
      ) {
        return false;
      }
      if (filters.minKw > 0 && (s.maxKw ?? 0) < filters.minKw) return false;
      return true;
    });
  }, [data, filters]);

  const selected = visible.find((s) => s.id === selectedId) ?? null;
  const hiddenByFilters = data ? data.stations.length - visible.length : 0;

  const moved = Boolean(
    view &&
    origin &&
    view.userInitiated &&
    haversineKm(view.lat, view.lng, origin.lat, origin.lng) > Math.max(0.5, origin.radiusKm * 0.3)
  );
  const showSearchArea = moved && !loading;
  const tooWide = Boolean(view && view.zoom < 9);

  const select = (id: string | null) => {
    setSelectedId(id);
    if (id) setSheet((s) => (s === "peek" ? "half" : s));
  };

  /* --------------------------------- reporting -------------------------------- */

  const report = async (station: Station, status: ReportStatus) => {
    const snapshot = station;
    const at = new Date().toISOString();
    const recent = [{ status, at }, ...station.reports.recent];
    const { reliability, verifiedAt } = computeReliability(station.operatorStatus, recent);
    const apply = (s: Station) =>
      setData((d) => d && { ...d, stations: d.stations.map((x) => (x.id === s.id ? s : x)) });

    apply({ ...station, reports: { recent }, reliability, verifiedAt });
    setReportUi((m) => ({ ...m, [station.id]: { pending: status } }));
    const result = await submitReport(station.id, status);
    if (!result.ok) {
      apply(snapshot);
      setReportUi((m) => ({ ...m, [station.id]: { error: result.message } }));
      setAnnounce(result.message);
      return;
    }
    setReportUi((m) => ({ ...m, [station.id]: { done: status } }));
    setAnnounce("Report sent. Thank you.");
  };

  /* ----------------------------------- render ---------------------------------- */

  const sourceName = data ? SOURCE_NAMES[data.source] : null;

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <div className="contents md:flex md:w-[420px] md:shrink-0 md:flex-col md:border-r md:border-line md:bg-surface">
        <header className="relative z-10 space-y-2.5 border-b border-line bg-surface px-4 py-3">
          <span aria-hidden className="tricolor absolute inset-x-0 top-0 h-[3px]" />
          <div className="flex items-center justify-between">
            <Logo />
            <p className="hidden text-xs text-muted min-[400px]:block">
              Driver-verified charger status
            </p>
          </div>
          <SearchBox onPick={pickPlace} onLocate={locate} locating={geo === "locating"} />
          <Filters
            filters={filters}
            onChange={setFilters}
            miles={miles}
            onMilesChange={changeMiles}
          />
        </header>

        <section
          aria-label="Chargers"
          className={`fixed inset-x-0 bottom-0 z-20 flex flex-col rounded-t-2xl border-t border-line bg-surface shadow-[0_-8px_24px_rgba(20,24,27,0.12)] transition-[height] md:static md:h-auto md:min-h-0 md:flex-1 md:rounded-none md:border-0 md:shadow-none ${SHEET_HEIGHT[sheet]}`}
        >
          <button
            type="button"
            onClick={() =>
              setSheet((s) => (s === "peek" ? "half" : s === "half" ? "full" : "peek"))
            }
            aria-label={`Resize the charger list (currently ${sheet})`}
            className="grid h-11 shrink-0 place-items-center md:hidden"
          >
            <span className="h-1 w-10 rounded-full bg-line" />
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {selected && data ? (
              <StationDetail
                station={selected}
                miles={miles}
                storage={data.storage}
                reportsAvailable={data.reportsAvailable}
                reportUi={reportUi[selected.id] ?? {}}
                onReport={(status) => report(selected, status)}
                onClose={() => select(null)}
              />
            ) : (
              <ListBody
                geo={geo}
                loading={loading}
                slow={slow}
                error={error}
                data={data}
                origin={origin}
                visible={visible}
                hiddenByFilters={hiddenByFilters}
                selectedId={selectedId}
                miles={miles}
                sourceName={sourceName}
                onSelect={select}
                onRetryLocate={locate}
                canRetrySearch={request !== null}
                onRetrySearch={() => request && search(request)}
                onClearFilters={() => setFilters({ connectors: [], minKw: 0 })}
              />
            )}
          </div>

          <footer className="hidden shrink-0 border-t border-line px-4 py-2 text-xs text-muted md:block">
            Map © CARTO, © OpenStreetMap contributors.{" "}
            {sourceName ? `Charger data: ${sourceName}. ` : ""}Driver reports © EVIQ users.
          </footer>
        </section>
      </div>

      <main className="relative min-h-0 flex-1" aria-label="Map">
        <MapView
          stations={visible}
          selectedId={selectedId}
          userLocation={userLocation}
          target={target}
          onSelect={select}
          onViewChange={setView}
          onUnavailable={setMapNotice}
        />

        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex flex-col items-center gap-2 px-3">
          {showSearchArea && (
            <button
              type="button"
              onClick={searchThisArea}
              disabled={tooWide}
              className="pointer-events-auto rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-lg disabled:bg-muted"
            >
              {tooWide ? "Zoom in to search this area" : "Search this area"}
            </button>
          )}
          {loading && (
            <p
              className="pointer-events-auto rounded-full bg-surface px-3 py-1.5 text-sm shadow"
              role="status"
            >
              {slow ? "Still loading: the registry is slow right now…" : "Loading chargers…"}
            </p>
          )}
          {mapNotice && (
            <p className="pointer-events-auto max-w-md rounded-lg bg-surface px-3 py-2 text-sm text-warn shadow">
              {mapNotice}
            </p>
          )}
        </div>

        <ul
          aria-label="Status colours"
          className="absolute bottom-6 left-3 z-10 hidden max-w-[360px] flex-wrap gap-x-3 rounded-lg bg-surface/95 px-3 py-2 text-xs shadow md:flex"
        >
          {LEGEND.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: STATUS_COLORS[s] }}
              />
              {STATUS_LABELS[s]}
            </li>
          ))}
        </ul>
      </main>

      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  );
}

/* ------------------------------ list / states ------------------------------ */

interface ListBodyProps {
  geo: GeoState;
  loading: boolean;
  slow: boolean;
  error: string | null;
  data: StationsResponse | null;
  origin: SearchOrigin | null;
  visible: Station[];
  hiddenByFilters: number;
  selectedId: string | null;
  miles: boolean;
  sourceName: string | null;
  onSelect: (id: string) => void;
  onRetryLocate: () => void;
  canRetrySearch: boolean;
  onRetrySearch: () => void;
  onClearFilters: () => void;
}

function Message({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="px-5 py-8 text-center">
      <p className="font-serif text-xl">{title}</p>
      <div className="mt-2 space-y-3 text-sm text-muted">{children}</div>
    </div>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-brand px-4 py-2 font-medium text-white"
    >
      {children}
    </button>
  );
}

function ListBody(p: ListBodyProps) {
  if (p.error && !p.data) {
    return (
      <Message title="We could not load chargers">
        <p>{p.error}</p>
        <ActionButton onClick={p.origin ? p.onRetrySearch : p.onRetryLocate}>
          Try again
        </ActionButton>
      </Message>
    );
  }

  if (!p.data) {
    if (p.loading || p.geo === "locating") {
      return (
        <Message title="Finding chargers near you">
          <p>
            {p.slow
              ? "This is taking longer than usual: the charger registry is slow right now. You can keep waiting or search somewhere else."
              : "Waiting for your location. You can also search for a city above."}
          </p>
        </Message>
      );
    }
    if (p.geo === "denied") {
      return (
        <Message title="Location is off">
          <p>
            Search for a city or address above to see chargers there, or allow location access in
            your browser.
          </p>
          <ActionButton onClick={p.onRetryLocate}>Use my location</ActionButton>
        </Message>
      );
    }
    return (
      <Message title="Where do you want to charge?">
        <p>We could not get your location. Search for a city or address above.</p>
        <ActionButton onClick={p.onRetryLocate}>Try my location again</ActionButton>
      </Message>
    );
  }

  const { data } = p;
  return (
    <>
      <div className="space-y-1 border-b border-line px-4 py-3 text-sm">
        <p className="font-medium" aria-live="polite">
          {p.visible.length} {p.visible.length === 1 ? "charger" : "chargers"} near{" "}
          {p.origin?.label}
          {p.hiddenByFilters > 0 && (
            <span className="font-normal text-muted"> ({p.hiddenByFilters} hidden by filters)</span>
          )}
        </p>
        <p className="text-xs text-muted">
          Sorted by distance from {p.origin?.label}. Data: {p.sourceName}
          {data.fallbackReason &&
            " (Open Charge Map was unavailable, so this is OpenStreetMap data)"}
          .
        </p>
        {data.storage === "memory" && (
          <p className="rounded-md bg-warn/10 px-2 py-1.5 text-xs text-warn">
            Reports are not persisted: this server keeps them in memory only.
          </p>
        )}
        {p.error && <p className="text-xs text-bad">{p.error}</p>}
      </div>

      {p.visible.length === 0 ? (
        <Message
          title={
            data.stations.length === 0 ? "No chargers found here" : "No chargers match your filters"
          }
        >
          {data.stations.length === 0 ? (
            <p>
              {p.sourceName} lists none in this area. Coverage differs by region, so this may mean
              the data is missing, not that there are no chargers. Try zooming out or searching
              somewhere else.
            </p>
          ) : (
            <>
              <p>{data.stations.length} chargers are hidden by your connector or power filters.</p>
              <ActionButton onClick={p.onClearFilters}>Clear filters</ActionButton>
            </>
          )}
        </Message>
      ) : (
        <StationList
          stations={p.visible}
          selectedId={p.selectedId}
          miles={p.miles}
          onSelect={p.onSelect}
        />
      )}
    </>
  );
}
