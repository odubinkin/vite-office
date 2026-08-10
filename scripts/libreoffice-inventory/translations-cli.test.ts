/**
 * @fileoverview Verifies strict PO catalog CLI options and real generation against the pinned ignored translations corpus.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

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

  it("runs the production Git and filesystem path to write every pinned PO catalog" /**
   * Verifies default Git execution and UTF-8 wrappers against the ignored pinned translations checkout.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const directory = await mkdtemp(
      path.join(tmpdir(), "vite-office-translation-catalog-inventory-"),
    );
    const output = path.join(directory, "translation-catalogs.json");
    try {
      await runTranslationCatalogCli(
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
        corpusId: "translations",
        generatedBy: "inventory:translations",
        schemaVersion: 1,
        translationsCommit: "362fd2cb41c5404e3712db9fad55b2357001e1f3",
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
