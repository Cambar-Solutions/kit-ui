# kit-ui

Internal UI kit and app shell (React + Vite + Tailwind v4 + TanStack Router/Query + Zustand, PWA) and an agent skill that generates views with it. Built to be light for the end user: lazy routes, cached data, bounded caches, a bundle budget.

## Run

```bash
npm install
npm run dev           # demo: shell, profiles, dark mode, four view states
npm run verify        # tokens + types + production build + bundle budget
npm run preview       # test the service worker and offline in the production build
```

## Where things live

```
src/shell.config.ts       THE place to change structure (sidebar side, account, inspector, bottom bar)
src/brand.config.ts       per-client identity (name, initials, profile)
src/shell/                AppShell, InspectorSlot, Zustand store (only place that knows panel positions)
src/themes/               tokens (base.css), one block per profile (profiles.css), fonts (latin only)
src/components/ui/        Button, Field, Card, Skeleton, EmptyState
src/templates/            ListView (four states, selectable rows)
src/pages/                demo screens, lazy loaded per route
src/lib/query-client.ts   freshness windows (STALE) and cache defaults
src/pwa/                  update, offline-ready and offline notices
src/router.tsx            TanStack Router, lazy routes, link preloading on intent
scripts/                  check-tokens (no hard-coded colors), check-budget (bundle weight)
skills/kit-ui/            the agent skill (SKILL.md + references/)
```

## State, in one table

| State | Tool |
|---|---|
| Position, filters, selected item | URL (TanStack Router search params) |
| Server data | TanStack Query (`STALE` windows, local filtering) |
| Shared UI state (sidebar, inspector, theme mode) | Zustand |
| Local and short-lived | `useState` |

## Profiles

`saas-app`, `backoffice`, `ecommerce`, `local-business`, `fintech`, `health`, `education`, `marketing`.
Each has a theme block in `profiles.css` and a rules file in `skills/kit-ui/references/profiles/`.

## Change the structure

Edit `src/shell.config.ts` (pick a preset, override keys). Vocabulary and procedure: `skills/kit-ui/references/shell.md`.

## Caching and performance

Rules, strategy table, backend headers and targets: `skills/kit-ui/references/performance.md`.

## Install the skill in a project

Copy `skills/kit-ui` to `<project>/.kiro/skills/kit-ui` (or the equivalent folder of your harness).
It references `taste-skill`, `impeccable` and `redesign-skill` by name only. It works without them.

## Known gaps

- `npm audit` reports 4 moderate issues in `glob` and `minimatch`, pulled by `workbox-build` (build time only, not shipped to users). Revisit when the PWA plugin updates.
- Manifest icon is an SVG placeholder. Real installs need 192 and 512 PNG icons per client.
- Not yet checked in a browser: layout at each breakpoint, service worker update flow, offline behavior, Lighthouse.
