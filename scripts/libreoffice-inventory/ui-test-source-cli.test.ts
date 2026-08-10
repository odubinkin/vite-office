/**
 * @fileoverview Verifies strict UITest Python source-target command options and the complete production read/write path against the pinned baseline.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  parseUITestSourceTargetCliOptions,
  readUtf8File,
  runUITestSourceTargetCli,
  writeUtf8File,
} from "./ui-test-source-cli";

describe("UITest source-target inventory CLI" /**
 * Groups strict option parsing and production baseline generation.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineUITestSourceTargetCliTests(): void {
  it("accepts all explicit paths and rejects unknown, incomplete, duplicate, and blank options" /**
   * Verifies callers cannot silently select an unintended constructor inventory, checkout, or output path.
   *
   * @returns Nothing; assertions validate strict command option behavior.
   */, function parsesOptions(): void {
    expect(
      parseUITestSourceTargetCliOptions([
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

  it("runs the production Git and filesystem path to write the complete linked UITest Python inventory" /**
   * Verifies default executor, pinned makefile reader, and UTF-8 writer preserve all physical source evidence.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const directory = await mkdtemp(path.join(tmpdir(), "vite-office-ui-test-source-inventory-"));
    const output = path.join(directory, "core-ui-test-source-targets.json");
    try {
      await runUITestSourceTargetCli(
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
        generatedBy: "inventory:ui-test-source-targets",
        schemaVersion: 1,
        summary: { expression: 0, missing: 0, tracked: 649 },
      });
      expect(inventory.records).toHaveLength(649);
      expect(inventory.records.every(hasExpectedRecord)).toBe(true);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 30_000);
});

/**
 * Determines whether a generated record has constructor provenance and a physical tracked Python path.
 *
 * @param record - JSON-decoded generated UITest source-target record.
 * @param record.constructorId - Optional constructor inventory ID to validate.
 * @param record.sourcePath - Optional physical source path to validate.
 * @param record.targetStatus - Optional resolution status paired with sourcePath.
 * @returns True only for tracked records with a non-empty constructor ID and .py source path.
 */
function hasExpectedRecord(record: {
  readonly constructorId?: unknown;
  readonly sourcePath?: unknown;
  readonly targetStatus?: unknown;
}): boolean {
  return (
    typeof record.constructorId === "string" &&
    record.constructorId.length > 0 &&
    record.targetStatus === "tracked" &&
    typeof record.sourcePath === "string" &&
    record.sourcePath.endsWith(".py")
  );
}

/**
 * Expects strict command option parsing to reject one invalid argument sequence.
 *
 * @param argumentsList - Invalid UITest source-target command arguments.
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
      return parseUITestSourceTargetCliOptions(argumentsList);
    },
  ).toThrowError();
}
