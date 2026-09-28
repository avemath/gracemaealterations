import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against a production build (next start), because the bugs worth
 * catching here live in the server HTML.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  // On CI, also write the HTML report so the screenshots from visual.spec.ts
  // can be browsed from the uploaded artifact.
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "off",
    // Lets a sandbox with a preinstalled Chromium skip the browser download.
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "node node_modules/next/dist/bin/next start -p 3000",
    url: "http://127.0.0.1:3000",
    // Never reuse: a server booted before the last build serves HTML that
    // points at chunks which no longer exist on disk.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
