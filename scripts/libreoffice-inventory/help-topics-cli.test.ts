/**
 * @fileoverview Verifies strict XHP help-topic CLI options and real generation against the pinned ignored help corpus.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  parseHelpTopicCliOptions,
  readUtf8File,
  runHelpTopicCli,
  writeUtf8File,
} from "./help-topics-cli";

describe("help topic inventory CLI" /**
 * Groups strict option and real command execution cases for provenance-only XHP topic metadata.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineHelpTopicCliTests(): void {
  it("accepts required paths and rejects unknown, incomplete, and duplicate options" /**
   * Verifies callers cannot silently select an unintended baseline, checkout, or output destination.
   *
   * @returns Nothing; assertions validate strict option behavior.
   */, function parsesOptions(): void {
    expect(
      parseHelpTopicCliOptions(["--baseline", "a", "--reference-root", "b", "--output", "c"]),
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

  it("runs the production Git and filesystem path to write every pinned XHP topic" /**
   * Verifies default Git execution and UTF-8 wrappers against the ignored pinned help checkout.
   *
   * @returns A promise resolving after temporary output cleanup completes.
   */, async function runsProductionCommand(): Promise<void> {
    const directory = await mkdtemp(path.join(tmpdir(), "vite-office-help-topic-inventory-"));
    const output = path.join(directory, "help-topics.json");
    try {
      await runHelpTopicCli(
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
        corpusId: "helpcontent2",
        generatedBy: "inventory:help-topics",
        schemaVersion: 1,
        summary: {
          sbasic: 433,
          scalc: 513,
          schart: 58,
          sdatabase: 88,
          sdraw: 42,
          shared: 931,
          simpress: 182,
          smath: 76,
          swriter: 423,
        },
      });
      expect(inventory.records).toHaveLength(2_746);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 30_000);
});

/**
 * Expects strict help-topic CLI parsing to reject invalid arguments.
 *
 * @param argumentsList - Invalid help-topic-inventory argument sequence.
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
      return parseHelpTopicCliOptions(argumentsList);
    },
  ).toThrowError();
}
