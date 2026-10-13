# Changelog — EVIQ AI

All notable changes to the EVIQ AI project will be documented in this file.

---

## [Unreleased]

### Fixed

- `/api/chargers`: validate and clamp query params, prefer a server-only `OCM_API_KEY`, and return real error statuses instead of masking failures as empty results.
- Charger data: handle stations with no connectors (NaN port counts), use the fastest connector's power, and map CCS1/CCS2/CHAdeMO/Type 2 correctly.
- Demo: remove duplicate route planning on load, discard stale in-flight plans, show real lookup errors, fix autocomplete re-fetching and "undefined" place names, guard zero-power chargers, and keep 0°C weather from showing as 22°C.
- Reservation simulation: timers no longer restart on parent re-renders, side effects moved out of state updaters, and cost/energy use the real vehicle and tariff.
- Map: stop re-framing the camera on every recompute and escape station names in popups (XSS).
- Landing: dead footer anchors, intro animation now landing-only, honours reduced motion, and no longer blocks input; Inter font wired up; invalid Tailwind classes replaced.

---

## [1.0.0] - 2026-07-10

### Added

- Initial release of the EVIQ AI Mobility Intelligence Platform.
- Fully interactive visualizer for EV Charging Stations, Battery Profiles, and Route plans.
- Live dashboard simulation showing dynamic charging speed curves, queue predictions, and reservation states.
- AI Assistant preset conversational terminal.
- Technical architecture SVG diagram mapping our 9-stage pipeline.
- Target users and target verticals overview grids.
- Complete documentation suite (Build Bible, Design System, Experience Bible, YC Thesis, Security).
