# CLAUDE.md — comms-impact-tracker

AI assistant guide for the **Mercedes-Benz HPC Communications Impact Tracker** project.

---

## Project Overview

A React + Vite single-page application (SPA) for tracking PR and communications performance metrics. There is no backend — all data persists in browser **localStorage**. The app calculates weighted impact scores for media coverage, manages campaigns, and visualizes network utilization trends.

**Business Context**: Tracks communications effectiveness for Mercedes-Benz High-Power Charging (HPC) network, with a primary business objective of 105 kWh/port/day network utilization by 2026.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.2.0 |
| Build tool | Vite 5.1.0 |
| Styling | Tailwind CSS (utility-first) |
| Icons | lucide-react ^0.383.0 |
| Language | JavaScript (JSX) — no TypeScript |
| Storage | Browser localStorage |
| Linting | ESLint 8 with react + react-hooks plugins |
| Testing | None configured |

---

## Repository Structure

```
comms-impact-tracker/
├── index.html                  # HTML shell, mounts #root
├── vite.config.js              # Vite config: React plugin, port 3000, auto-open
├── package.json                # Dependencies and npm scripts
├── .eslintrc.cjs               # ESLint configuration
├── src/
│   ├── main.jsx                # ReactDOM.createRoot() entry point
│   ├── App.jsx                 # Root component — tab routing, global state
│   ├── styles/
│   │   └── index.css           # Tailwind imports + custom CSS (~320 lines)
│   ├── components/
│   │   ├── TopLevelScores.jsx          # KPI metrics cards
│   │   ├── NetworkUtilizationChart.jsx # Weekly utilization chart
│   │   ├── PROverview.jsx              # PR statistics overview
│   │   ├── CampaignResults.jsx         # Campaign performance tracking
│   │   ├── CoverageLibrary.jsx         # Searchable/filterable coverage list
│   │   ├── AddCoverageModal.jsx        # Add / edit a coverage item
│   │   ├── AddCampaignModal.jsx        # Create a campaign
│   │   ├── AddNetworkDataModal.jsx     # Log weekly utilization data
│   │   └── SettingsModal.jsx           # Customize publication tier multipliers
│   ├── config/
│   │   └── defaultConfig.js            # Key messages, audiences, media types, tiers
│   └── utils/
│       ├── storage.js                  # localStorage read/write wrapper
│       ├── calculations.js             # Impact score calculation engine
│       └── exportCSV.js                # CSV export utility
```

