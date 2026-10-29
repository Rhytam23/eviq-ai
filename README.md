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

| Capability                                                                                          | Status                                |
| --------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Landing page, privacy page, OG image, sitemap, robots, 404                                          | Built                                 |
| Live map `/map`: auto-locate, city search, "search this area", clustering, status-coloured markers  | Built                                 |
| Charger list and detail panel, connector and min-kW filters, km/mi toggle, source shown per station | Built                                 |
| Charger data from Open Charge Map (with `OCM_API_KEY`) or OpenStreetMap Overpass (no key)           | Built; OSM fallback also if OCM fails |
| One-tap reports with optimistic update, 10-minute cooldown, IP rate limit, strict validation        | Built                                 |
| Report storage in Supabase (needs env vars and `supabase/schema.sql`), in-memory fallback for dev   | Built; UI warns when not persisted    |
| Status rules in `lib/reliability.ts` with unit tests                                                | Built                                 |
| Price, live availability and queue times                                                            | **Not available.** Shown as "unknown" |
| Keyed reliability API, per-station history, reporter weighting, station deep links, merged sources  | **Planned**                           |
| Accounts, reservations, vehicle telemetry, ML forecasting                                           | **Not planned for now**               |

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

Requires Node.js 20 (18.17+ works). `next build` downloads Google Fonts, so the build needs network access.

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
npm test
npm run build
npx prettier --check .
```

CI runs the same checks on every push and pull request.

## Project structure

```
app/            routes: /, /map, /privacy, api/stations, api/reports, api/geocode
components/     landing/ and map/ UI, StatusBadge, Logo
lib/            providers, reliability rules, report store, validation, rate limit, formatting
supabase/       schema.sql for the reports table
env/            environment variable docs and template
docs/YC.md      Y Combinator application pack
tests/          Vitest tests and fixtures
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
