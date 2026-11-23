#!/usr/bin/env node
// kit-ui setup: checks which skills demo-pwa needs, suggests the missing ones and installs them
// from their official sources after you confirm.
//
//   npx github:Cambar-Solutions/kit-ui            interactive check and install
//   npx github:Cambar-Solutions/kit-ui check      report only, installs nothing
//
// Options:
//   --harness kiro|claude|codex   agent tool to install for (default: detected, else kiro)
//   --scope global|project        global = all your projects, project = current folder (default: ask, else global)
//   --yes                         install every missing skill without asking
//   --only a,b                    limit to these skills (ids below)
//   --force                       reinstall even if present
//
// Zero dependencies. Node 18+. Uses fetch for GitHub downloads (set GH_TOKEN to raise the API rate limit).
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const cmd = argv[0] && !argv[0].startsWith("--") ? argv[0] : "setup";
const flag = (name) => argv.includes(`--${name}`);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : undefined;
};

if (cmd === "help" || flag("help") || flag("h")) {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 16).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(0);
}

/* ---------- harnesses ---------- */
const HOME = homedir();
const HARNESSES = {
  kiro: { label: "Kiro", global: join(process.env.KIRO_HOME ?? join(HOME, ".kiro"), "skills"), project: join(".kiro", "skills"), marker: join(HOME, ".kiro"), impeccable: "kiro" },
  claude: { label: "Claude Code", global: join(HOME, ".claude", "skills"), project: join(".claude", "skills"), marker: join(HOME, ".claude"), impeccable: "claude" },
  codex: { label: "Codex / agents", global: join(HOME, ".agents", "skills"), project: join(".agents", "skills"), marker: join(HOME, ".agents"), impeccable: "codex" },
};

/* ---------- skills demo-pwa uses ---------- */
const SKILLS = [
  { id: "demo-pwa", name: "demo-pwa", why: "constructor de demos (esta herramienta)", level: "necesaria", source: { type: "bundled", path: "skills/demo-pwa" }, url: "github.com/Cambar-Solutions/kit-ui" },
  { id: "impeccable", name: "impeccable", why: "diseño, crítica y pulido", level: "recomendada", source: { type: "impeccable" }, url: "github.com/pbakaus/impeccable" },
  { id: "frontend-design", name: "frontend-design", why: "diseño de respaldo si no hay impeccable", level: "opcional", source: { type: "github", repo: "anthropics/skills", path: "skills/frontend-design" }, url: "github.com/anthropics/skills" },
  { id: "offline-first-pwa", name: "offline-first-pwa", why: "reglas de PWA (iOS, caché, actualizaciones)", level: "recomendada", source: { type: "github", repo: "mattiasgeniar/offline-first-pwa", path: "" }, url: "github.com/mattiasgeniar/offline-first-pwa" },
  { id: "pwa-review", name: "pwa-review", why: "auditoría de PWA antes de entregar", level: "opcional", source: { type: "github", repo: "NexFabric/pwa-review-skill", path: "" }, url: "github.com/NexFabric/pwa-review-skill" },
  { id: "shadcn", name: "shadcn", why: "reglas para instalar componentes kit-ui", level: "opcional", source: { type: "github", repo: "shadcn-ui/ui", path: "skills/shadcn" }, url: "github.com/shadcn-ui/ui" },
];

const C = process.stdout.isTTY && !process.env.NO_COLOR
  ? { dim: (s) => `\x1b[2m${s}\x1b[0m`, ok: (s) => `\x1b[32m${s}\x1b[0m`, warn: (s) => `\x1b[33m${s}\x1b[0m`, bad: (s) => `\x1b[31m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m` }
  : { dim: (s) => s, ok: (s) => s, warn: (s) => s, bad: (s) => s, bold: (s) => s };
const die = (m) => {
  console.error(C.bad(`kit-ui: ${m}`));
  process.exit(1);
};

/* ---------- detection ---------- */
function skillName(dir) {
  const f = join(dir, "SKILL.md");
  if (!existsSync(f)) return null;
  const m = readFileSync(f, "utf8").match(/^name:\s*["']?([^"'\r\n]+)["']?\s*$/m);
  return m ? m[1].trim() : null;
}

function scan(root) {
  const found = new Map();
  if (!existsSync(root)) return found;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = skillName(join(root, entry.name));
    if (name) found.set(name, join(root, entry.name));
  }
  return found;
}

