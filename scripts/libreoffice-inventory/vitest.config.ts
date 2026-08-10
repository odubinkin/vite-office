/**
 * @fileoverview Configures isolated Node-side coverage gates for the deterministic LibreOffice inventory tool.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/*.test.ts", "vitest.config.ts"],
      include: ["scripts/libreoffice-inventory/**/*.ts"],
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    environment: "node",
    fileParallelism: false,
    include: ["scripts/libreoffice-inventory/**/*.test.ts"],
  },
});
