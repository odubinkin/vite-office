/** @fileoverview Runs only Writer tests and measures only Writer-owned source coverage. */

import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";
import { createOfficeTestOptions } from "./test-projects.ts";

export default defineConfig({ ...viteConfig, test: createOfficeTestOptions("writer") });
