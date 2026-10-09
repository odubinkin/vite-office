/** @fileoverview Reserves an independent Calc test and coverage gate before its implementation. */

import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";
import { createOfficeTestOptions } from "./test-projects.ts";

export default defineConfig({ ...viteConfig, test: createOfficeTestOptions("calc") });
