/**
 * @fileoverview Verifies strict PythonTest module command options and the complete production read/write path against the pinned baseline.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  parsePythonTestModuleCliOptions,
  readUtf8File,
  runPythonTestModuleCli,
  writeUtf8File,
} from "./python-test-module-cli";

describe("PythonTest module inventory CLI" /**
 * Groups strict option parsing and production baseline generation.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function definePythonTestModuleCliTests(): void {
  it("accepts all explicit paths and rejects unknown, incomplete, duplicate, and blank options" /**
   * Verifies callers cannot silently select an unintended constructor inventory, checkout, or output path.
   *
   * @returns Nothing; assertions validate strict command option behavior.
   */, function parsesOptions(): void {
    expect(
      parsePythonTestModuleCliOptions([
        "--baseline",
        "baseline.json",
        "--reference-root",
        "vendor/reference",
        "--constructors",
        "constructors.json",
        "--output",
        "output.json",
      ]),
    ).toEqual({
      baselinePath: "baseline.json",
      constructorsPath: "constructors.json",
      outputPath: "output.json",
      referenceRoot: "vendor/reference",
    });
    expectOptionError(["--unknown", "value"]);
    expectOptionError(["--baseline", "baseline.json", "--output", "output.json"]);
    expectOptionError([
      "--baseline",
      "baseline.json",
      "--baseline",
      "other.json",
      "--reference-root",
      "vendor/reference",
      "--constructors",
      "constructors.json",
      "--output",
      "output.json",
    ]);
    expectOptionError([
      "--baseline",
      "--reference-root",
      "vendor/reference",
      "--constructors",
      "constructors.json",
      "--output",
      "output.json",
    ]);
  });

  it("runs the production Git and filesystem path to write the complete linked Python inventory" /**
   * Verifies default executor, pinned makefile reader, and UTF-8 writer preserve all physical module evidence.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const directory = await mkdtemp(
      path.join(tmpdir(), "vite-office-python-test-module-inventory-"),
    );
    const output = path.join(directory, "core-python-test-modules.json");
    try {
      await runPythonTestModuleCli(
        [
          "--baseline",
          "docs/program/libreoffice-baseline.json",
          "--reference-root",
          "vendor/libreoffice-reference",
          "--constructors",
          "docs/program/inventory/core-tests.json",
          "--output",
          output,
        ],
        readUtf8File,
        writeUtf8File,
      );
      const inventory = JSON.parse(await readUtf8File(output));
      expect(inventory).toMatchObject({
        generatedBy: "inventory:python-test-modules",
        schemaVersion: 1,
        summary: { expression: 0, missing: 0, tracked: 59 },
      });
      expect(inventory.records).toHaveLength(59);
      expect(inventory.records.every(hasConstructorId)).toBe(true);
      expect(inventory.records.every(hasExpectedPathState)).toBe(true);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 30_000);
});

/**
 * Determines whether a generated record includes a non-empty constructor inventory ID.
 *
 * @param record - JSON-decoded generated Python module record.
 * @param record.constructorId - Optional constructor inventory ID to validate.
 * @returns True only when constructorId is a non-empty string.
 */
function hasConstructorId(record: { readonly constructorId?: unknown }): boolean {
  return typeof record.constructorId === "string" && record.constructorId.length > 0;
}

/**
 * Determines whether a generated record has the canonical physical Python path for its status.
 *
 * @param record - JSON-decoded generated Python module record.
 * @param record.modulePath - Optional physical Python path or expression null to validate.
 * @param record.targetStatus - Optional resolution status paired with modulePath.
 * @returns True only for literal physical paths or declared unresolved expressions.
 */
function hasExpectedPathState(record: {
  readonly modulePath?: unknown;
  readonly targetStatus?: unknown;
}): boolean {
  return (
    ((record.targetStatus === "tracked" || record.targetStatus === "missing") &&
      typeof record.modulePath === "string" &&
      record.modulePath.endsWith(".py")) ||
    (record.targetStatus === "expression" && record.modulePath === null)
  );
}

/**
 * Expects strict command option parsing to reject one invalid argument sequence.
 *
 * @param argumentsList - Invalid PythonTest module command arguments.
 * @returns Nothing; assertion validates expected error behavior.
 */
function expectOptionError(argumentsList: readonly string[]): void {
  expect(
    /**
     * Invokes option parsing under an expected error assertion.
     *
     * @returns Parsing result that never returns for invalid arguments.
     */
    function parseInvalidOptions(): unknown {
      return parsePythonTestModuleCliOptions(argumentsList);
    },
  ).toThrowError();
}
