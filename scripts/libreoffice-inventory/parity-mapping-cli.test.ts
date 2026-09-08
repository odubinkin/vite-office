/**
 * @fileoverview Verifies strict parity-mapping CLI options and the production read-only validation path against the pinned Writer command manifest.
 */

import { describe, expect, it } from "vitest";

import {
  parseParityMappingCliOptions,
  readUtf8File,
  runParityMappingCli,
} from "./parity-mapping-cli";

/** Defines the complete real command argument sequence used by production validation. */
const validArguments = [
  "--baseline",
  "docs/program/libreoffice-baseline.json",
  "--mappings",
  "docs/program/parity/writer-command-slice.json",
  "--local-root",
  ".",
  "--upstream-root",
  "vendor/libreoffice-reference",
] as const;

describe("parity mapping CLI" /**
 * Groups strict command option and production read-only validation tests.
 *
 * @returns Nothing; Vitest registers enclosed tests.
 */, function defineParityMappingCliTests(): void {
  it("accepts complete flags and rejects unknown, repeated, and incomplete arguments" /**
   * Verifies callers must identify every root explicitly and cannot silently reuse an ambiguous path.
   *
   * @returns Nothing; valid options and expected failures are asserted.
   */, function parsesStrictOptions(): void {
    expect(parseParityMappingCliOptions(validArguments)).toMatchObject({ localRoot: "." });
    expectInvalidOptions(["--unknown", "x"]);
    expectInvalidOptions(["--baseline", "x"]);
    expectInvalidOptions([
      "--baseline",
      "x",
      "--baseline",
      "y",
      "--mappings",
      "z",
      "--local-root",
      ".",
      "--upstream-root",
      "u",
    ]);
    expectInvalidOptions([
      "--baseline",
      "--mappings",
      "z",
      "--local-root",
      ".",
      "--upstream-root",
      "u",
    ]);
  });

  it("reads the pinned Writer mapping and emits an explicit-gap report" /**
   * Verifies production reading resolves local and ignored-reference evidence without writing a repository file.
   *
   * @returns A promise resolving after the report is captured and inspected.
   */, async function runsProductionValidation(): Promise<void> {
    let output = "";
    await runParityMappingCli(
      validArguments,
      readUtf8File,
      /**
       * Captures the canonical report emitted by the read-only CLI.
       *
       * @param nextOutput - Canonical report JSON with a trailing newline.
       * @returns Nothing after replacing the test-owned output buffer.
       */
      function captureOutput(nextOutput: string): void {
        output = nextOutput;
      },
    );
    expect(JSON.parse(output)).toMatchObject({
      baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
      exceptionCount: 0,
      gapCount: 26,
      schemaVersion: 1,
    });
  }, 30_000);
});

/**
 * Expects an invalid CLI argument sequence to throw a strict usage error.
 *
 * @param argumentsList - Invalid candidate command arguments.
 * @returns Nothing; the expectation records the parser failure.
 */
function expectInvalidOptions(argumentsList: readonly string[]): void {
  expect(
    /**
     * Parses invalid command arguments under the expected failure assertion.
     *
     * @returns A parsing result that never returns for invalid arguments.
     */
    function parseInvalidOptions(): unknown {
      return parseParityMappingCliOptions(argumentsList);
    },
  ).toThrowError();
}
