# EVIQ

[![Verify](https://github.com/Rhytam23/eviq-ai/actions/workflows/verify.yml/badge.svg)](https://github.com/Rhytam23/eviq-ai/actions/workflows/verify.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Know the charger works before you drive there.**

EVIQ is a driver-verified reliability layer for EV charging. Open registries (Open Charge Map,
OpenStreetMap) say a charger exists, not whether it works. EVIQ combines operator/registry status with
one-tap driver reports (working, broken, busy) that age out, and computes a transparent status for each
charger, in any city, with no per-city setup.

The long-term business is selling that reliability data as an API to routing apps, carmakers and fleets.
The API is **planned, not built**.

## What is built today

| Capability                                                                                                                                                                                                         | Status                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Landing, `/how-it-works` (rules rendered from the code's constants), `/developers`, `/privacy`, 404, OG image, sitemap, robots                                                                                     | Built                                                                            |
| India-first launch: visitors outside `LAUNCH_COUNTRIES` (default `IN`) see a coming-soon page; `/india` opens the India map from anywhere; city shortcuts; interactive example charger on the landing page         | Built, country gate covered by unit tests only (needs the host's country header) |
| Hindi: landing page `/hi`, plus the map's report buttons, status labels, search and station panel (`?lang=hi`). The technical landing sections and filters stay English; translations need a native-speaker review | Built, **unreviewed by a native speaker**                                        |
| "Share on WhatsApp" for a charger (map panel and share page) and for the site; Bharat DC / Bharat AC connector types                                                                                               | Built                                                                            |
| Live map `/map`: auto-locate, city search, "search this area", clustering, status-coloured markers, list and detail panel, connector and min-kW filters, km/mi, source shown per station                           | Built                                                                            |
| Empty-area, location-denied, API-failure and slow-registry states                                                                                                                                                  | Built, covered by browser tests with stubbed data                                |
| Charger data from Open Charge Map (with `OCM_API_KEY`) or OpenStreetMap Overpass (no key); automatic OSM fallback; timeouts and one retry                                                                          | Built, **not yet run against live upstreams** (blocked in the build sandbox)     |
| One-tap reports, optimistic UI, 10-minute cooldown, IP rate limits, strict validation, hashed client ids                                                                                                           | Built                                                                            |
| Report storage in Supabase (needs env vars and `supabase/schema.sql`) with in-memory dev fallback, and a visible "not persisted" notice                                                                            | Built, **Supabase path covered by mocked tests only**                            |
| Public read API `/api/v1/stations`, `/api/v1/stations/{id}`, `/api/v1/stations/{id}/reports`, `docs/openapi.yaml`, CORS, 30 s caching                                                                              | Built (alpha, no keys)                                                           |
| Share pages `/s/<id>` with link previews, printable QR stickers `/qr/<id>`, deep links `/map?lat&lng&station`                                                                                                      | Built                                                                            |
| Installable PWA (manifest, icons, offline fallback page; no charger data is cached)                                                                                                                                | Built; install prompt itself not verified                                        |
| Privacy-friendly metrics (daily counters, no identifiers) and token-protected `/admin/metrics`                                                                                                                     | Built                                                                            |
| `/api/health`, error boundaries, CSP and security headers                                                                                                                                                          | Built                                                                            |
| Unit tests (Vitest) and browser tests (Playwright, incl. axe accessibility checks) in CI                                                                                                                           | Built                                                                            |
| Price, live availability, queue times                                                                                                                                                                              | **Not available** from the registries; shown as "unknown"                        |
| API keys and plans, per-station history, reporter weighting, canonical station ids across sources, terms of service                                                                                                | **Planned, not built**                                                           |
| Accounts, reservations, vehicle telemetry, ML forecasting                                                                                                                                                          | **Not planned for now**                                                          |

Nothing in the app is fabricated: where a value is not published by the source, the UI says unknown.

## How a status is computed

The newest report decides while it is fresh, otherwise operator data speaks, otherwise we say unverified.
Windows live in [`lib/reliability.ts`](lib/reliability.ts).

| Label                 | Rule                                                                |
| --------------------- | ------------------------------------------------------------------- |
| Reported broken       | Newest driver report is "broken" and under 48 hours old             |
| Verified working      | Newest driver report is "working" or "busy" and under 24 hours old  |
| Operator says offline | No fresh report, and the operator or registry data marks it offline |
| Unverified            | Anything else                                                       |

Reports older than 72 hours are ignored.

## Quick start

Requires Node.js 20.9 or newer (22 recommended). `next build` downloads Google Fonts, so the build needs network access.

```bash
git clone https://github.com/Rhytam23/eviq-ai.git
cd eviq-ai
npm install
npm run dev     # http://localhost:3000, no configuration needed
```

With no environment variables the app uses OpenStreetMap data and keeps reports in memory (the UI says so).
To use Open Charge Map and persistent reports, see [`env/README.md`](env/README.md).

## Commands

```bash
npm run lint
npm run typecheck
npm test                 # unit tests
npm run build
npm run test:e2e         # Playwright against the production build (npx playwright install chromium first)
npx prettier --check .
```

CI runs the same checks on every push and pull request.

## Project structure

```
app/            routes: /, /map, /how-it-works, /developers, /privacy, /s/[id], /qr/[id], /admin/metrics,
                api/v1/*, api/reports, api/geocode, api/health, api/admin/login
components/     landing/ and map/ UI, StatusBadge, ReportPanel, Logo, PWA registration
lib/            providers, reliability rules, report store, metrics, validation, rate limit, formatting
supabase/       schema.sql (reports and metrics tables)
env/            environment variable docs and template
docs/           YC.md, PITCH-DECK.md, FAQ-INTERVIEW.md, GO-TO-MARKET.md, SCORECARD.md, openapi.yaml
tests/          Vitest unit tests and fixtures
e2e/            Playwright browser tests
```

More detail in [ARCHITECTURE.md](ARCHITECTURE.md). Contributor and agent rules in [AGENTS.md](AGENTS.md).

## Data sources and licences

- [Open Charge Map](https://openchargemap.org) (CC BY 4.0), used when `OCM_API_KEY` is set.
- [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL), via Overpass; city search via Nominatim.
- Map tiles: CARTO Positron, © CARTO, © OpenStreetMap contributors.
- Driver reports are EVIQ's own data.

Read the terms of each source before building a commercial product on derived data.

## Contact

Pilots, partnerships, API design partners: [founders@eviq.ai](mailto:founders@eviq.ai).

## License

MIT, see [LICENSE](LICENSE). Contributions: see [CONTRIBUTING.md](CONTRIBUTING.md).
