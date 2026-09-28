/**
 * run-lighthouse.mjs
 * Boots `next start`, runs Lighthouse against / and /portfolio in both the
 * mobile and desktop presets, writes the JSON to ./lighthouse/ and prints a
 * summary table.
 *
 *   npm run lighthouse
 */

import { spawn, execFile } from "child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { promisify } from "util";

/** Lighthouse needs a Chrome binary; reuse the one Playwright downloaded. */
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const root = join(homedir(), ".cache", "ms-playwright");
  if (!existsSync(root)) return null;
  for (const dir of readdirSync(root).filter((d) => d.startsWith("chromium-"))) {
    const candidate = join(root, dir, "chrome-linux64", "chrome");
    if (existsSync(candidate)) return candidate;
    const legacy = join(root, dir, "chrome-linux", "chrome");
    if (existsSync(legacy)) return legacy;
  }
  return null;
}

const CHROME_PATH = findChrome();
if (!CHROME_PATH) {
  console.error("\n❌  No Chrome found. Run: npx playwright install chromium\n");
  process.exit(1);
}
process.env.CHROME_PATH = CHROME_PATH;

const run = promisify(execFile);
const PORT = 3100;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = "lighthouse";

const TARGETS = [
  ["home", "/"],
  ["portfolio", "/portfolio"],
];
const PRESETS = ["mobile", "desktop"];

mkdirSync(OUT, { recursive: true });

const server = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
  stdio: "ignore",
});

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("server did not start");
}

const rows = [];

try {
  await waitForServer();

  for (const [name, path] of TARGETS) {
    for (const preset of PRESETS) {
      const file = `${OUT}/${name}-${preset}.json`;
      const args = [
        "lighthouse",
        `${BASE}${path}`,
        "--output=json",
        `--output-path=./${file}`,
        "--quiet",
        '--chrome-flags=--headless=new --no-sandbox',
      ];
      // The mobile preset is Lighthouse's default; only desktop needs the flag.
      if (preset === "desktop") args.push("--preset=desktop");

      process.stdout.write(`  running ${name} ${preset} ... `);
      await run("npx", args, {
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, CHROME_PATH },
      });

      const report = JSON.parse(readFileSync(file, "utf8"));
      const score = (id) => Math.round((report.categories[id]?.score ?? 0) * 100);
      rows.push({
        page: name,
        preset,
        performance: score("performance"),
        accessibility: score("accessibility"),
        bestPractices: score("best-practices"),
        seo: score("seo"),
        lcp: report.audits["largest-contentful-paint"]?.displayValue ?? "n/a",
        cls: report.audits["cumulative-layout-shift"]?.displayValue ?? "n/a",
      });
      console.log("done");
    }
  }
} finally {
  server.kill();
}

console.log("");
console.log(
  ["page", "preset", "perf", "a11y", "best", "seo", "LCP", "CLS"]
    .map((h, i) => h.padEnd([12, 9, 6, 6, 6, 5, 10, 6][i]))
    .join("")
);
for (const r of rows) {
  console.log(
    [r.page, r.preset, r.performance, r.accessibility, r.bestPractices, r.seo, r.lcp, r.cls]
      .map((v, i) => String(v).padEnd([12, 9, 6, 6, 6, 5, 10, 6][i]))
      .join("")
  );
}
console.log(`\nReports written to ./${OUT}/\n`);
