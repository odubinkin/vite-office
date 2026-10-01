/**
 * @fileoverview Verifies strict dictionary inventory CLI options and owned fixture generation.
 */

import { rm } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createInventoryCliFixture } from "../test-fixtures/inventory-reference";

import {
  parseDictionaryFileCliOptions,
  readUtf8File,
  runDictionaryFileCli,
  writeUtf8File,
} from "./dictionaries-cli";

describe("dictionary file inventory CLI" /**
 * Groups strict option validation and production local generation cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineDictionaryCliTests(): void {
  it("accepts required paths and rejects malformed option input" /**
   * Verifies callers cannot silently select unintended inputs or output paths.
   *
   * @returns Nothing; assertions validate strict option parsing.
   */, function parsesOptions(): void {
    expect(
      parseDictionaryFileCliOptions(["--baseline", "a", "--reference-root", "b", "--output", "c"]),
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
   * Verifies fixture Git paths and real UTF-8 boundaries without the pinned dictionaries checkout.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const fixture = await createInventoryCliFixture();
    const { directory } = fixture;
    const output = path.join(directory, "dictionary-files.json");
    try {
      await runDictionaryFileCli(
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
        corpusId: "dictionaries",
        dictionariesCommit: "fixture-dictionaries-commit",
        generatedBy: "inventory:dictionaries",
        schemaVersion: 1,
        summary: { aff: 98, dic: 147 },
      });
      expect(inventory.records).toHaveLength(245);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 30_000);
});

/**
 * Expects strict dictionary CLI parsing to reject invalid arguments.
 *
 * @param argumentsList - Invalid dictionary inventory argument sequence.
 * @returns Nothing; assertion validates rejection behavior.
 */
function expectOptionError(argumentsList: readonly string[]): void {
  expect(
    /**
     * Invokes parsing under the expected error assertion.
     *
     * @returns Parsing result that never returns for invalid input.
     */
    function parseInvalidOptions(): unknown {
      return parseDictionaryFileCliOptions(argumentsList);
    },
  ).toThrowError();
}
