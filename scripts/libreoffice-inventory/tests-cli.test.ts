/**
 * @fileoverview Verifies strict core test-inventory CLI options, injected boundaries, and the production filesystem/Git execution path.
 */

import { rm } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createInventoryCliFixture } from "../test-fixtures/inventory-reference";

import { parseTestCliOptions, readUtf8File, runTestCli, writeUtf8File } from "./tests-cli";

describe("test inventory CLI" /**
 * Groups strict option and real command execution cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineTestCliTests(): void {
  it("accepts required paths and rejects unknown, incomplete, and duplicate options" /**
   * Verifies callers cannot silently select an unintended checkout or output destination.
   *
   * @returns Nothing; assertions validate strict option behavior.
   */, function parsesOptions(): void {
    expect(
      parseTestCliOptions(["--baseline", "a", "--reference-root", "b", "--output", "c"]),
    ).toEqual({ baselinePath: "a", outputPath: "c", referenceRoot: "b" });
    expectOptionError(["--unknown", "a"]);
    expectOptionError(["--baseline", "a", "--output", "c"]);
    expectOptionError([
      "--baseline",
      "a",
      "--baseline",
      "b",
      "--reference-root",
      "c",
      "--output",
      "d",
    ]);
    expectOptionError(["--baseline", "--reference-root", "b", "--output", "c"]);
  });

  it("runs filesystem readers and writers with owned Git and source fixtures" /**
   * Verifies the explicit Git fixture and real UTF-8 wrappers work without a pinned checkout.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const fixture = await createInventoryCliFixture();
    const { directory } = fixture;
    const output = path.join(directory, "core-tests.json");
    try {
      await runTestCli(
        [
          "--baseline",
          fixture.baselinePath,
          "--reference-root",
          fixture.referenceRoot,
          "--output",
          output,
        ],
        readUtf8File,
        writeUtf8File,
        fixture.git,
      );
      const inventory = JSON.parse(await readUtf8File(output));
      expect(inventory).toMatchObject({
        generatedBy: "inventory:tests",
        schemaVersion: 1,
        summary: { CppunitTest: 415, JunitTest: 58, PythonTest: 13, UITest: 79 },
      });
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 30_000);
});

/**
 * Expects strict test CLI parsing to reject invalid arguments.
 *
 * @param argumentsList - Invalid test-inventory argument sequence.
 * @returns Nothing; assertion validates expected error behavior.
 */
function expectOptionError(argumentsList: readonly string[]): void {
  expect(
    /**
     * Invokes parsing under the expected error assertion.
     *
     * @returns Parsing result that never returns for invalid arguments.
     */
    function parseInvalidOptions(): unknown {
      return parseTestCliOptions(argumentsList);
    },
  ).toThrowError();
}
