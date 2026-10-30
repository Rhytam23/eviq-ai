# Environment variables

Every variable EVIQ reads, what it does, and where to get it. The commented template is
[`env/.env.example`](.env.example). The root `.env.example` lists the same names and points here.

**Rule: real values live only in `.env.local` (git-ignored) and in your host's environment settings.
Never commit them, paste them in issues or PRs, or prefix a secret with `NEXT_PUBLIC_`.**

## Summary

| Variable                    | Required?                    | Exposed to browser? | What breaks without it                                                             |
| --------------------------- | ---------------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `OCM_API_KEY`               | No                           | No (server only)    | Nothing. The app falls back to OpenStreetMap, which has less operator status data. |
| `OCM_API_URL`               | No                           | No (server only)    | Nothing. Defaults to the public Open Charge Map endpoint.                          |
| `OVERPASS_API_URL`          | No                           | No (server only)    | Nothing. Defaults to three public Overpass mirrors, tried in order.                |
| `LAUNCH_COUNTRIES`          | No                           | No (server only)    | Nothing. Defaults to `IN`: visitors outside India see the coming-soon page.        |
| `SUPABASE_URL`              | Production: yes. Dev: no     | No (server only)    | Reports are kept in memory and lost on restart; the UI says so.                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Production: yes. Dev: no     | No (server only)    | Same as above. Must be set together with `SUPABASE_URL`.                           |
| `REPORT_HASH_SALT`          | Production: strongly advised | No (server only)    | A random per-process salt is used, so cooldowns reset on every restart or deploy.  |
| `ADMIN_TOKEN`               | No                           | No (server only)    | `/admin/metrics` cannot be opened (sign-in is refused). Nothing else breaks.       |
| `NEXT_PUBLIC_SITE_URL`      | No                           | Yes (public)        | Metadata, sitemap and robots use `https://eviq.ai`.                                |

"Server only" means the value is read in API routes and never reaches the browser bundle. Only names
starting with `NEXT_PUBLIC_` are public, and the only one we use is a URL.

## Local setup

```bash
cp env/.env.example .env.local
# fill in what you have, leave the rest empty
npm run dev
```

With every value empty the app still runs: OpenStreetMap data, in-memory reports. That is the intended
zero-config developer experience.

## `OCM_API_KEY` (Open Charge Map)

- **What it does:** switches charger data to Open Charge Map, which carries operator status
  (`StatusType.IsOperational`), a last-status-update date, usage cost, and number of points. If the call
  fails, the API falls back to OpenStreetMap and the UI says so.