---

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:3000 (auto-opens browser)
npm run build      # Production build (outputs to dist/)
npm run preview    # Serve production build locally
npm run lint       # ESLint check on src/**/*.{js,jsx}
```

---

## Data Storage

All persistence is via browser localStorage. No server calls are made.

| Key | Contents |
|---|---|
| `comms-config` | App configuration and settings |
| `comms-coverage` | All coverage items |
| `comms-campaigns` | Campaign records |
| `network-utilization` | Weekly kWh/port/day entries |
| `llm-queries` | LLM visibility tracking data |

`src/utils/storage.js` provides a thin abstraction — always use it rather than accessing `localStorage` directly.

---

## Core Data Models

### Coverage Item
```js
{
  id,            // Unique identifier
  date,          // Publication date (ISO string)
  title,         // Article/piece title
  publication,   // Outlet name
  reach,         // Estimated impressions (number)
  sentiment,     // "Positive" | "Neutral" | "Negative"
  keyMessages,   // Array of matched key message IDs
  targetAudience,// "Consumer" | "Business/Trade"
  mediaType,     // "Online News" | "Print News" | "Newsletter" | "Influencer" | "Podcast" | "Broadcast" | "Social Media"
  publicationTier,// Tier string matching config
  placementType, // "Proactive" | "Reactive" | "Organic"
  executiveVisibility, // "None" | "Quote" | "Interview" | "Speaking"
  llmVisibility, // Boolean — appeared in LLM response
  campaignId,    // Optional campaign association
  impactScore,   // Calculated 0–100 score
}
```

### Campaign
```js
{
  id,
  name,
  startDate,
  endDate,
  goal,
  targetAudience,
  keyMessages,   // Array of key message IDs
}
```

### Network Data Entry
```js
{
  weekEnding,    // ISO date string
  utilization,   // kWh/port/day (number)
}
```

---

## Impact Score Algorithm

Scores are 0–100, calculated in `src/utils/calculations.js`.

### Base Components (sum before multipliers)

| Component | Max Points | Logic |
|---|---|---|
| Reach | 25 | Scaled by impressions |
| Message Inclusion | 25 | Proportion of key messages matched |
| Audience Alignment | 20 | Consumer audience weighted 2× |
| Sentiment | 15 | Positive=15, Neutral=7, Negative=0 |
| LLM Visibility | 15 | Boolean flag |

### Multipliers (applied to base sum)

| Factor | Values |
|---|---|
| Publication Tier | 0.8× (Blog/Influencer) → 2.0× (National Business) |
| Placement Type | Organic=0.9×, Reactive=1.0×, Proactive=1.2× |
| Executive Visibility | None=1.0×, Quote=1.2×, Speaking=1.4×, Interview=1.5× |

Tier multipliers are user-configurable via Settings modal (stored in `comms-config`).

---

## Business Domain: Key Messages

Defined in `src/config/defaultConfig.js`. These are the 6 tracked HPC key messages:

1. Fast EV charging network
2. Open to all
3. Reliable charging network
4. Desirable amenity offering
5. Leader in EV charging tech
6. Customer centric (Mercedes-Benz)

**Target audiences**: Consumer (weighted 2× in scoring), Business/Trade
**Network utilization target**: 105 kWh/port/day by end of 2026

---

## Coding Conventions

### File Naming
- React components: `PascalCase.jsx` (e.g., `TopLevelScores.jsx`)
- Utilities/helpers: `camelCase.js` (e.g., `exportCSV.js`)
- Modal components: `Add<Entity>Modal.jsx` pattern

### React Patterns
- Functional components only — no class components
- `useState` for local state; no Redux, no Context API
- Prop drilling is acceptable given the app's scope
- Inline event handlers and callbacks are standard

### Styling
- Tailwind CSS utility classes are the primary styling mechanism
- Custom CSS lives in `src/styles/index.css`
- kebab-case for any custom CSS class names

### Icons
- Use `lucide-react` exclusively for SVG icons
- Import individual named icons: `import { Icon } from 'lucide-react'`

### Constants
- UPPER_CASE for constants (e.g., `STORAGE_KEYS`)
- Enumerations and config live in `src/config/defaultConfig.js`

---

## ESLint Configuration

Linting targets `.js` and `.jsx` files in `src/`. Key rules via plugins:
- `eslint-plugin-react` — React-specific rules
- `eslint-plugin-react-hooks` — enforces Rules of Hooks

Run `npm run lint` before committing. Fix all warnings and errors.

---

## What Doesn't Exist (Don't Add Without Discussion)

- **No TypeScript** — the project is plain JavaScript/JSX
- **No backend / API** — client-side only; do not introduce a server
- **No testing framework** — no Jest, Vitest, React Testing Library, etc.
- **No state management library** — no Redux, Zustand, Jotai, etc.
- **No routing library** — tab-based navigation is handled manually in `App.jsx`
- **No environment variables** — no `.env` files needed
- **No CI/CD** — no GitHub Actions or pipelines configured

---

## Common Tasks

### Adding a New Component
1. Create `src/components/MyComponent.jsx` using a functional component
2. Import and use it in `App.jsx` or the relevant parent component
3. Use Tailwind classes for styling; add custom CSS to `index.css` only if necessary
4. Use `lucide-react` for any icons

### Adding a New Stored Data Type
1. Add a new key constant to `src/utils/storage.js`
2. Add getter/setter functions in the storage utility
3. Document the shape in this file under "Core Data Models"

### Modifying the Impact Score
Edit `src/utils/calculations.js`. Ensure the score still normalizes to 0–100. Document changes to weights or multipliers here and in the README.

### Exporting Data
CSV export logic lives in `src/utils/exportCSV.js`. Extend it there rather than adding export logic in components.

---

## Git Workflow

- Primary development branch: `claude/claude-md-mmkrpz8ai074af11-TV9YS`
- Default branch: `master`
- Write clear, descriptive commit messages
- Push with: `git push -u origin <branch-name>`
