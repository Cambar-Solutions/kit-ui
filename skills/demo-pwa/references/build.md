# Build

## Stack
React + TypeScript + Vite + Tailwind v4 (`@tailwindcss/vite`), `react-router-dom` (lazy routes), `lucide-react` for icons, `vite-plugin-pwa` (Workbox) for the service worker. Add other libraries only if impeccable's direction needs them, and check their weight. No UI kit is required; if you want one, shadcn/ui is fine.

`scripts/scaffold.mjs` creates this tooling with no UI (see SKILL.md). Write the app yourself.

## Layout
```
docs/BRIEF.md  docs/DOMAIN.md (if no playbook)  PRODUCT.md  DESIGN.md
demo.config.json            roles, login steps, screens for verify
public/logo.svg|png         client logo or monogram
src/data/types.ts           entities and status unions with labels and allowed transitions
src/data/seed.ts            realistic seed data, dates relative to today
src/data/store.ts           mock store (localStorage), the only place that reads/writes data
src/pages/customer/*        customer screens (lazy)
src/pages/admin/*           admin screens (lazy)
src/components/*            shared UI
```

## Mock data layer
- One store module with functions per action (`listOrders`, `getOrder`, `approveQuote`, `setOrderStatus`, ...). Views call only these. Later a real API can replace the module without touching views.
- Persist to `localStorage` under one versioned key (`<slug>-demo-v1`). Seed on first load.
- Enforce the playbook rules inside the store (allowed transitions, stock cannot go below zero), and show a clear message when an action is not allowed.
- Simulate latency only lightly (100 to 300 ms) so loading states are visible but the demo stays fast.
- Dates in the seed are relative to today, so the demo never looks stale.

## Demo affordances
- Login screen with the business name and a role switch ("Soy cliente" / "Soy del taller"), with the demo account prefilled so the presenter only taps "Entrar". Say in small text that it is a demo access.
- A "Restablecer datos de demostración" action in the admin (and profile) that clears the key and reseeds, with confirmation.
- Sign out on both areas.
- The first customer screen must show something interesting right away (an order waiting for approval, an order ready). Seed data in every status.

## PWA
- `vite-plugin-pwa` with `registerType: "prompt"` and an update notice; `navigateFallback: "/index.html"`.
- Manifest from the brief: `name`, `short_name`, `lang`, `theme_color`, `background_color`, `start_url: "/"`, `display: "standalone"`.
- PNG icons 192, 512 and maskable 512, plus `apple-touch-icon` 180, generated from the logo (`npm run icons` from the scaffold uses `@vite-pwa/assets-generator`).
- Offline: the app opens and shows the last data (it is local anyway); show a small "Sin conexión" notice.
- For deeper PWA rules (iOS, safe areas, cache-first navigation) follow `offline-first-pwa` if installed.

## Technical rules
- Every route lazy-loaded. Budgets (gzip): initial JS 130 KB, initial CSS 25 KB, each lazy chunk 40 KB (`check-budget.mjs`).
- Fonts self-hosted: woff2 only, latin subset, `font-display: swap`. No CDN fonts (the demo must look the same on the client's iPhone and offline).
- Images: fixed dimensions or `aspect-ratio`, `loading="lazy"` below the fold, modern formats. Prefer the trade's real vocabulary over stock photos; if you need photos, leave clear placeholders rather than hand-drawn fake screenshots.
- Tap targets 44 px on phones (buttons, chips, tabs, links in lists). Inline links inside paragraphs are exempt.
- No horizontal scroll at 390 px. Long names wrap or are shortened by design, not cut mid-word with "..." in the main content.
- Native `<dialog>` or an accessible library for modals. Confirm destructive or irreversible actions naming the target.
- Every interactive element has an accessible name. Statuses have text.
- `prefers-reduced-motion` respected. Motion only to show what changed.
- Save files as UTF-8 without BOM. In PowerShell, if you must write a file, use `[IO.File]::WriteAllText(path, text, (New-Object Text.UTF8Encoding($false)))`.
- `package.json` scripts: `dev`, `build` (`tsc --noEmit && vite build`), `preview`, `icons`.
