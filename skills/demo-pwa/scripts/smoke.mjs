#!/usr/bin/env node
// Browser smoke test for a demo. Builds nothing: run it after `npm run build`.
// Starts `vite preview` itself, logs in as each role through the real UI, opens every screen at
// phone and desktop sizes, takes screenshots and checks what makes a demo look broken.
//
// Usage (from the project root): node <skill>/scripts/smoke.mjs [--config demo.config.json] [--url http://...]
//   --url  test an already running server instead of starting vite preview
// Needs playwright-core (npm i -D playwright-core) and an installed Chrome/Edge/Chromium.
// Env: DEMO_BROWSER=<path to browser>, DEMO_PLAYWRIGHT_DIR=<folder whose node_modules has playwright-core>
//
// FAIL (exit 1): login failed, missing expected element, console/page errors, HTTP >= 400,
//   horizontal overflow, mojibake, unnamed buttons/links, tap targets under 24px on phones.
// WARN: text cut with ellipsis/line-clamp, tap targets under 44px on phones, images without alt.
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const cwd = process.cwd();
const argv = process.argv.slice(2);
const opt = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const die = (msg) => {
  console.error(`smoke: ${msg}`);
  process.exit(1);
};

const configPath = resolve(cwd, opt("--config") ?? "demo.config.json");
if (!existsSync(configPath)) die(`config not found: ${configPath}. See references/verification.md for the format.`);
const config = JSON.parse(readFileSync(configPath, "utf8"));
if (!Array.isArray(config.roles) || config.roles.length === 0) die("config.roles is empty");

function loadPlaywright() {
  for (const base of [cwd, process.env.DEMO_PLAYWRIGHT_DIR].filter(Boolean)) {
    try {
      return createRequire(join(resolve(base), "package.json"))("playwright-core");
    } catch {
      /* try next */
    }
  }
  die("playwright-core not found. Run: npm i -D playwright-core");
}

