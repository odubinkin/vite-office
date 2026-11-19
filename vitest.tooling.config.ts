/** @fileoverview Discovers tooling tests only in the repository's scripts directory. */
import { defineConfig } from "vitest/config";

export default defineConfig({ test: { include: ["scripts/*.test.ts"] } });
