# Architecture

What exists today is described as built. Anything under **Planned** does not exist yet.

## Overview (built)

```
Browser (/map)                       Next.js server (Vercel)                 Upstream
--------------                       -----------------------                 --------
MapLibre + React  --GET /api/stations-->  lib/providers.ts  ------------->  Open Charge Map (key set)
list, detail,                              |  fallback ----------------->   OpenStreetMap Overpass
filters, units                             v
                                      lib/reportStore.ts  ------------->  Supabase PostgREST (or memory)
                                           |
                                           v
                                      lib/reliability.ts  (status per station)
        --POST /api/reports------>  validation, rate limit, hash, cooldown -> reportStore
        --GET /api/geocode------->  Nominatim (cached, rate limited)
```

Each request is stateless. There is no queue, cache server or background worker.

## Request flow

**`GET /api/stations?lat&lng&radiusKm`**

1. Per-address rate limit (60 per minute, in memory per instance).
2. `lib/validation.ts` checks `lat` in [-90, 90], `lng` in [-180, 180], `radiusKm` in [1, 50] (default 10)
   and rounds coordinates to about 100 m so upstream responses cache well.
3. `fetchStations`: with `OCM_API_KEY`, call Open Charge Map (key in the `X-API-Key` header); on failure or
   without a key, call Overpass. Upstream URLs are built with `URLSearchParams`; results capped at 200
   nearest; upstream responses cached by Next for 5 minutes.
4. Normalise to the `Station` shape (`types/station.ts`). Missing values stay `null`: price, power, points
   are never invented.
5. Read reports from the last 72 hours for those station ids (at most 20 per station).
6. `computeReliability` produces the label and the verified time. Response includes `source`, `storage`
   (`supabase` or `memory`), `reportsAvailable`, and a `fallbackReason` if OCM failed.

If reports cannot be read the stations still return, with `reportsAvailable: false`, and the UI says
statuses show operator data only. If no provider answers, the API returns 502.

**`POST /api/reports` `{ stationId, status }`**

1. Same-origin check (Origin must match Host), JSON content type, body under 1 KB, per-address rate limit
   (20 per 10 minutes).
2. Strict validation: station id must match `ocm:<digits>` or `osm:<n|w|r><digits>`, status must be
   `working`, `broken` or `busy`, no extra fields.
3. Client id = HMAC-SHA256(`REPORT_HASH_SALT`, address and user agent). Raw values are not stored.
4. Store checks the 10-minute cooldown for (station, client hash) and inserts. Supabase: a lookup then an
   insert through PostgREST using the service-role key. Cooldown hit returns 429 with `Retry-After`.

Known limit: the cooldown check and insert are two calls, so two simultaneous requests from one client can
both pass. This only allows a duplicate report in a rare race and is not worth a transaction yet.

**`GET /api/geocode?q`**: Nominatim search, called by the UI on submit only (never per keystroke), 1.1 s
client-side spacing, 20 per minute per address server-side, cached 24 h, identified user agent.

## Status rules

Single source of truth: `lib/reliability.ts`. The newest report within its window decides; otherwise
operator `offline` gives "Operator says offline"; otherwise "Unverified". Windows: 24 h verified, 48 h
broken, 72 h retention. The landing page, UI help text and tests all import these constants.

## Data model

Table `public.reports` (`supabase/schema.sql`): `id uuid`, `station_id text` (format-checked),
`status text` (check working/broken/busy), `client_hash text` (64 hex chars), `created_at timestamptz`.
Indexes on `(station_id, created_at desc)` and `(station_id, client_hash, created_at desc)`. Row level
security is on with no policies, and `anon`/`authenticated` privileges are revoked. Only the server, using
the service-role key, reads and writes.

## Frontend

- `/map` is a client component (`components/map/MapApp.tsx`) that owns state. `MapView` wraps MapLibre
  (loaded client-side only) with a clustered GeoJSON source, a data-driven colour per status, and a
  selection ring. If the hosted basemap or WebGL is unavailable it degrades to a plain background or to
  the list alone.
- The list and detail panel are the keyboard- and screen-reader-accessible interface to the same data;
  map markers are a visual aid.
- Layout is mobile first: bottom sheet on small screens, side panel from the `md` breakpoint.
- Optimistic report updates recompute the status locally with the same function the server uses, and roll
  back on error.

## Security and privacy

No accounts, no cookies, no analytics. Secrets are server-only (`env/README.md`). Inputs are validated
strictly; upstream URLs are encoded with `URLSearchParams`. Security headers are set in `vercel.json`.
Rate limiting is in process memory, so it is a per-instance brake, not a global guarantee.

## Planned (not built)

- Canonical station identity across Open Charge Map and OpenStreetMap, to merge sources.
- Per-station report history and a reliability trend; reporter weighting and anomaly detection.
- Keyed read API with usage metering, bulk exports, and terms of service.
- Distributed rate limiting; a Content-Security-Policy for the map's worker and tile origins.
- Station deep links (`/map?station=<id>`) for QR stickers.
- Verification signals from charging sessions or vehicle data, where partners allow.
- Scheduled deletion of old reports.

Earlier versions of this repository described Kafka, TimescaleDB, forecasting models, vehicle telemetry
ingestion and an OCPP integration. None of that exists, and it is out of scope for the current plan.
