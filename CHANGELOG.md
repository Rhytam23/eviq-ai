# Changelog

## Unreleased

- Reposition as a driver-verified reliability layer for EV charging.
- New `/map` product with auto-locate, city search, clustering, filters, one-tap reports.
- Charger data from Open Charge Map or OpenStreetMap; reports in Supabase or memory.
- Transparent status rules with unit tests; landing, privacy, OG image, sitemap, robots, 404.
- Removed the earlier trip-planner demo, modelled price/availability/reliability numbers and the dark HUD landing page.
- Public read API `/api/v1`, OpenAPI file, `/developers`, `/how-it-works`, share pages, QR stickers, PWA, metrics, admin page.
- Upgrade to Next 16 / React 19 / MapLibre 6 / Vitest 5 / ESLint 9; `npm audit` reports 0 vulnerabilities.
- Playwright e2e and axe checks in CI; CSP and security headers; `/api/health`; error boundaries.
- Security: removed a browser-exposed Open Charge Map key (revoke it), upgraded Next.js to 14.2.35.
