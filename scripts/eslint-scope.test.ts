/** @fileoverview Verifies repository lint scope excludes local browser artifacts while retaining authored implementation and tooling enforcement. */
import { ESLint } from "eslint";
import { expect, it } from "vitest";
it("ignores only generated browser evidence and keeps authored code rules active", /** Uses actual ESLint configuration instead of mirroring its glob list. @returns Completion. */ async () => {
  const eslint = new ESLint();
  for (const path of [
    "output/playwright/writer-full-checkpoint/diagnostic.ts",
    "output/playwright/writer-tabs/audit-incremental-coverage.mjs",
  ])
    expect(await eslint.isPathIgnored(path)).toBe(true);
  for (const path of [
    "apps/office/src/sw/source/core/attr/fmtpdsc.ts",
    "scripts/check-module-boundaries.mjs",
  ])
    expect(await eslint.isPathIgnored(path)).toBe(false);
  const result = await eslint.lintText("const invalid: number = undefined!;", {
    filePath: "apps/office/src/sw/source/core/attr/fmtpdsc.ts",
  });
  expect(
    result[0]?.messages.some(
      /** Finds the actual strict authored-code diagnostic. @param message - Lint message. @returns Whether the native rule remains active. */ (
        message,
      ) => message.ruleId === "@typescript-eslint/no-non-null-assertion",
    ),
  ).toBe(true);
});