/* ---------- installers ---------- */
const UA = { "User-Agent": "kit-ui-setup", Accept: "application/vnd.github+json", ...(process.env.GH_TOKEN || process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GH_TOKEN || process.env.GITHUB_TOKEN}` } : {}) };
const SKIP = new Set([".git", ".github", "tests", "test", "node_modules"]);

async function gh(url) {
  const r = await fetch(url, { headers: UA });
  if (r.status === 403 || r.status === 429) throw new Error("límite de la API de GitHub alcanzado. Espera un rato o define GH_TOKEN.");
  if (!r.ok) throw new Error(`GitHub respondió ${r.status} para ${url}`);
  return r.json();
}

async function downloadFolder(repo, path, ref, dest) {
  let count = 0;
  async function walk(p, out) {
    const items = await gh(`https://api.github.com/repos/${repo}/contents/${p}?ref=${ref}`);
    for (const it of Array.isArray(items) ? items : [items]) {
      if (SKIP.has(it.name)) continue;
      const target = join(out, it.name);
      if (it.type === "dir") {
        mkdirSync(target, { recursive: true });
        await walk(it.path, target);
      } else if (it.type === "file") {
        const r = await fetch(it.download_url, { headers: { "User-Agent": UA["User-Agent"] } });
        if (!r.ok) throw new Error(`no se pudo descargar ${it.path} (${r.status})`);
        writeFileSync(target, Buffer.from(await r.arrayBuffer()));
        count++;
      }
    }
  }
  await walk(path, dest);
  return count;
}

