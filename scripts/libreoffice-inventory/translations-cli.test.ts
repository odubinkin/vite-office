/**
 * @fileoverview Verifies strict PO catalog CLI options and real generation against owned translation path fixtures.
 */

import { rm } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createInventoryCliFixture } from "../test-fixtures/inventory-reference";

import {
  parseTranslationCatalogCliOptions,
  readUtf8File,
  runTranslationCatalogCli,
  writeUtf8File,
} from "./translations-cli";

describe("translation catalog inventory CLI" /**
 * Groups strict option and real command execution cases for provenance-only PO catalog metadata.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineTranslationCatalogCliTests(): void {
  it("accepts required paths and rejects unknown, incomplete, and duplicate options" /**
   * Verifies callers cannot silently select an unintended baseline, checkout, or output destination.
   *
   * @returns Nothing; assertions validate strict option behavior.
   */, function parsesOptions(): void {
    expect(
      parseTranslationCatalogCliOptions([
        "--baseline",
        "a",
        "--reference-root",
        "b",
        "--output",
        "c",
      ]),
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
   * Verifies fixture Git paths and real UTF-8 wrappers without the pinned translations checkout.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const fixture = await createInventoryCliFixture();
    const { directory } = fixture;
    const output = path.join(directory, "translation-catalogs.json");
    try {
      await runTranslationCatalogCli(
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
        corpusId: "translations",
        generatedBy: "inventory:translations",
        schemaVersion: 1,
        translationsCommit: "fixture-translations-commit",
      });
      expect(inventory.records).toHaveLength(25_699);
      expect(Object.keys(inventory.summary)).toHaveLength(131);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 30_000);
});

/**
 * Expects strict translation-catalog CLI parsing to reject invalid arguments.
 *
 * @param argumentsList - Invalid translation-catalog-inventory argument sequence.
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
      return parseTranslationCatalogCliOptions(argumentsList);
    },
  ).toThrowError();
}
