import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const port = Number(process.env.E2E_FRONTEND_PORT ?? 3100);
export default defineConfig({
  testDir: "./e2e",
  outputDir: "../test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: resolve(__dirname, "../playwright-report"),
        open: "never",
      },
    ],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      testMatch: "**/navigation.spec.ts",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    cwd: resolve(__dirname, ".."),
    command: "node tests/support/start-e2e.cjs",
    url: `http://127.0.0.1:${port}/login`,
    reuseExistingServer: false,
    timeout: 120000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 15000 },
  },
});