async function installGithub(skill, root) {
  const { repo, path } = skill.source;
  const meta = await gh(`https://api.github.com/repos/${repo}`);
  const commit = await gh(`https://api.github.com/repos/${repo}/commits/${meta.default_branch}`);
  const sha = commit.sha;
  const dest = join(root, skill.name);
  const tmp = `${dest}.kit-ui-tmp`;
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  try {
    const n = await downloadFolder(repo, path, sha, tmp);
    if (!existsSync(join(tmp, "SKILL.md"))) throw new Error("la descarga no trae SKILL.md");
    rmSync(dest, { recursive: true, force: true });
    cpSync(tmp, dest, { recursive: true });
    return `${n} archivos, ${repo}@${sha.slice(0, 7)}`;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function installBundled(skill, root) {
  const src = join(PKG_ROOT, skill.source.path);
  if (!existsSync(join(src, "SKILL.md"))) throw new Error(`no encontré ${skill.source.path} en el paquete`);
  const dest = join(root, skill.name);
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
  const version = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")).version;
  return `kit-ui ${version}`;
}

function installImpeccable(harness, scope) {
  // Official installer from the impeccable author. It installs the skill and its engine.
  const command = `npx -y impeccable@latest install --providers=${harness.impeccable} --scope=${scope} --yes`;
  console.log(C.dim(`  ejecutando: ${command}`));
  const r = spawnSync(command, { stdio: "inherit", shell: true });
  if (r.status !== 0) throw new Error("el instalador de impeccable terminó con error");
  return "instalador oficial (npx impeccable install)";
}

/* ---------- main ---------- */
async function main() {
  const interactive = process.stdin.isTTY && process.stdout.isTTY && !flag("yes");
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  const ask = async (q, def = "") => {
    if (!rl) return def;
    const a = (await rl.question(q)).trim();
    return a || def;
  };

  try {
    // Harness
    let harnessId = opt("harness");
    if (harnessId && !HARNESSES[harnessId]) die(`--harness debe ser uno de: ${Object.keys(HARNESSES).join(", ")}`);
    if (!harnessId) {
      const present = Object.entries(HARNESSES).filter(([, h]) => existsSync(h.marker)).map(([id]) => id);
      if (present.length > 1 && rl) {
        const a = await ask(`¿Para qué herramienta? ${present.map((p, i) => `${i + 1}) ${HARNESSES[p].label}`).join("  ")} [1]: `, "1");
        harnessId = present[Number(a) - 1] ?? present[0];
      } else harnessId = present[0] ?? "kiro";
    }
    const harness = HARNESSES[harnessId];
    const globalRoot = harness.global;
    const projectRoot = resolve(harness.project);
    const sameRoots = resolve(globalRoot) === projectRoot;

    // What is installed (Kiro merges global and project skills)
    const installed = new Map();
    for (const [name, where] of scan(globalRoot)) installed.set(name, { where, scope: "global" });
    if (!sameRoots) for (const [name, where] of scan(projectRoot)) installed.set(name, { where, scope: "proyecto" });

    let list = SKILLS;
    const only = opt("only");
    if (only) {
      const ids = only.split(",").map((s) => s.trim());
      const unknown = ids.filter((id) => !SKILLS.some((s) => s.id === id));
      if (unknown.length) die(`skills desconocidas: ${unknown.join(", ")}. Disponibles: ${SKILLS.map((s) => s.id).join(", ")}`);
      list = SKILLS.filter((s) => ids.includes(s.id));
    }

    console.log(`\n${C.bold("kit-ui")} revisión de skills para ${harness.label}`);
    console.log(C.dim(`  global:   ${globalRoot}`));
    if (!sameRoots) console.log(C.dim(`  proyecto: ${projectRoot}`));
    console.log("");
    for (const s of list) {
      const hit = installed.get(s.name);
      const status = hit ? C.ok("instalada") : s.level === "necesaria" ? C.bad("falta    ") : C.warn("falta    ");
      const extra = hit ? C.dim(`(${hit.scope})`) : C.dim(s.url);
      console.log(`  ${status}  ${s.id.padEnd(18)} ${s.level.padEnd(12)} ${s.why.padEnd(44)} ${extra}`);
    }
    console.log("");

    const missing = list.filter((s) => flag("force") || !installed.has(s.name));
    if (cmd === "check") {
      console.log(missing.length ? `Faltan ${missing.length}. Corre sin "check" para instalarlas.` : "Todo instalado.");
      return;
    }
    if (!missing.length) {
      console.log(C.ok("Todo instalado. Abre una sesión nueva del agente y escribe /demo-pwa."));
      return;
    }

    // Pick what to install
    let chosen = missing;
    if (rl) {
      const a = (await ask(`¿Instalar las ${missing.length} que faltan desde sus repos oficiales? [S]í / [n]o / [e]legir: `, "s")).toLowerCase();
      if (a.startsWith("n")) {
        console.log("No se instaló nada.");
        return;
      }
      if (a.startsWith("e")) {
        chosen = [];
        for (const s of missing) {
          const def = s.level === "opcional" ? "n" : "s";
          const r = (await ask(`  ${s.id} (${s.level}, ${s.url}) [${def === "s" ? "S/n" : "s/N"}]: `, def)).toLowerCase();
          if (r.startsWith("s") || r.startsWith("y")) chosen.push(s);
        }
      }
    } else if (!flag("yes")) {
      console.log('Sin terminal interactiva: usa --yes para instalar, o "check" para solo revisar.');
      return;
    }
    if (!chosen.length) {
      console.log("No se instaló nada.");
      return;
    }

    // Scope
    let scope = opt("scope");
    if (scope && !["global", "project"].includes(scope)) die("--scope debe ser global o project");
    if (!scope) {
      if (sameRoots) scope = "global";
      else {
        const a = await ask(`¿Dónde? 1) global, para todos tus proyectos  2) solo este proyecto (${process.cwd()}) [1]: `, "1");
        scope = a === "2" ? "project" : "global";
      }
    }
    const root = scope === "global" ? globalRoot : projectRoot;
    mkdirSync(root, { recursive: true });

    // Install
    console.log("");
    const results = [];
    for (const s of chosen) {
      process.stdout.write(`  instalando ${s.id}... `);
      try {
        let detail;
        if (s.source.type === "bundled") detail = installBundled(s, root);
        else if (s.source.type === "github") detail = await installGithub(s, root);
        else {
          console.log("");
          detail = installImpeccable(harness, scope);
        }
        console.log(C.ok("listo ") + C.dim(detail));
        results.push([s.id, true]);
      } catch (e) {
        console.log(C.bad(`falló: ${e.message}`));
        results.push([s.id, false]);
      }
    }

    const failed = results.filter(([, ok]) => !ok).map(([id]) => id);
    console.log("");
    if (failed.length) console.log(C.warn(`Fallaron: ${failed.join(", ")}. Vuelve a correr el comando para reintentar.`));
    console.log(`Instaladas en ${root}. Abre una sesión nueva del agente y escribe ${C.bold("/demo-pwa")} o pídele "crea una demo para ...".`);
    if (failed.length) process.exitCode = 1;
  } finally {
    rl?.close();
  }
}

main().catch((e) => die(e.message));
