/**
 * @fileoverview Verifies strict CppunitTest source-target command options and the complete production read/write path against owned source fixtures.
 */

import { rm } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createInventoryCliFixture } from "../test-fixtures/inventory-reference";

import {
  parseTestSourceTargetCliOptions,
  readUtf8File,
  runTestSourceTargetCli,
  writeUtf8File,
} from "./test-source-target-cli";

describe("test source-target inventory CLI" /**
 * Groups strict option parsing and the production baseline generation path.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineTestSourceTargetCliTests(): void {
  it("accepts all explicit paths and rejects unknown, incomplete, duplicate, and blank options" /**
   * Verifies callers cannot silently select an unintended constructor inventory, checkout, or output path.
   *
   * @returns Nothing; assertions validate strict command option behavior.
   */, function parsesOptions(): void {
    expect(
      parseTestSourceTargetCliOptions([
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

  it("runs filesystem readers and writers with owned Git and source fixtures" /**
   * Verifies the fixture Git executor, real makefile reader, and UTF-8 writer produce expected evidence.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const fixture = await createInventoryCliFixture();
    const { directory } = fixture;
    const output = path.join(directory, "core-test-source-targets.json");
    try {
      await runTestSourceTargetCli(
        [
          "--baseline",
          fixture.baselinePath,
          "--reference-root",
          fixture.referenceRoot,
          "--constructors",
          fixture.constructorsPath,
          "--output",
          output,
        ],
        readUtf8File,
        writeUtf8File,
        fixture.git,
      );
      const inventory = JSON.parse(await readUtf8File(output));
      expect(inventory).toMatchObject({
        generatedBy: "inventory:test-source-targets",
        schemaVersion: 1,
        summary: { expression: 2, tracked: 684 },
      });
      expect(inventory.records).toHaveLength(686);
      expect(inventory.records.every(hasConstructorId)).toBe(true);
      expect(inventory.records.every(hasValidPhysicalPath)).toBe(true);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 30_000);
});

/**
 * Determines whether a generated record includes a non-empty constructor inventory ID.
 *
 * @param record - JSON-decoded generated source-target record.
 * @param record.constructorId - Optional constructor inventory ID to validate.
 * @returns True only when constructorId is a non-empty string.
 */
function hasConstructorId(record: { readonly constructorId?: unknown }): boolean {
  return typeof record.constructorId === "string" && record.constructorId.length > 0;
}

/**
 * Determines whether a generated record has a tracked path or an explicit expression null.
 *
 * @param record - JSON-decoded generated source-target record.
 * @param record.sourcePath - Optional physical source path or expression null to validate.
 * @param record.targetStatus - Optional resolution status paired with sourcePath.
 * @returns True only for physically tracked paths and declared unresolved expressions.
 */
function hasValidPhysicalPath(record: {
  readonly sourcePath?: unknown;
  readonly targetStatus?: unknown;
}): boolean {
  return (
    (record.targetStatus === "tracked" && typeof record.sourcePath === "string") ||
    (record.targetStatus === "expression" && record.sourcePath === null)
  );
}

/**
 * Expects strict command option parsing to reject one invalid argument sequence.
 *
 * @param argumentsList - Invalid source-target command arguments.
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
      return parseTestSourceTargetCliOptions(argumentsList);
    },
  ).toThrowError();
}
