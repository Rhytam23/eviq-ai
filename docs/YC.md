# Y Combinator application pack

Tied to the Fall 2026 Request for Startups theme **"Data for the Real World"**
(<https://www.ycombinator.com/rfs>). Re-read the live RFS text before submitting: we picked the theme from
the page at the time of writing, and the wording may have changed.

## How to use this document

- Everything marked **`FOUNDER TO FILL`** is a fact only you have (traction, background, numbers). Do not
  leave an empty bracket in the submitted form, and **do not invent or round up anything**. YC checks, and
  an honest "we have 40 reports from 3 people" beats a made-up number.
- Everything else is a draft grounded in what is actually built in this repository (see `README.md`
  "What is built"). Edit it into your own voice. Short, plain, specific beats clever.
- The form's questions and limits change each batch. Use this as source material, not as a paste-in.

## The two-sentence pitch

> EVIQ tells EV drivers whether a charger actually works before they drive there, by combining open
> registry data with one-tap driver reports that expire, and computing a status anyone can audit. We start
> as a free map and become the reliability data API that routing apps, carmakers and fleets pay for.

Shorter (one line, for "describe your company in 50 characters"): **"Is this EV charger working? Driver-verified."**

## Why this fits "Data for the Real World"

The real world has a lot of infrastructure whose status is not recorded anywhere reliable. EV chargers are
a clear case: their locations are open data, their working state is not. EVIQ turns on-the-ground human
observations into a structured, time-stamped, auditable dataset about physical infrastructure, and sells it
to software that needs it. (If the RFS wording emphasises a particular angle, such as sensors, labelling or
collection at the source, adjust this paragraph to speak to it directly.)

## Answers to YC's standard questions

### What is your company going to make? (what we do)

EVIQ is a driver-verified reliability layer for EV charging. Open registries such as Open Charge Map and
OpenStreetMap tell you where chargers are, and sometimes carry an operator status, but they rarely know
whether a charger worked this morning. EVIQ shows each charger on a map with one of four labels: Verified
working (with the time), Reported broken, Operator says offline, or Unverified. The label comes from
published rules over operator data and one-tap driver reports (working, broken, busy) that age out after
24 to 72 hours. It works in any city, with no account.

What exists today: a working web app with a global map, location search, filters, a report loop with
server-side cooldown and rate limits, persistent storage (once Supabase is configured), and unit-tested
status rules. A free read API (`/api/v1`, alpha, documented in `docs/openapi.yaml`) exists; keys, plans and SLAs, which a paid
product would need, are **not built**.

### Why did you pick this idea? / the insight

**FOUNDER TO FILL (personal story).** What happened to you or someone you know with a dead or blocked
charger? Why you? Keep it concrete: when, where, what it cost you. Do not borrow a story.

The product insight we can state honestly: _registry data is a commodity and anyone can copy it, but a
time-series of verified outcomes per charger cannot be scraped, because it only exists if drivers report it
at the moment it happens._ The first product to collect it in a trusted, structured way owns something the
open registries structurally lack.

### Why now?

- EV charging is expanding quickly across regions, so more drivers depend on public chargers they have never
  used. **FOUNDER TO FILL: add one or two sourced facts with links (for example from IEA or a national
  regulator) rather than pasting numbers from memory.**
- The open registries are mature enough to build on, so a startup can begin with the "where" for free and
  spend its effort on the missing "whether it works".
- Routing apps and in-car navigation increasingly route by charger, so wrong status data causes visible
  failures for them. (Phrase as a hypothesis until a design partner confirms it.)

### Who are your users and customers?

- **Users (free):** EV drivers, especially on trips or in unfamiliar cities, who need a charger to work on
  arrival. They also produce the data by tapping a report.
- **Customers (planned, none yet):** routing and navigation apps, vehicle makers' in-car navigation, fleet and
  rental operators, and charge point operators who want to see how drivers experience their sites.
- **FOUNDER TO FILL:** number of people you have talked to, who they are, what they said, and any who agreed to
  pilot. State "none yet" if none. Quote only real conversations.

### How do you make money?

Hypothesis, to be validated with design partners:

1. **Reliability API (primary).** Per-station reliability status, last-verified time and report counts,
   delivered by REST and bulk files. Pricing hypothesis: tiered by monthly requests and covered area, with
   a free tier for non-commercial and open-source use. Starting point to test: low four figures per year
   for small apps, five to six figures for OEM or fleet licences. **These are guesses to test in customer
   conversations, not market facts.** Tie price to the cost of one failed charging stop for the buyer.
2. **Operator analytics (secondary).** Dashboards for operators showing how drivers see each site.
3. **Never:** selling individual driver data. We do not collect it.

### Who is the first API customer? (hypothesis, not a fact)

Start with the buyer who feels a failed charge stop most directly and can decide fastest: **a fleet or car-share
operator that charges every day in the pilot city, and an independent EV trip-planning or routing app.** Both can
test the API with a few lines of code (`/api/v1/stations`, documented at `/developers`), and neither needs a long
procurement cycle. Vehicle makers are the larger prize and a much slower sale, so they come second. The test: ask
10 such buyers what one failed stop costs them and whether a per-charger signal would change a routing decision;
then offer a free trial in exchange for feedback and a price conversation. **TODO (founder):** the names you will
actually approach, and what each answers.

### Who are your competitors? What do you understand that they don't?

Verify each of these yourself before submitting; products change.

- **PlugShare and Zap-Map** (community check-ins and comments): closest in spirit and with large existing
  communities. Our bets: a one-tap report instead of a free-text check-in, a published rule that decides the
  status and expires old news, and an API-first data product. We must be honest that they have users and
  history we do not.
- **Google Maps and OEM navigation:** show charger locations and sometimes live availability from partners.
  They are potential customers as much as competitors.
- **Operator apps (ChargePoint, EVgo, Electrify America, Tesla and others):** good data for their own
  network, nothing across networks, and an incentive to show their own sites favourably.
- **Open Charge Map and OpenStreetMap:** our data sources, not competitors. Registries, with operator
  status when provided.
- **Route planners such as A Better Routeplanner:** potential customers.

What we understand: the scarce thing is a trustworthy, expiring, per-charger signal that other software can
call. The map is the collection mechanism, not the product.

### How far along are you? / progress

Verified by the repository, as of this branch:

- Working web app: global map, auto-locate, city search, clustering, connector and power filters, km or
  miles, status per charger with source shown, list and detail views, one-tap reports with optimistic update.
- Backend: station endpoint merging operator data and reports, report endpoint with strict validation,
  10-minute per-client cooldown, rate limits, hashed client ids, Supabase storage schema with row level
  security.
- Unit tests for the status rules, provider normalisation, cooldown and validation, run in CI.
- Open source: <https://github.com/Rhytam23/eviq-ai>.

**FOUNDER TO FILL, the section that matters most:**

- Deployed URL and date it went live.
- Number of real driver reports collected, from how many distinct people, in which places. (Query the
  `reports` table; count distinct `client_hash`.)
- Number of weekly active users you can actually measure. If you have no analytics, say so.
- Conversations with drivers, communities, operators or app makers, and what came of them.
- Anything you did to get reports (posts, groups joined, stickers placed) and what happened.
- If these are all zero today, say "launched on <date>, collecting our first reports" and go get real ones
  before you apply. See the go-to-market plan below.

### How long have you been working on this, and is it full-time?

**FOUNDER TO FILL.** (Start date, hours per week, current job or studies.)

### What is your tech stack, and what did you build yourself?

Next.js 14 (App Router), React, TypeScript, Tailwind, MapLibre GL, Supabase (Postgres), Vercel, Vitest.
Charger data from Open Charge Map and OpenStreetMap Overpass; city search through Nominatim. The reliability
rules, report pipeline, abuse controls and map UI are written for this project. **FOUNDER TO FILL:** be exact
about what you wrote and what you directed AI tools to write; YC interviewers ask, and "I used AI to write a
lot of this and here is how I reviewed it" is a fine, honest answer.

### Founder: background, and something impressive you have built or done

**FOUNDER TO FILL.** Education, work, projects, anything that shows you finish hard things. Specific beats
impressive-sounding. If EVIQ is the most impressive thing, say what was hard about it (for example the
abuse model, or shipping a global product with no per-city setup).

### Why you? Why are you the right person?

**FOUNDER TO FILL.** One honest paragraph: your tie to EVs or maps or data, why you will push through the
slow, unglamorous work of collecting reports city by city, and what you can do that others cannot.

### Cofounder(s)

**FOUNDER TO FILL.** YC strongly prefers teams. If you are solo, say why, and whom you would bring in
(an engineer or an operator in EV charging).

### What is the hardest thing, and what is your plan?

The cold start: a reliability map with no reports is a map of unverified chargers. Plan below. The second
hardest thing is trust: keeping the data good when anyone can tap a button.

### Anything else?

Link the live app, the repository, the 1-minute video and the demo video.

## Data-moat argument (for the interview)

1. **Registries are copyable. Verified outcomes are not.** A competitor can import the same open data in an
   afternoon. They cannot import "this charger failed at 9:41 on Tuesday" unless a driver was there to
   report it.
2. **The record compounds.** Each report improves that station's history and every buyer's routing. A
   per-charger history of working, broken and busy over months supports reliability scores and failure
   prediction that need time to accumulate.
3. **Locally dense, globally reusable.** The product works everywhere on day one with unverified labels, and
   improves city by city where reports accumulate. The API buyer cares most about dense areas first.
4. **Neutral position.** Operators have a stake in how they look. A neutral reporter-fed layer can serve
   buyers who need an impartial signal.
5. **Honest weaknesses:** a larger incumbent with a user base could add one-tap reports; check-in
   apps already hold community data; reports can be wrong or malicious. The defence is speed to dense
   coverage in chosen areas, transparent rules, abuse controls and API-first design. Say this out loud.

## Go-to-market: the first 1,000 driver reports

Target: **1,000 reports from at least 150 distinct people across at least 3 dense areas** (numbers are a
goal to test, not a forecast). Pick one pilot city first where you can physically go, so you can
verify reports yourself and talk to drivers.

1. **EV owner communities (week 1 to 4).** Join the local owners' clubs and model-specific forums and
   groups for the pilot city. Do not spam: post a genuine question ("which chargers near X are unreliable
   lately?"), then share the map as the answer, and ask for reports on specific sites. Reply to every
   comment. Ask each active member for a 30-minute call.
2. **QR stickers at chargers (week 2 onward).** A small sticker or card at a charger linking to that station's
   page: "Working or broken? Tell the next driver, one tap." Needs the station deep link (planned: a
   `/map?station=<id>` link, not built yet) and permission from site owners where on private property. Start
   with public kerbside chargers. Track each sticker with its own link.
3. **Local clubs and meetups.** Offer to demo at an owners' club evening. Bring a printed QR code and ask
   everyone present to report the chargers they used this week.
4. **Partnerships.** Approach one or two charging operators or a local council with a free offer: "a weekly
   summary of how drivers report your sites." Also ride-hailing or car-share fleets that charge daily and
   can report in bulk. Always say what you will and will not do with the data.
5. **Content with real data.** Once reports exist, publish "chargers drivers reported broken this week in
   <city>", with every claim backed by counted reports. Never publish what you cannot show.
6. **Tight loop.** Review the reports table weekly, talk to the top five reporters, find out why they tap,
   and fix friction (one-tap on mobile, no login).

Measures to keep (all from your own data): reports per week, distinct reporters, share of chargers in the pilot
area with a report in the last 72 hours, repeat reporter rate, and reports contradicting each other.

## 90-day plan

| Days     | Goal                              | Concrete work                                                                                                                                   |
| -------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 to 14  | Ship and instrument               | Deploy with Supabase and keys, record videos, add privacy-safe measurement of weekly users and reports, station deep links, submit to YC        |
| 15 to 45 | First real data in one pilot city | Community posts, 50 stickers, club demos, 10 driver calls; fix friction; target 300 reports                                                     |
| 46 to 75 | Make the data worth paying for    | Per-station history and trend, stronger abuse weighting, a keyed read API in alpha; approach 10 prospective design partners (apps, fleets, OEM) |
| 76 to 90 | Prove demand                      | Sign one or two design partners (even unpaid), set price from their answers, expand to a second city; target 1,000 reports and one partner      |

## Risks and mitigations

| Risk                                | Why it matters                                                                                      | Mitigation                                                                                                                                                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cold start**                      | Empty reports means every charger is "Unverified"; no reason to return                              | One pilot city, physical presence, stickers, seed with your own verified reports, honest labelling; the map is still useful as an open-data map with filters                                                                                   |
| **Spam and abuse**                  | Anyone can tap; competitors or trolls could mark good chargers broken                               | Cooldown per client and station, IP rate limits, strict validation, expiry, newest-report-wins (self-correcting). Planned: reporter weighting, anomaly flags, optional proof signals. Know the limit: determined attackers can rotate networks |
| **Data licensing: Open Charge Map** | OCM data is CC BY 4.0: attribution required, and key terms apply                                    | Attribution shown; read OCM's terms before selling a derived API; our own reports are separate data we own. Consider contributing corrections back                                                                                             |
| **Data licensing: OpenStreetMap**   | ODbL is share-alike for derived databases; a commercial API mixing OSM data can trigger obligations | Keep OSM-derived fields separable from our report data; get legal advice before the API launches; the API's core value (reports, status) is our own data keyed by station id                                                                   |
| **Station identity**                | Ids from OCM and OSM differ; the same charger can appear under both                                 | Today one source per request. Planned: a canonical station id mapping, needed before API sales                                                                                                                                                 |
| **Upstream limits**                 | Overpass and Nominatim have fair-use policies; OCM has rate limits                                  | Server-side caching (5 min for stations, 1 day for geocoding), limits, identified user agent. Planned: our own cache layer or paid tier before volume                                                                                          |
| **Incumbents add the feature**      | PlugShare, Google or OEMs could add reports                                                         | Speed in chosen areas, API-first neutrality, open rules; be an acquirable data asset if that is the outcome                                                                                                                                    |
| **Legal / liability**               | A driver strands because of our label                                                               | Clear wording ("reported by drivers, not guaranteed"), terms of service before commercial use (**not written yet**)                                                                                                                            |
| **Single founder**                  | YC and customers weigh team risk                                                                    | Find a cofounder or early operator advisor                                                                                                                                                                                                     |

## Founder video script: 1 minute

Record yourself, one take, looking at the camera. Say your own words; this is a skeleton.

- **0:00 to 0:10, who and what.** "I'm Rhytam Biswas. I'm building EVIQ, which tells EV drivers whether a
  charger actually works before they drive there."
- **0:10 to 0:25, the problem and why you.** "FOUNDER TO FILL: your 15-second personal story with a dead
  charger." Then: "Registries show where chargers are. Nobody reliably records whether they work."
- **0:25 to 0:40, what you built.** "Drivers tap working, broken or busy. Reports expire. We compute one
  status from published rules, anywhere in the world. It's live at <URL>."
- **0:40 to 0:52, traction, only if true.** "FOUNDER TO FILL: real numbers, or 'we just launched and are
  collecting our first reports in <city>'."
- **0:52 to 1:00, the business and the ask.** "The map collects the data. The business is selling the
  reliability data as an API to routing apps, carmakers and fleets. I'd love to build it with YC."

## Demo video script (2 to 3 minutes)

Screen-record at desktop width, then a short phone clip. Use the deployed app with real Supabase and
real data; do not stage fake reports.

1. **Landing page (15 s).** "Know the charger works before you drive there." Scroll to the status rules and
   the report-aging timeline: "No black box. Four labels, public rules."
2. **Open `/map` (20 s).** It asks for location and loads chargers. "Every station shows its source:
   Open Charge Map or OpenStreetMap." Show a city search to a place far away, to show it is global.
3. **Filters and units (10 s).** Connector type, minimum kW, km to miles.
4. **A station (25 s).** Open one: status, why, operator data, connectors, price "Unknown" when unknown.
   "We never guess a price or availability."
5. **Report loop (35 s).** On a real charger you are at, or one you can verify, tap Working or Broken. The
   badge updates immediately. Reload to show it persisted (the "not persisted" warning is absent).
   Try again to show the 10-minute cooldown.
6. **The business (25 s).** Open `/developers` and run one `curl` against `/api/v1/stations`: "This status is
   already a free read API in alpha. Keys and paid plans are the next step, and they are not built." Be exact
   about that.
7. **Close (10 s).** "Open source, tested rules, working today. <URL>."

## Pre-submission checklist

- [ ] App deployed on your domain; `/api/v1/stations` reports `"storage": "supabase"` and `/api/health?deep=1` returns 200
- [ ] Old OCM key revoked; new one in Vercel only; no secrets in git history
- [ ] `founders@eviq.ai` receives mail; reply within a day
- [ ] You have real reports in the database, and you know the real numbers to quote
- [ ] Every **FOUNDER TO FILL** above is replaced with a fact, or deleted
- [ ] You re-read the YC RFS page and the current application questions and fit your answers to them
- [ ] You verified every competitor statement in this document against the products today
- [ ] The landing page and README claim nothing that is not built (read the "Where we are" section aloud)
- [ ] 1-minute founder video recorded (good audio, one take) and demo video recorded; both linked
- [ ] The GitHub repo is public, README is accurate, CI is green on `main`
- [ ] You can explain, without notes: the status rules, the abuse model and its limits, the data licences,
      the cold-start plan and the pricing hypothesis, and which parts you wrote versus directed
- [ ] You have a list of people to ask for a quick intro or reference who can speak to you or the product
