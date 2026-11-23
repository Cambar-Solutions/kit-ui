#!/usr/bin/env node
// Fails when the production build is heavier than the budget. Run after `npm run build`.
// Initial = files index.html loads before the first screen. Lazy = route chunks loaded on demand.
// Budgets can be overridden in demo.config.json: { "budget": { "initialJsKb": 130, "initialCssKb": 25, "lazyChunkKb": 40 } }
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const KB = 1024;
const cfg = existsSync("demo.config.json") ? JSON.parse(readFileSync("demo.config.json", "utf8")).budget ?? {} : {};
const BUDGET = {
  initialJs: (cfg.initialJsKb ?? 130) * KB,
  initialCss: (cfg.initialCssKb ?? 25) * KB,
  lazyChunk: (cfg.lazyChunkKb ?? 40) * KB,
};

const dist = "dist";
if (!existsSync(join(dist, "index.html"))) {
  console.error("check-budget: dist/index.html not found. Run the build first.");
  process.exit(1);
}
const html = readFileSync(join(dist, "index.html"), "utf8");
const initial = new Set([...html.matchAll(/(?:src|href)="\/?(assets\/[^"]+)"/g)].map((m) => m[1]));
const gz = (file) => gzipSync(readFileSync(join(dist, file))).length;
const fmt = (n) => `${(n / KB).toFixed(1)} KB`;

const sum = (ext) => [...initial].filter((f) => f.endsWith(ext)).reduce((s, f) => s + gz(f), 0);
const initialJs = sum(".js");
const initialCss = sum(".css");
const assets = existsSync(join(dist, "assets")) ? readdirSync(join(dist, "assets")) : [];
const lazy = assets
  .filter((f) => f.endsWith(".js") && !initial.has(`assets/${f}`))
  .map((f) => ({ f, size: gz(`assets/${f}`) }))
  .sort((a, b) => b.size - a.size);
const fonts = assets.filter((f) => /\.(woff2?|ttf|otf)$/.test(f));
const fontBytes = fonts.reduce((s, f) => s + statSync(join(dist, "assets", f)).size, 0);

let failed = false;
const check = (label, size, max) => {
  const ok = size <= max;
  if (!ok) failed = true;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}: ${fmt(size)} (max ${fmt(max)})`);
};
check("Initial JS (gzip)", initialJs, BUDGET.initialJs);
check("Initial CSS (gzip)", initialCss, BUDGET.initialCss);
const big = lazy.filter((c) => c.size > BUDGET.lazyChunk);
for (const c of big) check(`Lazy chunk ${c.f}`, c.size, BUDGET.lazyChunk);
console.log(`INFO ${lazy.length} lazy chunk(s), largest ${lazy[0] ? fmt(lazy[0].size) : "0 KB"}`);
console.log(`INFO ${fonts.length} font file(s), ${fmt(fontBytes)}${fonts.some((f) => !f.endsWith(".woff2")) ? " (non-woff2 present: drop them)" : ""}`);

if (failed) {
  console.error("\nOver budget. Lazy-load the route or heavy library, drop a dependency, or subset fonts.");
  process.exit(1);
}
console.log("check-budget OK");
