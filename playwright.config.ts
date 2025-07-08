import "dotenv/config";
import { defineConfig, PlaywrightTestOptions, devices } from "@playwright/test";
import type { MyOptions } from "./extended-playwright";
/**
 * See https://playwright.dev/docs/test-configuration.
 */
const chrome = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1600, height: 920 },
  channel: "chrome",
};
const mobileChrome = {
  ...devices["Pixel 5"],
  channel: "chrome",
};

export default defineConfig<MyOptions>({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  snapshotPathTemplate: "{testDir}/_snapshots/{projectName}/{testFileName}/{arg}{ext}",
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "list",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */

  use: {
    launchOptions: {
      slowMo: !!process.env.SLOW_MO ? Number(process.env.SLOW_MO) : 0,
    },
    screenshot: { mode: "only-on-failure", fullPage: true },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup_stage",
      testMatch: /.*\.setup\.ts/,
      grep: [/@STAGE/],
      workers: 1,
      use: {
        ...chrome,
        baseURL: process.env.STAGE_URL,
        backURL: process.env.STAGE_BACK,
      },
    },
    {
      name: "api_stage",
      testMatch: /.*\.test\.ts/,
      dependencies: ["setup_stage"],
      grep: [/@API/, /@STAGE/],
      workers: 1,
      use: {
        ...chrome,
        storageState: "playwright/.auth/setup_stage.json",
        backURL: process.env.STAGE_BACK,
      },
    },
    {
      name: "stage",
      testMatch: /.*\.test\.ts/,
      dependencies: ["setup_stage", "api_stage"],
      grep: [/@STAGE/],
      grepInvert: [/@MOBILE_ONLY/, /@NO_DESKTOP/, /@API/],
      workers: 1,
      use: {
        ...chrome,
        baseURL: process.env.STAGE_URL,
        storageState: "playwright/.auth/setup_stage.json",
        backURL: process.env.STAGE_BACK,
      },
    },
  ],
});
