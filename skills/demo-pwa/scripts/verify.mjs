#!/usr/bin/env node
// One command for the whole gate: encoding -> build -> budget -> browser smoke test.
// Usage (from the project root): node <skill>/scripts/verify.mjs [--skip-build] [--config demo.config.json]
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const passThrough = args.filter((a) => a !== "--skip-build");

function step(label, command) {
  console.log(`\n=== ${label} ===`);
  // Single command string with shell:true (no args array): portable and no Node DEP0190 warning.
  const r = spawnSync(command, { stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error(`\nverify: "${label}" failed. Fix it and run verify again.`);
    process.exit(r.status ?? 1);
  }
}

const q = (p) => `"${p}"`;
step("encoding", `node ${q(join(here, "check-encoding.mjs"))}`);
if (!args.includes("--skip-build")) step("build", "npm run build");
step("budget", `node ${q(join(here, "check-budget.mjs"))}`);
step("browser smoke test", `node ${q(join(here, "smoke.mjs"))} ${passThrough.map(q).join(" ")}`);
console.log("\nverify OK. Now LOOK at .demo-check/shots (the script cannot judge taste) and read .demo-check/report.md warnings.");
