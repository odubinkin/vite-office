/** @fileoverview Verifies native Writer integration retains one owner in full and shared coverage discovery. */
import { expect, it } from "vitest";
import { createOfficeTestOptions } from "../apps/office/test-projects";

it("default discovery includes every named application owner once", /** Verifies the public full-suite configuration and native integration ownership. @returns Nothing. */ () => {
  const options = createOfficeTestOptions();
  expect(
    options.projects?.map(
      /** Reads a concrete inline test owner. @param project - Project config. @returns Owner name. */ (
        project,
      ) => (typeof project === "string" ? project : project.test?.name),
    ),
  ).toEqual(["writer", "calc", "shared"]);
  expect(options.coverage?.include).toEqual(["src/**/*.{ts,tsx}"]);
  expect(options.coverage?.provider).toBe("istanbul");
  expect(options.coverage?.thresholds).toEqual({
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  });
});
it("shared coverage integration retains Writer and Calc execution with shared-only coverage", /** Verifies integration execution and independently bounded coverage ownership. @returns Nothing. */ () => {
  const options = createOfficeTestOptions("shared", true),
    full = createOfficeTestOptions();
  expect(options.projects).toEqual(full.projects);
  expect(options.coverage?.exclude).toEqual(expect.arrayContaining(["src/sw/**", "src/sc/**"]));
  expect(options.coverage?.reportsDirectory).toBe("./coverage/shared");
  expect(options.passWithNoTests).toBe(false);
});
