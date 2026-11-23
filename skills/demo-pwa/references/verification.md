# Verification

## Setup (once per project)
```
npm i -D playwright-core
```
A local Chrome, Edge or Chromium is required (found automatically; override with `DEMO_BROWSER=<path>`). No browser download is needed.

## `demo.config.json`
```json
{
  "previewPort": 4199,
  "locale": "es-MX",
  "viewports": { "movil": [390, 844], "escritorio": [1280, 800] },
  "ignoreConsole": ["service ?worker"],
  "budget": { "initialJsKb": 130, "initialCssKb": 25, "lazyChunkKb": 40 },
  "roles": [
    {
      "name": "cliente",
      "login": [
        { "goto": "/" },
        { "evaluate": "localStorage.clear()" },
        { "goto": "/" },
        { "click": "role=tab[name='Soy cliente']" },
        { "click": "role=button[name=/^Entrar/]" }
      ],
      "expectPath": "/app",
      "screens": [
        { "name": "inicio", "path": "/app" },
        { "name": "detalle-por-aprobar", "path": "/app/servicios/o2481", "expect": "text=Aprobar" },
        { "name": "aprobar", "path": "/app/servicios/o2481", "steps": [{ "click": "role=button[name=/Aprobar/]" }, { "wait": 300 }] }
      ]
    }
  ]
}
```

- `login`: steps run once per role and viewport, through the real UI. Clear storage first so every run starts from the seed.
- `expectPath`: login fails if the URL does not start with it.
- `screens`: each has a `path` (optional), optional `steps`, and an optional `expect` selector that must appear.
- Step types: `goto`, `click`, `fill` + `value`, `select` + `value`, `waitFor`, `wait` (ms), `evaluate` (JS string).
- Selectors are Playwright selectors: prefer `role=button[name='...']`, `role=tab[...]`, `text=...`, `label=...`. Check the real roles in the code (a segmented control may be `role=tab`, not `button`).
- Include at least: every tab of both areas, one detail screen per entity, and the main action of each flow (approve a quote, reserve a product, change a status).

## What `verify.mjs` checks
| Check | Result |
|---|---|
| Files are UTF-8 without BOM, no mojibake in source | FAIL |
| `npm run build` | FAIL |
| Bundle budget | FAIL |
| Login works for each role | FAIL |
| Console errors, page errors, HTTP 4xx/5xx from the app | FAIL |
| Horizontal overflow | FAIL |
| Broken accents in the rendered page | FAIL |
| Buttons or links without an accessible name | FAIL |
| Tap targets under 24 px on phones | FAIL |
| Tap targets 24 to 43 px on phones | WARN |
| Text cut with ellipsis or line clamp | WARN |
| Images without `alt` | WARN |

Output: `.demo-check/report.md`, `.demo-check/report.json`, `.demo-check/shots/*.png` (full page). Add `.demo-check/` to `.gitignore`.

## After the script passes: look
Open the phone and desktop screenshots of the first screen of each role, the main detail screens and the main action results. Check what the script cannot:
- Does it look like the trade, or like any app? Is the memorable element visible on the first screen?
- Overlaps (sticky bars covering content, badges over text), awkward wraps, empty areas, misaligned columns.
- Copy that sounds generated, wrong currency or tax, English leftovers, invented brand names.
- Warnings that matter in a demo: truncated customer names or amounts are not acceptable on the first screens; truncation in long admin lists is acceptable.

Fix all of it in one batch, run `verify.mjs` again, and stop.
