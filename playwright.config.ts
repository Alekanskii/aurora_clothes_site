import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  // `next dev` compiles each route on demand, on first request — running
  // many workers in parallel against it means several routes all
  // compiling at once, which is what caused 30s navigation timeouts in
  // practice (nothing was actually broken; the dev server was just
  // congested). Serialized locally for that reason. In CI, this assumes
  // a pre-built, pre-started production server (see the webServer
  // comment below), which doesn't have this problem — full parallelism
  // there via fullyParallel/workers is fine and faster.
  fullyParallel: Boolean(process.env.CI),
  workers: process.env.CI ? undefined : 1,
  timeout: 60_000,
  expect: {
    // Separate from the overall test timeout above — this is the polling
    // timeout for individual expect() assertions, which defaults to a
    // much tighter 5000ms. The very first Server Action hit of the whole
    // suite (registration: compiles the route cold, then runs argon2's
    // deliberately-slow hashing) measured comfortably over 10s in
    // practice — 15s gives real headroom without masking a genuine hang.
    timeout: 15_000,
  },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // In CI, also report failures as GitHub annotations so they show up on
  // the run's summary page without downloading the HTML report artifact.
  reporter: process.env.CI ? [["github"], ["html"]] : "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  // Starts the dev server automatically for local runs; in CI, start it
  // yourself first (a fresh `npm run build && npm run start` against a
  // real test database) and set PLAYWRIGHT_BASE_URL instead — reusing
  // `next dev` in CI is slower and less representative of production.
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
