/**
 * @fileoverview Configures the static Vite build, Tailwind integration, React transform, and Vitest coverage gates.
 */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  test: {
    coverage: {
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/main.tsx",
        "src/sw/source/filter/xml/odt-worker.ts",
        "src/test/**",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    environment: "jsdom",
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    maxWorkers: 2,
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 30_000,
  },
});
