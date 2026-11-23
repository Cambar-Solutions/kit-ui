# demo-pwa

Agent skill that builds a sales-ready demo PWA for a business client from one short brief, for example:

> crea una demo para un taller de motos

The agent asks up to 7 quick questions (name, logo, color, key flows, roles, region), picks the trade playbook, designs with the **impeccable** skill, builds a phone-first customer area and a desktop admin with realistic Mexican sample data and demo logins, then verifies it in a real browser with screenshots.

Web only (React, Vite, Tailwind v4, react-router, vite-plugin-pwa). Mock data in the browser, no backend.

## Install

Copy this folder to your harness's skills folder, for example `~/.kiro/skills/demo-pwa` or `.claude/skills/demo-pwa`.

Recommended companion skills (referenced by name, not bundled; install them separately):
- `impeccable`: design direction, critique and polish (primary).
- `frontend-design`: fallback design direction.
- `offline-first-pwa`, `pwa-review`: deeper PWA rules and audit.

## Contents

```
SKILL.md                       workflow and hard rules
references/intake.md           the one-message intake
references/domains/            trade playbooks: taller-mecanico, comercio-alimentos, consultorio, _template
references/build.md            stack, mock data layer, demo affordances, PWA, technical rules
references/design-floor.md     minimum design rules when impeccable is not installed
references/verification.md     demo.config.json format and what verify checks
references/handoff.md          what to report, demo script for the meeting
references/publish.md          publishing a link (Cloudflare Pages, Netlify, Vercel)
scripts/scaffold.mjs           empty tooling for a new demo (no UI)
scripts/verify.mjs             encoding, build, budget, browser smoke test
scripts/smoke.mjs              logs in per role, screenshots, overflow, accents, tap targets, errors
scripts/check-encoding.mjs     UTF-8 without BOM, no mojibake
scripts/check-budget.mjs       bundle budget
```

## Requirements

Node 18 or newer. A local Chrome, Edge or Chromium for verification (`DEMO_BROWSER` to override). `playwright-core` in the project (`scaffold.mjs` installs it).

## Add a trade

Copy `references/domains/_template.md`, fill it, and add its trigger words to the `description` in `SKILL.md`.
