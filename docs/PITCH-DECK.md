# Pitch deck (10 slides)

Text for a 10-slide deck. Every claim is either true of the repository today or marked **TODO (founder)**.
Build it in whatever tool you like; keep it plain: one idea per slide, no stock photos, no invented numbers.
Where a slide says "screenshot", use a real capture of the deployed app (the sandbox that built this repo
could not load live map data, so none are included yet).

---

## 1. Title

**EVIQ: know the charger works before you drive there.**
The driver-verified reliability layer for EV charging. Anywhere in the world.

_Footer:_ Rhytam Biswas, founders@eviq.ai, <live URL> (**TODO (founder):** URL once deployed)

_Say:_ "Registries tell you a charger exists. We tell you whether it works."

## 2. The problem

- A charger on a map is a promise. The first person to learn it is broken is whoever drives there.
- Open registries (Open Charge Map, OpenStreetMap) record where chargers are. Status fields exist but depend
  on someone keeping them up to date, so they can be blank or stale.
- That knowledge, "it did not work at 9:41", is never written down for the next driver.

_Say:_ **TODO (founder):** your 15-second personal story here, then the three bullets.

## 3. The insight

Registry data is a commodity. A time-stamped record of what actually worked, charger by charger, is not: it
only exists if someone on site reports it at the moment it happens. Drivers are on site. One tap is cheap.

## 4. The product (built today)

Screenshot of `/map` with a charger open (**TODO (founder):** capture from the deployed app).

- Global map, auto-locates, city search, connector and power filters, km or miles.
- Four labels: **Verified working**, **Reported broken**, **Operator says offline**, **Unverified**.
- One-tap report: working, broken or busy. No account.
- Source shown on every station. Unknown stays unknown: no invented price or availability.

## 5. How a status is decided (trust slide)

Show the rules table from `/how-it-works`.

- Newest fresh report wins. Working or busy counts 24 h, broken 48 h, anything older than 72 h is ignored.
- Otherwise operator data. Otherwise "Unverified".
- Abuse controls: one report per charger per client per 10 minutes, rate limits, hashed client ids, reports expire.
- Rules are in the open and unit tested. Honest limit: a determined attacker rotating networks could skew a
  single charger.

## 6. Why now

- EV charging networks are expanding in many countries, and more drivers depend on chargers they have never used.
  **TODO (founder):** add two sourced facts with links (for example IEA or a national regulator). Do not paste numbers from memory.
- The open registries are good enough to start from, so we spend effort on the missing "does it work".
- Routing apps and in-car navigation choose chargers automatically, so a wrong "available" costs them directly (hypothesis to confirm with partners).

## 7. The data moat and the API

- What data: per-charger history of working, broken and busy reports with timestamps and a computed status.
- Why hard to copy: registries can be copied in an afternoon; verified outcomes cannot be scraped, they have to be collected on site, charger by charger, and they compound over time.
- Who pays: routing and navigation apps, vehicle makers, fleets and rental operators, charge point operators.
- Built today: a free read API (`/api/v1`, alpha, documented in `docs/openapi.yaml`, shown at `/developers`). Not built: keys, plans, SLAs.

## 8. Business model and go-to-market

- Model: sell the reliability data as an API; free for drivers. Pricing is a hypothesis to test with design partners (see `docs/YC.md`).
- Reports: 1,000 in one pilot city first. Channels: EV owner clubs and forums, QR stickers at chargers (printable at `/qr/<id>`, built), club demos, a weekly "reported broken" digest, fleet partners.
- Targets and weekly milestones: `docs/GO-TO-MARKET.md`.

## 9. Progress and roadmap (honest)

- Built: map, report loop with cooldown, rules and tests, v1 read API, share pages and QR stickers, installable PWA, privacy-friendly metrics, CI with unit and browser tests.
- **TODO (founder):** launch date, real report count, distinct reporters, weekly users, conversations had. If zero, say "launching, collecting first reports in <city>".
- Next 90 days: pilot city to 1,000 reports, per-station history, design partners, second city.

## 10. Team and ask

- **TODO (founder):** your background, what you have built, why you. Cofounder or the plan to find one.
- Ask: **TODO (founder):** the amount and what it buys (for a YC application: the standard deal; for the interview: what you will do in the first 90 days).
- Contact: founders@eviq.ai
