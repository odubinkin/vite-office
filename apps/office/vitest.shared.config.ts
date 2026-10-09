/** @fileoverview Runs shared office infrastructure tests without application-owned tests or coverage. */

import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";
import { createOfficeTestOptions } from "./test-projects.ts";

export default defineConfig({ ...viteConfig, test: createOfficeTestOptions("shared") });
