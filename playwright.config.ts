import { defineConfig } from "@playwright/test";

const smokePort = 3200;
const smokeHost = "127.0.0.1";
const smokeBaseUrl = `http://${smokeHost}:${smokePort}`;
const smokeAppBasePath = "";

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? smokeBaseUrl,
    headless: true,
    trace: "on-first-retry",
  },
  outputDir: "artifacts/playwright/test-results",
  webServer: {
    command: `SMOKE_HOST=${smokeHost} SMOKE_PORT=${smokePort} PLAYWRIGHT_APP_BASE_PATH=${smokeAppBasePath} node scripts/harness/serve-export-preview.mjs`,
    url: `${smokeBaseUrl}${smokeAppBasePath || "/"}`,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 30_000,
  },
  workers: 1,
});
