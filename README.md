# EVIQ AI — AI Decision Layer for EV Charging

[![Verify Build & Code Quality](https://github.com/Rhytam23/eviq-ai/actions/workflows/verify.yml/badge.svg)](https://github.com/Rhytam23/eviq-ai/actions/workflows/verify.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

EVIQ AI answers one question for EV drivers and fleets: **where should I charge, when, and why?**
We do not build a charging map or a charging network. EVIQ is the decision layer on top of
existing charging data: it ranks chargers along a route using battery state, charger power,
connector fit, price, availability and expected wait, and explains the pick.

---

## Status: what is real today

This is an early prototype. Being precise about it:

| Capability                                                            | Status                                                   |
| --------------------------------------------------------------------- | -------------------------------------------------------- |
| Route planning for any origin/destination (OSRM + Nominatim)          | Live                                                     |
| Charger discovery along the route corridor (Open Charge Map)          | Live                                                     |
| Destination weather (Open-Meteo)                                      | Live                                                     |
| 7-signal charger ranking and arrival-SoC / charge-time model          | Working (heuristic, in `lib/ranking.ts`)                 |
| Charger price, port availability, reliability, queue times            | **Modeled estimates**, not live operator data            |
| Reservations                                                          | **Simulated** flow, no operator booking API              |
| Vehicle telemetry (CAN-bus / OEM APIs), Kafka, TimescaleDB, ML models | Planned, described in [ARCHITECTURE.md](ARCHITECTURE.md) |

The landing page "Product Preview", cockpit HUD and decision-engine sections are illustrative
mockups with sample data. The `/demo` page shows an on-screen notice about which values are modeled.

---

## The problem

- Public chargers are often offline or derated, and drivers only find out on arrival.
- Hub queues are not forecast, so drivers arrive blind.
- Range depends on weather, elevation and temperature, which static apps ignore.
- Charging networks are fragmented, with no unified decision or booking layer.

---

## Tech stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS, Framer Motion
- MapLibre GL for the map
- Data: Open Charge Map, OSRM, Nominatim (OpenStreetMap), Open-Meteo

## Project structure

```
app/
  api/chargers/     Server-side proxy for Open Charge Map (keeps the API key off the client)
  demo/             Interactive trip-planning demo
  page.tsx          Landing page
components/         Landing, demo, layout and architecture components
lib/
  api.ts            Geocoding, routing, weather and charger clients
  ranking.ts        Charger ranking engine
types/              Shared TypeScript types
```

## Getting started

Requires Node.js 18.17 or later (Node 20 recommended).

```bash
git clone https://github.com/Rhytam23/eviq-ai.git
cd eviq-ai
npm install
cp .env.example .env.local   # then add your Open Charge Map key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable      | Required | Description                                                                               |
| ------------- | -------- | ----------------------------------------------------------------------------------------- |
| `OCM_API_KEY` | Yes      | Free key from [Open Charge Map](https://openchargemap.org/site/develop/api). Server-only. |

Without the key, the demo loads but shows no chargers. In Vercel, set `OCM_API_KEY` under
Project Settings, Environment Variables. Do not use a `NEXT_PUBLIC_` prefix.

## Development

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run build       # Production build
npx prettier --check .
```

CI runs the same checks on every push and pull request.

## Roadmap

1. **Now:** consumer charging assistant and trip-planner prototype.
2. **Next:** fleet charging scheduler, first real operator and telemetry integrations.
3. **Later:** operator demand forecasting, OCPP smart-charge control, grid-aware load balancing.

## Contact

Pilots, partnerships or investment: [founders@eviq.ai](mailto:founders@eviq.ai).

## License

MIT, see [LICENSE](LICENSE). Contributions: see [CONTRIBUTING.md](CONTRIBUTING.md).
