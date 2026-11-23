---
name: demo-pwa
description: Builds a sales-ready demo PWA for a business client from a short brief ("crea una demo para un taller de motos", "demo para una cremería", "app para una clínica dental"). Use when the user wants a demo, prototype or pitch app to show a prospect, or wants to change or polish one made with this skill. Runs a short intake, uses the impeccable skill for design, builds a phone-first customer area and a desktop admin with realistic local sample data and demo logins, then verifies it in a real browser with screenshots. Web only (React + Vite + Tailwind), mock data, no backend.
---

# demo-pwa

Goal: a demo a business owner looks at for five minutes and believes is their product. It must look made for their trade, work on their phone, and never break while you show it. It is not production software: data is mock, there is no backend. Say so in the handoff.

Work through the phases in order. Do not skip the intake or the verification.

## Phase 1. Intake (one message, then build)

Read [references/intake.md](references/intake.md). Send **one** message with 5 to 7 numbered questions, each with a proposed default, and tell the user they can reply "ok". Ask about: business name and logo, brand color (or "propose one"), the 3 to 5 things the client must see working, roles, city or region, and anything to avoid.

Exceptions:
- If the user already answered most of it, ask only what is missing, or nothing.
- If the user said "no preguntes" or is not available, use the defaults and list them as assumptions.

Write the answers to `docs/BRIEF.md` in the project.

## Phase 2. Domain

Find the playbook in [references/domains/](references/domains/) that matches the business. It gives roles, entities, statuses with **allowed transitions**, screens per role, flows and what realistic seed data looks like. If none matches, write one from `_template.md` first (inside the project, `docs/DOMAIN.md`), then continue. Business rules from the playbook are not optional: an order must not jump from "received" to "delivered".

## Phase 3. Design with impeccable

If the `impeccable` skill is installed, it owns the visual design. Load it and follow its setup and routing:

1. Run its context launcher, then `init` to write `PRODUCT.md`. Feed it `docs/BRIEF.md` and the domain; answer its questions from the brief instead of asking the user again.
2. Follow its new-work flow for the visual world, in **Operate** mode for app screens (Persuade only for a public landing page, if any).
3. Read its craft floor before writing UI.
4. Keep its outputs (`PRODUCT.md`, `DESIGN.md`) in the project.

The concept should come from the trade itself (a service ticket, an exploded parts view, a recipe card, a dental chart), with one memorable element and everything else quiet.

If `impeccable` is not installed, use `frontend-design` if available. If neither is, follow [references/design-floor.md](references/design-floor.md) and tell the user the result will be plainer.

Do not copy rules from those skills into the project. Reference them.

## Phase 4. Build

Read [references/build.md](references/build.md) before writing code. It defines the stack, file layout, the mock data layer, demo login, reset button, PWA setup and the technical rules (lazy routes, budgets, UTF-8 without BOM, self-hosted fonts, tap targets). Optional: `node <skill-dir>/scripts/scaffold.mjs <dir> --name "<Name>"` creates the empty tooling (Vite, Tailwind, router, PWA plugin, icon script, checks) so you only write the app.

Build in vertical slices: login, customer home, the main customer flow, admin dashboard, admin list and detail, the rest. Every data screen has loading, empty, error and ready states.

### kit-ui components

When the user names a kit-ui component ("usa el Button de kit-ui", "con el TableView de kit-ui"), or asks to build with kit-ui, install it instead of writing it:

1. If the project has no `components.json`, run `npx shadcn@latest init -b radix -y` (existing project) first.
2. Map the design tokens from `DESIGN.md` to the shadcn variables in the project CSS (`--primary`, `--primary-foreground`, `--card`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--destructive`, `--radius`) so the components follow the client's design.
3. `npx shadcn@latest add Cambar-Solutions/kit-ui/<item>` (several items in one command are fine). Items: `button`, `field`, `field-select`, `field-textarea`, `card`, `skeleton`, `empty-state`, `badge`, `chips`, `alert`, `stat`, `timeline`, `confirm-dialog`, `list-view`, `table-view`, `all`. `kit-tokens` comes with them.
4. Import from `@/components/kit/<file>` (`field-select` is `select.tsx`, `field-textarea` is `textarea.tsx`). Props and examples: `npx shadcn@latest view Cambar-Solutions/kit-ui/<item>` or `docs/components.md` in the repo.
5. Never edit colors inside `components/kit/`; change the theme variables instead. If a component lacks something the demo needs, wrap or extend it in `components/` and say so.

If the user did not mention kit-ui, using it is optional: prefer it for forms, tables, status badges, timelines and confirmations when it saves time, and keep impeccable's design in charge.

## Phase 5. Verify (mandatory)

Read [references/verification.md](references/verification.md). Write `demo.config.json` (roles, login steps, screens), then run:

```
node <skill-dir>/scripts/verify.mjs
```

It checks encoding, builds, checks the bundle budget, then logs in as each role in a real browser at phone and desktop sizes and fails on console errors, broken accents, horizontal overflow, unnamed buttons and tiny tap targets. Then **open the screenshots in `.demo-check/shots/` and look at them**: the script cannot judge taste, overlap or awkward wrapping. Fix everything in one batch and run verify once more. Then, if `impeccable` is installed, run its `critique` on the three screens the client will see first and apply `polish`. Stop after that: do not loop.

## Phase 6. Handoff

Follow [references/handoff.md](references/handoff.md): how to open it (local URL, and how to publish a link with [references/publish.md](references/publish.md) if the user wants one), demo accounts, a 5-step demo script for the meeting, what is mocked, and what is not built. Under 25 lines.

## Hard rules

- UI copy in the client's language and locale (default `es-MX`): plain, concrete, a verb on every button. Money with `Intl.NumberFormat` and the right currency (MXN by default, with IVA where the trade shows it).
- Realistic local sample data: local names, places, phone formats, real product and model names for the trade, prices that make sense, dates relative to today. Never "Lorem ipsum", "John Doe", "Acme", "Test 1".
- The client's name and logo appear in the app, the manifest and the browser tab. No invented brand when the user gave one.
- Phone first for customers. No horizontal scroll at 390 px. Tap targets 44 px or more on phones.
- Statuses always have a text label, never color alone. Transitions follow the domain playbook.
- Every file saved as UTF-8 without BOM. On Windows never write source files with PowerShell `Set-Content`/`Out-File`; use the editor/file tool.
- No backend, no real payments, no real messages. Anything that would need one is shown honestly as a mock or listed as "not built".
- Never leave a dev or preview server running after you finish unless the user asked to keep it open; report its PID if you do.

## Related skills (referenced, not bundled)

| Skill | Role here |
|---|---|
| `impeccable` | Design direction, Operate mode, craft floor, critique, polish. Primary. |
| `frontend-design` | Fallback design direction if impeccable is missing. |
| `offline-first-pwa` | Deeper PWA rules (iOS, safe areas, update flow) when the demo must be installed on a phone. |
| `pwa-review` | Optional PWA audit before handing off a demo that will be installed. |
| kit-ui components | Installable with `npx shadcn@latest add Cambar-Solutions/kit-ui/<item>` (see "kit-ui components" above). |

Use them only if installed. This skill works alone with its own references.
