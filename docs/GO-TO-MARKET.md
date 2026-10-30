# Go-to-market: the first 1,000 driver reports

Goal: **1,000 reports from at least 150 distinct people, concentrated in one pilot city,** inside 12 weeks of
launch. Every number below is a **target to test, not a forecast and not a result.** Nothing here has happened yet.

## 1. Pick the pilot city (decision, by day 3)

**TODO (founder): choose one city and write it here.** Pick the first city that satisfies all of these:

1. You can physically be at its chargers every week (reports you verify yourself are your seed data).
2. It has at least 300 public chargers in the registry (check the live `/map` count at 15 km radius).
3. You can name three local EV owner groups you can join today.
4. Mixed charger quality: some visibly flaky sites, so "broken" reports are plausible.

Fallback if none qualifies: the city where you live, even if small, because presence beats size.

## 2. Channels (named, in the order to work them)

| #   | Channel                                                                                                                                     | Action                                                                                                                                    | Target by week 12                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Local EV owner groups on Facebook and WhatsApp/Telegram (search "<city> EV owners", model-specific clubs)                                   | Join, read for a week, then ask a real question ("which chargers near X failed you this month?") and share the map as the answer          | 5 groups, 400 reports                                                    |
| 2   | Reddit: r/electricvehicles, r/<your city>, and the subreddit for your most common local EV model                                            | Post a useful, non-promotional thread with real reports from your own testing; follow each subreddit's self-promotion rules               | 2 posts, 100 reports                                                     |
| 3   | Brand owner clubs and forums for your country (for example the local Tesla, Nissan Leaf, Hyundai/Kia, VW ID owner clubs, SpeakEV in the UK) | Ask the admins first; offer a 10-minute demo at a meetup                                                                                  | 2 clubs, 150 reports                                                     |
| 4   | **QR stickers at chargers** (`/qr/<station id>` prints a ready card)                                                                        | Public kerbside chargers first, then private sites with the owner's permission. Print 50, place 40, log each location and re-check weekly | 40 stickers, 250 reports (tracked by `qr_view` and reports at those ids) |
| 5   | Fleets: ride-hail and car-share drivers who charge daily                                                                                    | Ask 5 drivers or a fleet manager to tap after each charge for two weeks                                                                   | 3 drivers, 100 reports                                                   |
| 6   | Local press and EV newsletters                                                                                                              | One factual piece after week 6, using only counted reports ("N chargers reported broken in <city> this month")                            | 1 mention                                                                |

## 3. Weekly numeric milestones (cumulative targets)

| Week | Cumulative reports | Distinct reporters | Stickers placed | Chargers with a report in the last 72 h | Buyer conversations |
| ---- | ------------------ | ------------------ | --------------- | --------------------------------------- | ------------------- |
| 1    | 20 (your own)      | 1                  | 5               | 15                                      | 0                   |
| 2    | 60                 | 8                  | 15              | 30                                      | 2                   |
| 3    | 120                | 20                 | 25              | 50                                      | 4                   |
| 4    | 200                | 35                 | 40              | 70                                      | 5                   |
| 6    | 380                | 70                 | 40              | 110                                     | 7                   |
| 8    | 580                | 100                | 40              | 150                                     | 8                   |
| 10   | 800                | 130                | 40              | 190                                     | 9                   |
| 12   | 1,000              | 150+               | 40              | 220                                     | 10                  |

Read the real numbers every Monday from `/admin/metrics` (reports, distinct clients, chargers reported, and the
`report_*`, `qr_view`, `share_view` counters). If a week is below half of target, change the channel, not the target.

## 4. Weekly routine

- Mon: read metrics, write the number down. Tue/Wed: one community action and 5 stickers or re-checks. Thu: two
  calls with reporters ("why did you tap, what stopped you?"). Fri: fix the top friction found; ship.
- Always reply to every comment within a day. Never post the same text in two groups.
- Never publish a claim you cannot back with counted reports.

## 5. What "working" looks like (and the stop signals)

- Working: repeat reporters (>= 20% of reporters report twice), reports clustered at sticker sites, unprompted shares of `/s/...` links.
- Stop and rethink if after week 4 there are fewer than 60 reports from fewer than 10 people despite effort: the one-tap loop or the channel is wrong.

## 6. Buyer track (runs in parallel from week 2)

List 30 companies in four groups (routing apps, vehicle makers' navigation teams, fleet/rental operators, charge
point operators). **TODO (founder): fill the list with real names and contacts.** Ask one question: "What does a
failed charging stop cost you, and would a per-charger reliability signal change a decision?" Show the live
`/developers` API. Target: 10 conversations by week 12, 1 design partner agreeing to trial.
