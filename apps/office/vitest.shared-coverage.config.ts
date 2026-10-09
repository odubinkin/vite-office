/** @fileoverview Measures shared sources using direct unit tests and application integration evidence. */

import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";
import { createOfficeTestOptions } from "./test-projects.ts";

export default defineConfig({ ...viteConfig, test: createOfficeTestOptions("shared", true) });
