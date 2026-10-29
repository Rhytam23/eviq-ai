# AGENTS.md

Guidance for AI coding agents and human contributors. `CLAUDE.md` points here.

## What this is

EVIQ is the **driver-verified reliability layer for EV charging**. Open registries (Open Charge Map,
OpenStreetMap) say a charger exists, not whether it works. EVIQ combines registry/operator status with
one-tap driver reports (working / broken / busy) that age out, and computes a transparent status per
charger. The long-term business is selling that reliability data as an API.

Stack: Next.js 14 (App Router), React 18, TypeScript, Tailwind, MapLibre GL, Vitest. Storage: Supabase
(PostgREST) with an in-memory dev fallback.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint         # next lint
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run build        # production build (needs network for next/font)
npx prettier --check .   # npm run format to fix
```

CI (`.github/workflows/verify.yml`) runs prettier, lint, typecheck, tests and build.

## Layout

```
app/                 routes: / (landing), /map (product), /privacy, api/stations, api/reports, api/geocode
components/          Logo, StatusBadge, landing/*, map/*
lib/providers.ts     OCM + Overpass fetch and normalisation (pure normalisers are unit tested)
lib/reliability.ts   the status rules and their time windows (single source of truth)
lib/reportStore.ts   Supabase and in-memory report storage, cooldown
lib/validation.ts    strict input parsing; lib/rateLimit.ts; lib/clientId.ts (hashing)
lib/statusMeta.ts    labels, colours, rule text shared by the map and the landing page
supabase/schema.sql  reports table (RLS on, no public policies)
env/                 env var docs and template
docs/YC.md           Y Combinator application pack
tests/               Vitest tests and fixtures
```

## Conventions

- TypeScript strict, no `any`. Server-only secrets are read only in `app/api` and `lib` server code.
- Never prefix a secret with `NEXT_PUBLIC_`. Build upstream URLs with `URLSearchParams`.
- The status rules live in `lib/reliability.ts`. The landing page, tooltips and docs read the constants
  from there; change rules there and in the tests, never by editing copy.
- Match the surrounding code's style. Prettier decides formatting (`.prettierrc`).
- Commit in small steps with descriptive messages. Never push to `main`; open a PR.

## Data honesty (non-negotiable)

- **Never fabricate data or metrics.** No invented prices, availability, reliability, user counts,
  customers, logos, testimonials, traction or company claims, in code, UI, docs or the YC pack. If a value
  is unknown, show "unknown". Placeholders for facts only the founder has must be clearly marked
  `FOUNDER TO FILL`.
- Illustrations that use example data must say so on the page.
- Test fixtures are fixtures, not product data; label them as such.
- Keep `README.md` and `ARCHITECTURE.md` honest about **built versus planned**. Label anything unbuilt
  as future or planned.

## Mandatory: dead-code sweep after every piece of work

After every piece of work (feature, fix, refactor, docs), **scan the entire repository, all folders and
files,** for and **delete**:

- dead code and unused exports, functions, types and constants
- unused dependencies in `package.json` (check each against actual imports)
- unused components, hooks and utilities
- empty or dead folders
- stale docs, outdated comments, README/ARCHITECTURE statements that no longer match the code
- orphaned assets in `public/` or elsewhere that nothing references
- leftover scaffolding, debug output, commented-out code, TODOs that are done

Then **re-run lint, typecheck, tests and build** and fix anything the deletions broke. Do not skip this
because the change was small, and do not leave deletions for a later cleanup PR.

Useful checks: `npx tsc --noEmit --noUnusedLocals`, `grep -rn "from \"@/" . | ...` per export,
`git ls-files` against references, `npx depcheck` if available.

## Testing notes

- Unit tests cover `lib/reliability.ts`, the provider normalisers, the report store (cooldown) and
  validation. The sandbox used for development had no access to Open Charge Map or Overpass, so provider
  fixtures in `tests/fixtures/` are small hand-written samples that follow the documented response
  schemas, not recordings of live responses. Replace them with real recordings when you can.
- UI verification is manual in a browser at desktop and mobile widths, with no console errors.

## Security

Report vulnerabilities per `SECURITY.md`. Do not log secrets, raw IPs or user locations.
