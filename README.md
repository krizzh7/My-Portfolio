# P. Krishaanth — Creative Engineering Portfolio

A dark, editorial personal portfolio built around motion, typography, and real project work. The site combines a scroll-driven introduction with a full-screen interactive project reel and a set of long-form portfolio sections.

**Live contact:** [krishaanth.partha@gmail.com](mailto:krishaanth.partha@gmail.com)

---

## Stack

- **React 18** + **TypeScript**
- **Vite 6**
- **GSAP 3** + **ScrollTrigger**
- **Three.js** via `@react-three/fiber` for the hero atmosphere
- **Lucide React** icons
- Google Fonts: DM Sans, DM Mono, Space Grotesk, Roboto Slab

---

## Getting started

### Requirements

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Vite starts on `http://localhost:5173` by default.

### Production build

```bash
npm run build
npm run preview
```

`npm run build` runs TypeScript compilation first (`tsc -b`) and then the Vite production build.

---

## Page structure

1. **Loading screen** — short boot sequence with the PK monogram
2. **Hero** — `CODE. CREATE. CONQUER.` with a lazy-loaded WebGL atmosphere
3. **Flip intro** — scroll-scrubbed 180° CSS 3D card revealing the About side
4. **About** — portrait, current context, institution facts, social links
5. **Projects** — editorial intro + the full-screen project reel
6. **Hackathons** — HackVerse 2026 and GreenOps Sustain AI
7. **Skills** — practical toolkit grouped by topic
8. **Education** — current and previous institutions
9. **Roadmap** — honest "still under development" list
10. **Contact** — email, socials, and portfolio footer

---

## Projects reel

`src/components/ProjectsGallery.tsx` contains the full-screen project experience. It opens from `RUN MY PROJECTS ↗`.

The reel occupies a fixed `100vw × 100vh` black stage (`#080808`) with four spatial zones:

- **Masthead** — edge-to-edge `WORK` wordmark + white information strip
- **Filmstrip + stage** — vertical preview reel with the active project centered
- **HUD** — hairline, active index, tech stack, project title stack, and domain
- **Footer** — portfolio contact, three-line project summary, navigation hint

### Controls

| Input | Action |
|---|---|
| Mouse wheel | Previous / next project |
| `↑` / `↓` or `PageUp` / `PageDown` | Previous / next project |
| Click a title in the HUD | Jump to that project |
| Touch swipe up / down | Previous / next project |
| Click the center image | Open the case study |
| `Escape` | Close case study, then close the reel |
| `← Return to Portfolio` | Close the reel |

The reel also:

- Locks body scroll while open and restores the exact scroll position afterwards
- Restores focus to the trigger button when closed
- Uses GSAP for reel and case-study transitions
- Supports `prefers-reduced-motion`

### Case study view

Each project opens a dark editorial case study containing:

- Full title, subtitle, domain, and index
- Problem and solution overview
- Key features
- Complete technology stack
- Real project screenshot(s)
- GitHub and live links where available
- `← BACK TO REEL` and `NEXT PROJECT →`

---

## Projects

All project visuals are stored locally in `public/projects/`. No stock imagery is used.

