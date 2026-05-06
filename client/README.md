# TFT Dualytics — Client

React + Vite frontend for **TFT Dualytics**, a stats site for Teamfight Tactics **Double Up**. The client renders top comps, summoner match history, leaderboards, and a drag-and-drop comp builder powered by data aggregated from the Riot API.

The Express + MongoDB backend lives in [../server/](../server/). Run both together from the repo root with `npm run dev`.

## Stack

- **React 19** with **Vite 8** (HMR, fast builds)
- **React Router 7** for routing
- **TanStack Query** for server state and caching
- **Zustand** for local UI state
- **@dnd-kit** for the comp builder drag-and-drop board
- **Recharts** for LP graphs and stat visualizations
- **react-i18next** for i18n
- **Axios** for API calls
- **CSS Modules** for component styling

## Getting started

From this directory:

```bash
npm install
npm run dev        # start Vite dev server
npm run build      # production build
npm run preview    # preview the production build
npm run lint       # ESLint
npm run lint:a11y  # ESLint with JSX a11y rules
```

To run the client and server together, use `npm run dev` from the repo root.

## Project layout

```
src/
  api/         Axios clients and Riot/data-dragon helpers
  components/  Reusable UI (CompRow, MatchTable, TFTBoard, ...)
  constants/   Set numbers, regions, asset paths
  contexts/    React context providers
  data/        Static datasets / fixtures
  hooks/       Custom hooks (queries, debounce, etc.)
  i18n/        Locale resources and i18next config
  pages/       Route-level pages (Landing, Stats, MatchHistory, CompBuilder, Leaderboard, ...)
  store/       Zustand stores
  styles/      Global styles and design tokens
  utils/       Pure helpers (comp aggregation, formatters)
```

Key pages:

- **LandingPage** — entry point with summoner search
- **StatsPage** / **CompPage** — aggregated top comps and per-comp breakdowns
- **MatchHistoryPage** — single- or two-summoner match history lookup
- **CompBuilderPage** — drag-and-drop hex board with unit roster and item picker
- **LeaderboardPage** — top Double Up players

## Conventions

- Use `async/await`; avoid raw promise chains.
- Keep React component files under ~200 lines — extract sub-components early.
- Filter all Data Dragon responses to the current set (`set === CURRENT_SET`).
- Never expose `RIOT_API_KEY` to client code, logs, or error payloads — it lives only in the server.
- Run `npm run lint:a11y` before opening PRs that touch UI. The audit checklist is in [../ACCESSIBILITY_AUDIT.md](../ACCESSIBILITY_AUDIT.md).

## Related docs

- [../CLAUDE.md](../CLAUDE.md) — project overview and workflow rules
- [../DESIGN.md](../DESIGN.md) — design system
- [../ACCESSIBILITY_AUDIT.md](../ACCESSIBILITY_AUDIT.md) — a11y checklist
