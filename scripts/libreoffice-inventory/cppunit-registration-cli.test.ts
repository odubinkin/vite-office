/**
 * @fileoverview Verifies strict Cppunit registration command options and its complete production read/write path against the pinned baseline.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  parseCppunitRegistrationCliOptions,
  readUtf8File,
  runCppunitRegistrationCli,
  writeUtf8File,
} from "./cppunit-registration-cli";

describe("Cppunit registration inventory CLI" /**
 * Groups strict option parsing and production baseline generation.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineCppunitRegistrationCliTests(): void {
  it("accepts explicit paths and rejects unknown, incomplete, duplicate, and blank options" /**
   * Verifies callers cannot silently select an unintended source-target inventory, checkout, or output path.
   *
   * @returns Nothing; assertions validate strict command option behavior.
   */, function parsesOptions(): void {
    expect(
      parseCppunitRegistrationCliOptions([
        "--baseline",
        "baseline.json",
        "--reference-root",
        "vendor/reference",
        "--source-targets",
        "targets.json",
        "--output",
        "output.json",
      ]),
    ).toEqual({
      baselinePath: "baseline.json",
      outputPath: "output.json",
      referenceRoot: "vendor/reference",
      sourceTargetsPath: "targets.json",
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
      "--source-targets",
      "targets.json",
      "--output",
      "output.json",
    ]);
    expectOptionError([
      "--baseline",
      "--reference-root",
      "vendor/reference",
      "--source-targets",
      "targets.json",
      "--output",
      "output.json",
    ]);
  });

  it("runs the production path to write all linked Cppunit registration records" /**
   * Verifies default Git executor, physical-source reader, and UTF-8 writer retain macro and source-target provenance.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const directory = await mkdtemp(
      path.join(tmpdir(), "vite-office-cppunit-registration-inventory-"),
    );
    const output = path.join(directory, "core-cppunit-registrations.json");
    try {
      await runCppunitRegistrationCli(
        [
          "--baseline",
          "docs/program/libreoffice-baseline.json",
          "--reference-root",
          "vendor/libreoffice-reference",
          "--source-targets",
          "docs/program/inventory/core-test-source-targets.json",
          "--output",
          output,
        ],
        readUtf8File,
        writeUtf8File,
      );
      const inventory = JSON.parse(await readUtf8File(output));
      expect(inventory).toMatchObject({
        generatedBy: "inventory:cppunit-registrations",
        schemaVersion: 1,
        summary: { CPPUNIT_TEST: 3508, CPPUNIT_TEST_FIXTURE: 4564 },
      });
      expect(inventory.records).toHaveLength(8072);
      expect(inventory.records.every(hasExpectedRecord)).toBe(true);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 30_000);
});

/**
 * Determines whether a generated registration record preserves complete physical source-target and constructor provenance.
 *
 * @param record - JSON-decoded Cppunit registration record.
 * @param record.constructorId - Optional linked constructor ID to validate.
 * @param record.line - Optional exact source line to validate.
 * @param record.sourcePath - Optional physical C++ source path to validate.
 * @param record.sourceTargetId - Optional linked source-target ID to validate.
 * @returns True only for records with all required physical provenance fields.
 */
function hasExpectedRecord(record: {
  readonly constructorId?: unknown;
  readonly line?: unknown;
  readonly sourcePath?: unknown;
  readonly sourceTargetId?: unknown;
}): boolean {
  return (
    typeof record.constructorId === "string" &&
    record.constructorId.length > 0 &&
    typeof record.sourceTargetId === "string" &&
    record.sourceTargetId.length > 0 &&
    typeof record.sourcePath === "string" &&
    record.sourcePath.endsWith(".cxx") &&
    typeof record.line === "number" &&
    record.line > 0
  );
}

/**
 * Expects strict command option parsing to reject one invalid argument sequence.
 *
 * @param argumentsList - Invalid Cppunit registration command arguments.
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
      return parseCppunitRegistrationCliOptions(argumentsList);
    },
  ).toThrowError();
}
