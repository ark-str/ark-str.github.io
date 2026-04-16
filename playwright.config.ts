import { defineConfig } from "@playwright/test";

const smokePort = 3200;
const smokeHost = "127.0.0.1";
const smokeBaseUrl = `http://${smokeHost}:${smokePort}`;

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
    command: `npm run start -- --hostname ${smokeHost} --port ${smokePort}`,
    url: smokeBaseUrl,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 30_000,
  },
  workers: 1,
});
