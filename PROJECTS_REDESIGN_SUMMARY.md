# Projects Reel — Full-Screen OSPLY Structural Homage

## What changed

The previous cream-coloured, three-column project card grid has been removed entirely. The Projects section now opens a fixed full-screen reel:

- `100vw × 100vh`, `overflow: hidden`, background `#080808`, text `#ffffff`
- Opens from the existing `RUN MY PROJECTS ↗` button
- Returns with `← Return to Portfolio` (or `Escape`)
- Body scroll is locked while the reel is open and restored on exit

## Spatial zones

### Zone A — Masthead + white strip
- Edge-to-edge `WORK` wordmark rendered as stretch-to-width SVG text
- 28px solid white strip:
  - `PK — Creative Engineering Studio`
  - underlined `Selected Work` + dynamic counter (`01 / 04`)
  - `← Return to Portfolio`

### Zone B — Filmstrip + centered stage
- 22vw vertical filmstrip at the horizontal centre
- Previous and next project previews, grayscale at 35% opacity
- 34vw × 16:10 active frame, 6px radius, deep shadow
- Pointer parallax + hover zoom + `VIEW CASE STUDY ↗` overlay
- Clicking the frame opens the case study

### Zone C — Hairline + four-column HUD
- `1px rgba(255,255,255,.14)` line at 63% viewport height
- Column 1: active index
- Column 2: active tech stack
- Column 3: all project titles, active in white, inactive `#555`
- Column 4: project domain

### Zone D — Pinned footer
- Left: portfolio identity / contact link
- Centre: three-line active-project summary
- Right: `SCROLL OR CLICK TO EXPLORE · [↑/↓]`

## Interaction

- Mouse wheel (620ms debounce)
- `ArrowUp` / `ArrowDown` / `PageUp` / `PageDown`
- Clicking any title in the HUD title stack
- Touch swipe up/down on mobile
- `Escape` closes the case study, then the reel
- GSAP timelines animate the frame, filmstrip, HUD metadata and footer summary

## Case study drawer

Each project opens a dark editorial case study with:

- Full title, subtitle, domain and index
- Problem / solution overview
- Key features
- Complete technology tags
- Real project screenshot(s) from `public/projects/`
- GitHub and live links when present
- `← BACK TO REEL` and `NEXT PROJECT →`
- Internal scrolling while the reel remains fixed

## Real project assets

| # | Project | Asset | Domain |
|---|---------|-------|--------|
| 01 | Multi-Gas Sentinel | `/projects/multigas.png` | IoT & Industrial Safety |
| 02 | Price Pilot | `/projects/pricepilot.png` | E-Commerce Intelligence |
| 03 | Cine Pulse | `/projects/cinepulse.png` | Media Platform |
| 04 | The Blood Archive | `/projects/bloodarchive.png` | Creative Fan Experience |

No stock imagery or invented projects were added. The counter is `01 / 04` because four real projects exist in the data.

## Counter / page-number fix

- The old gallery printed tile numbers as `001`, `002`, … because it prefixed an already-zero-padded project number.
- All reel counters now derive from `projects.length`, so they cannot drift from the data.
- Section marks use a single `SECTION_TOTAL` constant and remain `01 / 07` … `06 / 07`, with Contact as the seventh section.
- The hero's `01 — THE OPENING ACT` is a scene label, separate from the seven content-section counters.

## About portrait block

The former `A PORTRAIT OF POTENTIAL (PENDING)` placeholder is now the real portrait figure. It uses the existing `public/projects/profilepic.jpeg` image (the same photo already used in the flip card), with the existing rings, asterisk and caption retained. No stock portrait was used. To change the photo, replace that file.

## Mobile

- Masthead scales down
- Project frame becomes 78vw × 4:3
- HUD stacks below the frame on a dark blurred panel
- Titles wrap horizontally
- Footer summary and touch hint stack at the bottom
- Touch swipe changes projects

## Verification

- `npm run build` passes
- No browser console or page errors during desktop/mobile tests
- Verified wheel, arrow keys, title clicks, touch swipe, detail open/close, next project, focus restoration and scroll-lock restoration
