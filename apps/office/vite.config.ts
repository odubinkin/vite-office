/**
 * @fileoverview Configures the static Vite build, Tailwind integration, React transform, and Vitest coverage gates.
 */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { createOfficeTestOptions } from "./test-projects.ts";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  test: createOfficeTestOptions(),
});
