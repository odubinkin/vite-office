/**
 * @fileoverview Verifies strict dictionary inventory CLI options and real pinned-corpus generation.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

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

  it("runs production Git and filesystem paths for every pinned dictionary file" /**
   * Verifies default boundaries against the ignored pinned dictionaries checkout.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const directory = await mkdtemp(path.join(tmpdir(), "vite-office-dictionary-inventory-"));
    const output = path.join(directory, "dictionary-files.json");
    try {
      await runDictionaryFileCli(
        [
          "--baseline",
          "docs/program/libreoffice-baseline.json",
          "--reference-root",
          "vendor/libreoffice-reference",
          "--output",
          output,
        ],
        readUtf8File,
        writeUtf8File,
      );
      const inventory = JSON.parse(await readUtf8File(output));
      expect(inventory).toMatchObject({
        corpusId: "dictionaries",
        dictionariesCommit: "3324dee0a221a5cb67525c533216d33b0aed08e9",
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
