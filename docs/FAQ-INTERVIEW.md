# The 25 hardest interview questions

Honest drafts, based on what exists in this repository. **TODO (founder)** marks anything only you can answer.
Practise them aloud. If an answer here is not true for you, change it. Do not memorise, and do not bluff:
"I do not know yet, here is how I would find out" is a good answer.

## The business

**1. What does EVIQ do, in one sentence?**
It tells EV drivers whether a charger actually works, by combining open registry data with one-tap driver reports that expire, and we plan to sell that reliability data as an API.

**2. Who pays you, and how much?**
Nobody yet. The hypothesis is routing and navigation apps, vehicle makers, fleets and charge point operators paying for a reliability API. Pricing is a guess to test (starting range in `docs/YC.md`), tied to what one failed charging stop costs the buyer. **TODO (founder):** any conversation you have had with a potential buyer, in your words, or "none yet".

**3. Why would anyone pay for this when the data is free?**
The registry is free; "worked at 9:41" is not in it. A buyer pays for a signal they cannot get any other way and that makes their product visibly fail less. If a buyer says they would not pay, we are wrong about the business, and we should find that out in design-partner calls, not by guessing.

**4. Is this a business or a feature of Google Maps?**
It could be acquired as a feature, which would be an acceptable outcome. As a business it is a neutral data supplier to many apps, including Google-sized ones. The risk is real: a large app can add one-tap reports to its own map. Our defence is speed to dense coverage, openness of the rules, and being the supplier everyone else buys from.

**5. PlugShare and Zap-Map already have check-ins. What is different?**
They have users and history we do not, and I will not pretend otherwise. We differ in: one tap instead of a free-text check-in, published rules that turn reports into a status and expire old news, and an API-first product. **TODO (founder):** verify their current features before the interview.

**6. How big can this get?**
**TODO (founder):** I will not give a TAM number I cannot source. The honest chain: number of public chargers times how often their status matters to software that routes people. Build it from sourced counts, not a round number.

**7. Why you?**
**TODO (founder).** Concrete: the thing that happened to you, what you have shipped, why you will do the slow city-by-city work.

## The data and the moat

**8. What is the moat, really?**
A growing, timestamped history of verified outcomes per charger, collected where registries cannot. It compounds: more reports make status and later reliability scores better. It is a weak moat on day one and I should say so; it becomes real with density in specific areas.

**9. Cold start: why would the first user report anything?**
Early on the map is mostly "Unverified", which is honest but not exciting. We start in one city we can physically cover, seed with our own checked reports, put QR stickers at chargers so the reporter is already standing there, and recruit through owner clubs. The reporter's reward is helping the next driver and being a club regular, not a prize. **TODO (founder):** pick the city and say why.

**10. How do you stop spam and fake reports?**
Layers: one report per charger per client per 10 minutes (server-side), IP rate limits, strict validation, hashed client ids, and expiry so wrong data heals itself. Honest limit: someone rotating networks can still skew one charger. Planned, not built: weighting repeat reporters, anomaly flags, and corroboration across reports.

**11. What stops a competitor or an operator from gaming it?**
Mostly the same layers. An operator marking its own chargers "working" faces the cooldown and rate limits like anyone else, and a later honest "broken" report overrides it. Not solved: coordinated attacks. We would detect them with the planned anomaly flags.

**12. Open Charge Map and OpenStreetMap are your data. What about licences?**
OCM is CC BY 4.0 (attribution), OSM is ODbL (share-alike on derived databases). We credit both in the app. Before selling an API that mixes OSM-derived fields, I need legal advice. The core value, reports and status keyed by station id, is our own data and kept separate. **TODO (founder):** whether you have taken that advice.

**13. What if OCM or Overpass rate-limit you or change terms?**
We cache upstream responses for 5 minutes, fall back from OCM to OSM, and retry once. At volume we would add our own cache or a paid tier. Dependency on community-run services is a real risk and a reason to build our own station table.

**14. Same charger appears in OCM and OSM under different ids. Problem?**
Yes, and it is not solved. Today one source per request and reports are keyed to that source's id, so the same physical charger can have split histories. A canonical station identity is on the roadmap and needed before selling the API.

## The product and the proof

**15. How many users and reports do you have?**
**TODO (founder):** real numbers from the admin metrics page (`/admin/metrics`) and the database, with the date launched. If zero, say that and what you are doing about it this week.

**16. Is it live? Show me.**
**TODO (founder):** deployed URL. What exists in the repo: map, reports, rules, v1 API, share pages, QR stickers, PWA, tests. What is not verified: it has not been run against live Open Charge Map, Overpass or Nominatim responses in the build environment (blocked there); that must be checked on the deployment.

**17. Who wrote the code?**
**TODO (founder):** be exact about what you wrote and what AI tools wrote, and how you reviewed it. The rules in `lib/reliability.ts`, the tests, and the report pipeline are the parts to be able to explain line by line.

**18. Walk me through how a status is computed.**
Newest report decides while fresh: broken within 48 h means "Reported broken"; working or busy within 24 h means "Verified working"; otherwise operator offline means "Operator says offline"; otherwise "Unverified". Reports over 72 h are ignored. It is on `/how-it-works` and generated from the same constants as the code.

**19. A charger is fine but a driver was blocked by a parked car and reported "broken". Wrong label?**
Yes, that happens: "broken" and "busy" are separate buttons for that reason, but people mis-tap. The newest report wins, so the next driver corrects it. We would not claim the label is a guarantee; the copy says "reported by drivers".

**20. Why not use real-time data from operators (OCPP)?**
Many operators do not expose it to third parties, and it differs by network. Operator data is a signal we show where present. Driver reports are the layer that works everywhere. OCPP or vehicle-session verification is a later, partner-dependent improvement.

## Risk, legal and operations

**21. What does it cost to run, and what happens at 100x traffic?**
Today: a hosting plan and a small Postgres. Upstream calls are cached and rate limited, and report writes are tiny. The weak points at scale are upstream rate limits and in-memory rate limiting being per-instance. **TODO (founder):** your actual costs once deployed.

**22. What personal data do you hold?**
No accounts. Each report stores station id, status, time and a one-way hash of network address plus browser. Location is not stored in our database, though hosting providers may log requests. Privacy page says this. Not done: formal privacy review, terms of service.

**23. What if someone is stranded because of your label?**
We say "reported by drivers" and show the time and the rule, and we never imply a guarantee. Terms of service before commercial use are not written yet and need a lawyer.

**24. What are you least sure about?**
Whether buyers will pay, and whether reporters will show up in any city without a physical push. Both are testable in 90 days: one pilot city to 1,000 reports, and ten buyer conversations that end in a yes, a no with a reason, or a paid pilot.

**25. If you got into YC, what would you do in the first 90 days?**
Ship to one pilot city and get to 1,000 reports from at least 150 people, add per-station history and the canonical station id, put the API behind keys, and sign one or two design partners. **TODO (founder):** adjust to your real plan.
