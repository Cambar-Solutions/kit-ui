#!/usr/bin/env node
// Creates the empty tooling for a demo (no UI): Vite + React + TS + Tailwind v4 + react-router +
// lucide-react + vite-plugin-pwa + PWA icon generator + playwright-core for verification.
// The app itself (design, screens, data) is written afterwards, following impeccable and build.md.
//
// Usage: node scaffold.mjs <target-dir> --name "Taller Ramírez" [--short "Taller R."] [--color "#0d1b2a"]
//                          [--bg "#eef1f4"] [--lang es-MX] [--no-install]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const target = argv[0] && !argv[0].startsWith("--") ? argv[0] : undefined;
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const die = (m) => {
  console.error(`scaffold: ${m}`);
  process.exit(1);
};

if (!target) die('missing target dir. Example: node scaffold.mjs ./taller-demo --name "Taller Ramírez"');
const name = opt("name", "Demo");
const short = opt("short", name.length > 12 ? name.slice(0, 12).trim() : name);
const color = opt("color", "#1f2937");
const bg = opt("bg", "#ffffff");
const lang = opt("lang", "es-MX");
for (const [k, v] of [["color", color], ["bg", bg]]) if (!/^#[0-9a-fA-F]{6}$/.test(v)) die(`--${k} must be a hex like #1f2937`);

const dest = resolve(target);
if (existsSync(dest) && readdirSync(dest).length) die(`${dest} is not empty`);
const slug =
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "demo";

const files = {
  "package.json": JSON.stringify(
    {
      name: `${slug}-demo`,
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc --noEmit && vite build",
        preview: "vite preview",
        icons: "pwa-assets-generator",
      },
    },
    null,
    2,
  ),
  "tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        skipLibCheck: true,
        isolatedModules: true,
        noEmit: true,
        types: ["vite/client", "vite-plugin-pwa/react"],
        paths: { "@/*": ["./src/*"] },
      },
      include: ["src"],
    },
    null,
    2,
  ),
  "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        name: ${JSON.stringify(name)},
        short_name: ${JSON.stringify(short)},
        lang: ${JSON.stringify(lang.split("-")[0])},
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: ${JSON.stringify(bg)},
        theme_color: ${JSON.stringify(color)},
        icons: [
          { src: "/pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { target: "es2022" },
});
`,
  "pwa-assets.config.ts": `import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Generates PNG icons from public/logo.svg. Replace it with the client's logo, then: npm run icons
export default defineConfig({ preset: minimal2023Preset, images: ["public/logo.svg"] });
`,
  "index.html": `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="${color}" />
    <meta name="apple-mobile-web-app-title" content="${short}" />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/logo.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  ".gitignore": "node_modules\ndist\n.demo-check\n*.local\n",
  "public/logo.svg": (() => {
    const initials = name
      .split(/\s+/)
      .filter((w) => /^[\p{L}\p{N}]/u.test(w))
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="104" fill="${color}"/><text x="256" y="${initials.length > 1 ? 322 : 336}" font-family="system-ui, sans-serif" font-size="${initials.length > 1 ? 210 : 250}" font-weight="700" text-anchor="middle" fill="#ffffff">${initials}</text></svg>\n`;
  })(),
  "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
  "src/App.tsx": `/** Placeholder. Replace with the router and the demo screens (see the demo-pwa skill, build.md). */
export function App() {
  return <main className="grid min-h-dvh place-items-center p-6 text-center">${name}</main>;
}
`,
  "src/index.css": `@import "tailwindcss";

/* Design tokens go here (from DESIGN.md). Self-hosted fonts: @font-face with woff2 files in src/assets/fonts. */
`,
  "docs/.gitkeep": "",
};

for (const [rel, text] of Object.entries(files)) {
  const p = join(dest, rel);
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, text.endsWith("\n") || text === "" ? text : `${text}\n`, "utf8");
}

const deps = ["react", "react-dom", "react-router-dom", "lucide-react"];
const devDeps = [
  "vite",
  "@vitejs/plugin-react",
  "typescript",
  "@types/react",
  "@types/react-dom",
  "tailwindcss",
  "@tailwindcss/vite",
  "vite-plugin-pwa",
  "workbox-window",
  "@vite-pwa/assets-generator",
  "playwright-core",
];

if (!argv.includes("--no-install")) {
  const run = (cmd) => spawnSync(cmd, { cwd: dest, stdio: "inherit", shell: true }).status === 0;
  if (!run(`npm install --no-audit --no-fund ${deps.join(" ")}`)) die("npm install (deps) failed");
  if (!run(`npm install --no-audit --no-fund -D ${devDeps.join(" ")}`)) die("npm install (devDeps) failed");
  if (!run("npm run icons")) console.warn("scaffold: icon generation failed; run `npm run icons` after adding public/logo.svg");
}

console.log(JSON.stringify({ ok: true, path: dest, name, slug, next: ["write docs/BRIEF.md", "impeccable init", "build the app", "write demo.config.json", "verify"] }, null, 2));
