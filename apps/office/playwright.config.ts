/**
 * @fileoverview Configures Chromium smoke and accessibility checks against the built static application.
 */

import { defineConfig, devices } from "@playwright/test";
import { FieldUnit } from "./src/tools/inc/fldunit";
import { WRITER_LAYOUT_PREFERENCES_KEY } from "./src/sw/browser/storage/writer-layout-preferences-store";

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  outputDir: "../../test-results/e2e",
  projects: [
    {
      name: "writer",
      // Historical physical-geometry fixtures explicitly select CM;fresh-profile specs override this storage state.
      use: {
        storageState: {
          cookies: [],
          origins: [
            {
              origin: "http://127.0.0.1:4173",
              localStorage: [
                {
                  name: WRITER_LAYOUT_PREFERENCES_KEY,
                  value: JSON.stringify({ "Other/MeasureUnit": FieldUnit.CM }),
                },
              ],
            },
          ],
        },
      },
      testMatch: "**/*.spec.ts",
      testIgnore: ["**/shared/**", "**/calc/**"],
    },
    { name: "calc", testMatch: "**/calc/**/*.spec.ts" },
    { name: "shared", testMatch: "**/shared/**/*.spec.ts" },
  ],
  reporter: [["list"], ["html", { open: "never", outputFolder: "../../playwright-report" }]],
  retries: 0,
  workers: 2,
  testDir: "./e2e",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1",
    reuseExistingServer: false,
    timeout: 30_000,
    url: "http://127.0.0.1:4173",
  },
});
