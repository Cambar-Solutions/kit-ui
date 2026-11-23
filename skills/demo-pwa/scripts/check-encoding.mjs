#!/usr/bin/env node
// Fails on files that would show broken Spanish in a demo:
//   - not valid UTF-8
//   - UTF-8 BOM (PowerShell's Set-Content/Out-File add one; it breaks package.json and JSON imports)
//   - mojibake already baked into the source ("Ã“rdenes", "dÃ­as", "â€”", "�")
// Usage (from the project root): node <skill>/scripts/check-encoding.mjs
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOTS = ["src", "public", "index.html", "package.json", "vite.config.ts", "vite.config.js", "docs"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".html", ".json", ".md", ".webmanifest", ".svg", ".txt"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".demo-check"]);
const MOJIBAKE = /Ã[\u0080-\u00BF\u0152-\u0178\u2013-\u203A]|Â[\u00A0-\u00BF]|â€|\uFFFD/;

const decoder = new TextDecoder("utf-8", { fatal: true });
const problems = [];

function* walk(path) {
  const s = statSync(path);
  if (s.isFile()) return yield path;
  for (const name of readdirSync(path)) {
    if (SKIP_DIRS.has(name)) continue;
    yield* walk(join(path, name));
  }
}

for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    if (!EXT.has(extname(file))) continue;
    const bytes = readFileSync(file);
    const rel = relative(process.cwd(), file);
    if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) problems.push(`${rel}: UTF-8 BOM (save without BOM)`);
    let text;
    try {
      text = decoder.decode(bytes);
    } catch {
      problems.push(`${rel}: not valid UTF-8 (re-save as UTF-8)`);
      continue;
    }
    text.split(/\r?\n/).forEach((line, i) => {
      const m = line.match(MOJIBAKE);
      if (m) problems.push(`${rel}:${i + 1}: mojibake "${line.trim().slice(Math.max(0, (m.index ?? 0) - 12), (m.index ?? 0) + 18)}"`);
    });
  }
}

if (problems.length) {
  console.error(problems.slice(0, 40).join("\n"));
  if (problems.length > 40) console.error(`...and ${problems.length - 40} more`);
  console.error(`\ncheck-encoding: ${problems.length} problem(s). Write files with an editor/tool that saves UTF-8 without BOM.`);
  process.exit(1);
}
console.log("check-encoding OK");