- **Get it:** create a free account at <https://openchargemap.org>, sign in, open **My Profile** and then
  **My Apps** (<https://openchargemap.org/site/profile/applications>), register an application, and copy
  the API key. Details: <https://openchargemap.org/site/develop/api>.
- **Where we send it:** as the `X-API-Key` request header from the server, never in a URL.
- **Rotate:** in the OCM profile delete the application, create a new one, update the variable in
  Vercel and `.env.local`, and redeploy. Do this immediately if the key was ever committed or exposed.
  An earlier version of this project exposed a key through a `NEXT_PUBLIC_` variable: **that key must be
  treated as compromised and revoked.**
- **Licence:** OCM data is CC BY 4.0. Attribution is shown in the app.

## `OCM_API_URL` and `OVERPASS_API_URL` (advanced)

Override the upstream endpoints, for example to use a self-hosted Overpass mirror (the public servers have fair-use
limits). When set, it is used alone and the built-in mirror failover is off or, in tests, a local mock. Leave them empty in normal deployments. They are server-only and never sent to
the browser.

## `LAUNCH_COUNTRIES` (launch regions)

Comma-separated two-letter country codes that may use EVIQ, for example `IN` or `IN,AE`. The default is `IN`.
Visitors from any other country see `/coming-soon`, and API calls from there get a 403. Set `*` to open the
app to everyone. The country comes from the `x-vercel-ip-country` header (or `cf-ipcountry` behind Cloudflare).
If the host sends no country header, as in local development and the tests, nobody is blocked. `/api/health`,
`robots.txt` and static assets stay reachable from anywhere.

## `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (report storage)

- **What they do:** store driver reports in a Postgres table through Supabase's REST API. Both must be
  set, otherwise the in-memory store is used. `GET /api/v1/stations` returns `"storage": "supabase"` or
  `"memory"` so you can check which one is live.
- **Create the project:** <https://supabase.com/dashboard> -> **New project**. Choose a region near your
  users and save the database password somewhere safe (the app does not need it).
- **Create the table:** open **SQL Editor**, paste the whole of [`supabase/schema.sql`](../supabase/schema.sql)
  and run it. It creates `reports`, its indexes, and enables row level security with no policies, so only
  the server (service role) can touch it.
- **`SUPABASE_URL`:** **Project Settings -> API** (or **Project Settings -> Data API**), field
  **Project URL**, shaped like `https://abcdxyz.supabase.co`.
- **`SUPABASE_SERVICE_ROLE_KEY`:** **Project Settings -> API Keys**, the `service_role` secret key
  ("Reveal" it). It bypasses row level security. **Never** put it in client code, a `NEXT_PUBLIC_`
  variable, a screenshot, or a commit. If Supabase's new key format is shown, use the secret key (`sb_secret_...`).
- **Rotate:** in the same page generate a new secret key, update Vercel and `.env.local`, redeploy, then
  revoke the old key. Rotate immediately if it leaks.
- **Not used:** the `anon`/publishable key. The browser never talks to Supabase.
- **Retention:** the app ignores reports older than 72 hours. Optionally delete old rows on a schedule
  (see the comment at the end of `supabase/schema.sql`).

## `REPORT_HASH_SALT`

- **What it does:** secret used to HMAC the client's network address and browser string into the
  identifier that enforces the 10-minute cooldown. Raw addresses are never stored.
- **Generate:** `openssl rand -hex 32` (or any password manager). Keep it stable: changing it makes old
  hashes unmatchable, which only resets cooldowns.
- **Rotate:** set a new value and redeploy. No data migration needed.

## `ADMIN_TOKEN`

- **What it does:** the password for `/admin/metrics` (report counts, distinct reporters, daily event counters).
  The page sets an httpOnly cookie derived from the token, so the token itself never sits in the browser.
- **Generate:** `openssl rand -hex 24`. It must be at least 16 characters or the page refuses all sign-ins.
- **Rotate:** set a new value and redeploy; existing sessions stop working immediately.
- The page is not linked from anywhere and is marked `noindex`.

## `NEXT_PUBLIC_SITE_URL`

Canonical origin without a trailing slash, for example `https://eviq.ai`. Public by design, contains no
secret. Set it to your preview or production domain if it differs from the default.

## Vercel setup

1. **Import the repo:** Vercel dashboard -> **Add New -> Project** -> select `Rhytam23/eviq-ai`.
   Framework preset: Next.js (auto-detected). Leave build and output settings at their defaults.
2. **Add variables:** **Project Settings -> Environment Variables**. For each name in the table add the
   value and tick **Production** and **Preview** (add **Development** only if you use `vercel dev`).
   Mark the secrets as **Sensitive** so they cannot be read back from the dashboard.
3. **Redeploy:** environment changes only apply to new deployments. **Deployments -> ... -> Redeploy**.
4. **Verify:** open `https://<your-domain>/api/v1/stations?lat=52.52&lng=13.405&radiusKm=5` and check
   `"source"` (`ocm` if the key works) and `"storage"` (`supabase`), and `https://<your-domain>/api/health?deep=1`
   which must answer `"reportStore":"reachable"`.

### Vercel deploy checklist

- [ ] Supabase project created and `supabase/schema.sql` run without errors
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set for Production and Preview
- [ ] `REPORT_HASH_SALT` set (random, 32+ bytes)
- [ ] `OCM_API_KEY` set (new key; the one from earlier versions revoked)
- [ ] `ADMIN_TOKEN` set (random, 16+ characters) and you can sign in at `/admin/metrics`
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain
- [ ] Domain added under **Settings -> Domains**; `founders@eviq.ai` mailbox actually receives mail
- [ ] Deployment succeeded; `/`, `/map`, `/how-it-works`, `/developers`, `/privacy`, `/opengraph-image`, `/manifest.webmanifest` load
- [ ] `/api/v1/stations?...` shows `"storage": "supabase"` and `/api/health?deep=1` is 200
- [ ] Submit a test report on a charger; confirm a row appears in **Table Editor -> reports**
- [ ] Submit the same report again: you get the 10-minute cooldown message
- [ ] On the map, the "reports are not persisted" warning is **not** shown
- [ ] No secret appears in `git log -p`, the browser bundle, or Vercel build logs

## What must never be committed

`.env`, `.env.local`, `.env.*.local`, any real key, the service-role key, database passwords, exported
Supabase dumps containing hashes, and screenshots of dashboards showing keys. The `.gitignore` covers the
env files; nothing protects you from pasting a key into code or docs, so check diffs before you push.
Run `git log -p | grep -i -E "service_role|api[_-]?key"` if in doubt.