| # | Project | Domain | Asset | Links |
|---|---|---|---|---|
| 01 | Multi-Gas Sentinel | IoT & Industrial Safety | `multigas.png` | [GitHub](https://github.com/krizzh7/Multi-Gas-Detector) |
| 02 | Price Pilot | E-Commerce Intelligence | `pricepilot.png` | [GitHub](https://github.com/krizzh7/PricePilot) |
| 03 | Cine Pulse | Media Platform | `cinepulse.png` | [GitHub](https://github.com/krizzh7/MovieListWebApp) |
| 04 | The Blood Archive | Creative Fan Experience | `bloodarchive.png` | [GitHub](https://github.com/krizzh7/myfanpage-csm) · [Live](https://thebloodarchive.vercel.app/) |

The portfolio data includes four real projects, so the reel counter reads `01 / 04`. If you want a three-project version, remove the fourth object from `src/data/portfolio.ts`; every counter, title, and navigation state updates automatically.

---

## Data and assets

### Content

All editable content lives in:

```text
src/data/portfolio.ts
```

It contains:

- `profile` — name, institution, degree, status, email, social links
- `projects` — titles, descriptions, problem/solution, features, tags, links, assets
- `hackathons` — event, role, result, description, tags
- `toolkit` — grouped technical skills

### Images

```text
public/projects/
├── multigas.png
├── pricepilot.png
├── cinepulse.png
├── bloodarchive.png
└── profilepic.jpeg
```

`profilepic.jpeg` is used both in the flip-card About side and in the About portrait block.

---

## Project structure

```text
portfolio/
├── public/
│   └── projects/                 # project screenshots + portrait
├── src/
│   ├── App.tsx                   # shell, navigation, cursor, loading state
│   ├── main.tsx                  # React entry point
│   ├── styles.css                # global styles + responsive rules
│   ├── components/
│   │   ├── Atmosphere.tsx         # lazy Three.js hero atmosphere
│   │   ├── FlipIntro.tsx          # hero + scroll-driven flip card
│   │   ├── LoadingScreen.tsx      # boot screen
│   │   ├── ProjectsGallery.tsx    # full-screen project reel + case studies
│   │   └── Sections.tsx           # About, Projects intro, Hackathons, etc.
│   └── data/
│       └── portfolio.ts           # single source of truth for content
├── index.html
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

---

## Responsive behaviour

- **Desktop:** four-zone reel with a centered 34vw project frame
- **Tablet:** project frame widens to 42vw and the HUD shifts inward
- **Mobile (< 768px):**
  - masthead scales down
  - project frame becomes 78vw × 4:3
  - HUD stacks below the frame on a dark blurred panel
  - title list wraps horizontally
  - footer summary and touch hint stack
  - swipe gestures switch projects

---

## Accessibility notes

- The reel uses `role="dialog"` and `aria-modal`
- Project titles expose pressed state with `aria-pressed`
- The active project summary is announced with `aria-live`
- `Escape` closes the case study or the reel
- Focus moves into the reel on open and returns to the trigger on close
- Visible focus outlines are preserved for links and buttons
- Reduced-motion styles shorten transitions and disable decorative animation

---

## Verification

The current implementation has been checked with:

```bash
npm run build
npm run preview
```

Verified:

- TypeScript compilation passes
- Vite production build passes
- No browser console or page errors
- Project screenshots load in development and production preview
- Wheel, keyboard, click, and touch interactions work
- Case study open/close and next-project navigation work
- Body scroll lock and focus restoration work
- Desktop, tablet, and mobile layouts render without overlap

> Note: the Vite build reports an existing chunk-size warning for the Three.js/WebGL bundle. It does not block the build.

---

## Honesty notes

- GPA and coursework fields intentionally remain "to be revealed" / "yet to be updated" rather than inventing values.
- Project descriptions use the information already present in the project data and repositories.
- No performance, accuracy, or deployment metrics have been invented.
- The Blood Archive is an independent fan project and is not affiliated with the official rights holders.
- This is a personal portfolio. The code and written content are not offered under an open-source license unless one is added explicitly.

---

## Contact

**P. Krishaanth**  
Vellore Institute of Technology, Chennai  
Computer Science and Engineering (Core)

- Email: [krishaanth.partha@gmail.com](mailto:krishaanth.partha@gmail.com)
- GitHub: [github.com/krizzh7](https://github.com/krizzh7)
- LinkedIn: [linkedin.com/in/krishaanth-p-2438853a6](https://www.linkedin.com/in/krishaanth-p-2438853a6/)
- Devpost: [devpost.com/krizzh7](https://devpost.com/krizzh7)
