# EVIQ AI — Design System & Visual Language Specification

**Position**: Chief Design Officer, Design Systems Architect, Principal Product Designer, Motion Design Lead, UX Director, Brand Director, and Frontend Design Engineer  
**Document Status**: Official Design System & Visual Language Specification  
**Version**: 1.0  
**Target Audience**: Product Designers, Frontend Engineers, Brand Strategists  

---

## SECTION 1 — Brand Philosophy

The visual brand of EVIQ AI represents a shift from passive navigation to active, predictive mobility intelligence. We do not design static map pins; we design decision interfaces.

```
       PREDICTIVE                        PRECISE                          CALM
   Physics-informed ML,             Dynamic dynamic range,         Reducing range anxiety,
   explainable recommendations.     live queue times.              one clear decision at a time.
```

### 1. Brand Mission
EVIQ AI exists to help every EV driver make the smartest charging decision. We remove charging anxiety by predicting, explaining, and booking the optimal charging stop.

### 2. Brand Personality
EVIQ AI operates as a calm, precise, and highly reliable co-pilot. The brand aesthetics are clean, minimal, and highly functional, avoiding tech hype or excessive gradients.

### 3. Product Character
The interface feels like a premium dashboard (e.g., flight decks, spacecraft telemetry, Tesla center consoles) combined with the clean visual structure of modern productivity platforms (e.g., Stripe, Linear).
- **Map-first**: The map is the primary workspace; telemetry overlays float cleanly.
- **Premium**: Curated, unified color palettes with generous whitespace.
- **Data-rich**: High density of actual metrics, with zero filler illustrations.

---

## SECTION 2 — Design Principles

Our visual interface is governed by six core principles:

### 1. One Idea Per Screen
Avoid cognitive overload. Every viewport or card must focus on a single action or decision (e.g., locking a reservation, comparing battery curves, selecting a route).

### 2. Motion Explains Flow
Animations represent real physical transitions. Telemetry signals pulse along route lines, battery charges flow into cells, and cards snap with mechanical spring physics.

### 3. Whitespace Creates Focus
Generous margins separate complex datasets, allowing drivers to scan metrics in less than 500ms while driving.

### 4. Color Dictates Priority
Colors are strictly functional. Gray represents standard status; Electric Blue marks active AI routing; Emerald Accent highlights cost savings; Crimson Red alerts critical state.

---

## SECTION 3 — Color & Typography System

### 1. Color Palette Tokens

| Token Name | HEX Value | Accessibility Contrast | Primary Usage Cases |
| :--- | :--- | :--- | :--- |
| **Deep Navy** | `#061224` | N/A (Base) | Base background for the application canvas and dark sections. |
| **Near Black** | `#02050A` | N/A (Base) | Panels, structural sidebars, and header interfaces. |
| **White** | `#ffffff` | N/A (Base) | Base canvas and clean containers. |
| **Electric Blue** | `#4FD1FF` | 4.8:1 (against Navy) | Active AI routes, reservation locks, and cursor snap highlights. |
| **Emerald Accent** | `#10b981` | 5.2:1 (against Navy) | Verified financial savings, battery health metrics, and successful connections. |
| **Crimson Red** | `#ef4444` | 4.6:1 (against Navy) | Critical battery alerts, charger downtime, and navigation errors. |
| **Neutral Gray** | `#6b7687` | 4.5:1 (against White) | Secondary copy, borders, grid structures, and inactive states. |

### 2. Typography
- **Primary Typeface**: `Inter`
- **Fallback Typeface**: `SF Pro Display`, `system-ui`, `sans-serif`
- **Heading scale**:
  - `Display`: 40px - 68px, bold, letter-spacing `-0.035em`
  - `Title`: 20px - 28px, semi-bold, letter-spacing `-0.02em`
  - `Body`: 13.5px - 15.5px, regular, leading `1.6`

### 3. Materiality & Panels
- **Frosted Glass Panel**:
  ```css
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(18px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  ```
- **Borders (Light Layout)**: `rgba(6, 18, 36, 0.09)`.
- **Card Radius**: `rounded-[22px]` (22px radius for primary dashboard widgets).