function findBrowser() {
  if (process.env.DEMO_BROWSER) return process.env.DEMO_BROWSER;
  const env = process.env;
  const list =
    process.platform === "win32"
      ? [
          `${env["ProgramFiles(x86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
          `${env.ProgramFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
          `${env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
          `${env["ProgramFiles(x86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
          `${env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        ]
      : process.platform === "darwin"
        ? [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return list.find((p) => p && existsSync(p)) ?? die("no Chrome/Edge/Chromium found. Set DEMO_BROWSER.");
}

/* ---------- server ---------- */
let server;
const port = config.previewPort ?? 4199;
const base = (opt("--url") ?? `http://127.0.0.1:${port}`).replace(/\/$/, "");

function stopServer() {
  if (!server?.pid) return;
  if (process.platform === "win32") spawnSync(`taskkill /PID ${server.pid} /T /F`, { shell: true, stdio: "ignore" });
  else {
    try {
      process.kill(-server.pid);
    } catch {
      /* already gone */
    }
  }
  server = undefined;
}
process.on("exit", stopServer);
process.on("SIGINT", () => process.exit(130));

async function waitForServer(ms = 40000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      const r = await fetch(base, { redirect: "manual" });
      if (r.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  die(`server did not answer at ${base}`);
}

/* ---------- in-page checks (runs in the browser) ---------- */
function inspect(mobile) {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) !== 0;
  };
  const clean = (t) => (t ?? "").trim().replace(/\s+/g, " ");
  const label = (el) =>
    clean(el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("placeholder") || el.tagName).slice(0, 50);
  const out = { overflowX: 0, mojibake: [], truncated: [], tiny: [], small: [], unnamed: [], imgNoAlt: 0 };

  out.overflowX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);

  const text = document.body.innerText;
  const moji = /Ã[\u0080-\u00BF\u0152-\u0178\u2013-\u203A]|Â[\u00A0-\u00BF]|â€|\uFFFD/g;
  for (const m of text.matchAll(moji)) {
    out.mojibake.push(clean(text.slice(Math.max(0, m.index - 15), m.index + 15)));
    if (out.mojibake.length >= 5) break;
  }

  for (const el of document.querySelectorAll("body *")) {
    if (!(el instanceof HTMLElement) || !vis(el) || !clean(el.innerText)) continue;
    const s = getComputedStyle(el);
    const cutX = s.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1;
    const clamp = s.webkitLineClamp && s.webkitLineClamp !== "none" && el.scrollHeight > el.clientHeight + 1;
    if (cutX || clamp) out.truncated.push(clean(el.innerText).slice(0, 50));
  }

  const sel = "a[href], button, [role=button], [role=tab], [role=link], input:not([type=hidden]), select, textarea, summary";
  for (const el of document.querySelectorAll(sel)) {
    if (!vis(el)) continue;
    const isAction = el.matches("a, button, [role=button], [role=tab], [role=link], summary");
    const named =
      clean(el.innerText) ||
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      el.getAttribute("title") ||
      el.querySelector("img[alt]:not([alt=''])") ||
      el.querySelector("svg title") ||
      (el.labels && el.labels.length > 0) ||
      el.getAttribute("placeholder");
    if (isAction && !named) out.unnamed.push(el.outerHTML.slice(0, 90));

    if (!mobile) continue;
    // Inline links inside running text are exempt from target size.
    if (el.matches("a") && getComputedStyle(el).display === "inline") {
      const block = el.closest("p, li, td, dd");
      if (block && clean(block.innerText).length > clean(el.innerText).length + 15) continue;
    }
    let target = el;
    if (el.matches("input[type=checkbox], input[type=radio]")) target = el.closest("label") ?? el;
    const r = target.getBoundingClientRect();
    const min = Math.min(r.width, r.height);
    const desc = `${label(el)} (${Math.round(r.width)}x${Math.round(r.height)})`;
    if (min < 24) out.tiny.push(desc);
    else if (min < 44) out.small.push(desc);
  }
  out.imgNoAlt = [...document.images].filter((i) => !i.hasAttribute("alt") && vis(i)).length;
  for (const k of ["mojibake", "truncated", "tiny", "small", "unnamed"]) out[k] = [...new Set(out[k])].slice(0, 8);
  return out;
}

/* ---------- steps ---------- */
async function runSteps(page, steps = []) {
  for (const s of steps) {
    if (s.goto !== undefined) await page.goto(base + s.goto, { waitUntil: "domcontentloaded" });
    else if (s.click) await page.locator(s.click).first().click({ timeout: 10000 });
    else if (s.fill) await page.locator(s.fill).first().fill(String(s.value ?? ""), { timeout: 10000 });
    else if (s.select) await page.locator(s.select).first().selectOption(String(s.value ?? ""), { timeout: 10000 });
    else if (s.waitFor) await page.locator(s.waitFor).first().waitFor({ timeout: 10000 });
    else if (s.wait) await page.waitForTimeout(s.wait);
    else if (s.evaluate) await page.evaluate(s.evaluate);
    else throw new Error(`unknown step ${JSON.stringify(s)}`);
  }
}

const settle = async (page) => {
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(config.settleMs ?? 500);
};

/* ---------- main ---------- */
const { chromium } = loadPlaywright();
const outDir = join(cwd, ".demo-check");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, "shots"), { recursive: true });

if (!opt("--url")) {
  server = spawn(`npx vite preview --host 127.0.0.1 --port ${port} --strictPort`, {
    cwd,
    shell: true,
    stdio: "ignore",
    detached: process.platform !== "win32",
  });
}
await waitForServer();

const viewports = config.viewports ?? { movil: [390, 844], escritorio: [1280, 800] };
const ignore = (config.ignoreConsole ?? []).map((p) => new RegExp(p, "i"));
const results = [];
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true });

try {
  for (const role of config.roles) {
    for (const [vpName, [w, h]] of Object.entries(viewports)) {
      const mobile = w < 640;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: "block", locale: config.locale ?? "es-MX" });
      const page = await ctx.newPage();
      let errors = [];
      page.on("console", (m) => {
        if (m.type() === "error" && !ignore.some((r) => r.test(m.text()))) errors.push(`console: ${m.text().slice(0, 160)}`);
      });
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 160)}`));
      page.on("response", (r) => {
        if (r.status() >= 400 && r.url().startsWith(base)) errors.push(`http ${r.status()}: ${r.url().replace(base, "")}`);
      });

      const tag = `${role.name}-${vpName}`;
      try {
        await runSteps(page, role.login ?? []);
        if (role.expectPath) await page.waitForURL((u) => u.pathname.startsWith(role.expectPath), { timeout: 10000 });
        await settle(page);
      } catch (e) {
        await page.screenshot({ path: join(outDir, "shots", `${tag}-LOGIN-FAIL.png`) }).catch(() => {});
        results.push({ role: role.name, viewport: vpName, screen: "login", fails: [`login: ${e.message.split("\n")[0]}`], warns: [], shot: `${tag}-LOGIN-FAIL.png` });
        await ctx.close();
        continue;
      }

      for (const screen of role.screens ?? []) {
        errors = [];
        const fails = [];
        const warns = [];
        const shot = `${tag}-${screen.name}.png`;
        try {
          if (screen.path !== undefined) await page.goto(base + screen.path, { waitUntil: "domcontentloaded" });
          await settle(page);
          await runSteps(page, screen.steps);
          if (screen.expect) await page.locator(screen.expect).first().waitFor({ timeout: 10000 });
          await settle(page);
          const r = await page.evaluate(inspect, mobile);
          if (r.overflowX > 1) fails.push(`horizontal overflow ${r.overflowX}px`);
          if (r.mojibake.length) fails.push(`broken accents: ${r.mojibake.join(" | ")}`);
          if (r.unnamed.length) fails.push(`buttons/links without a name: ${r.unnamed.join(" | ")}`);
          if (r.tiny.length) fails.push(`tap targets < 24px: ${r.tiny.join(", ")}`);
          if (r.truncated.length) warns.push(`text cut off: ${r.truncated.join(" | ")}`);
          if (r.small.length) warns.push(`tap targets < 44px: ${r.small.join(", ")}`);
          if (r.imgNoAlt) warns.push(`${r.imgNoAlt} image(s) without alt`);
        } catch (e) {
          fails.push(`step: ${e.message.split("\n")[0]}`);
        }
        fails.push(...[...new Set(errors)].slice(0, 6));
        await page.screenshot({ path: join(outDir, "shots", shot), fullPage: config.fullPage ?? true }).catch(() => {});
        results.push({ role: role.name, viewport: vpName, screen: screen.name, fails, warns, shot });
        console.log(`${fails.length ? "FAIL" : warns.length ? "WARN" : "OK  "} ${role.name} ${vpName} ${screen.name}`);
      }
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  stopServer();
}

/* ---------- report ---------- */
const failCount = results.filter((r) => r.fails.length).length;
const warnCount = results.filter((r) => r.warns.length).length;
const lines = [
  `# Demo check`,
  ``,
  `${results.length} screen checks, ${failCount} failing, ${warnCount} with warnings. Screenshots in .demo-check/shots/.`,
  ``,
  `| Result | Role | Viewport | Screen | Details |`,
  `|---|---|---|---|---|`,
  ...results.map((r) => {
    const status = r.fails.length ? "FAIL" : r.warns.length ? "WARN" : "OK";
    const details = [...r.fails, ...r.warns].join("<br>").replaceAll("|", "/") || "";
    return `| ${status} | ${r.role} | ${r.viewport} | ${r.screen} | ${details} |`;
  }),
];
writeFileSync(join(outDir, "report.md"), lines.join("\n") + "\n");
writeFileSync(join(outDir, "report.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length} checks, ${failCount} failing, ${warnCount} with warnings. Report: .demo-check/report.md`);
process.exit(failCount ? 1 : 0);
