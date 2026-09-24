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
  "--runtime-inventory",
  "docs/program/parity/runtime-inventory.json",
  "--runtime-root",
  "apps/office/src",
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
      "--runtime-inventory",
      "r",
      "--runtime-root",
      "src",
      "--local-root",
      ".",
      "--upstream-root",
      "u",
    ]);
    expectInvalidOptions([
      "--baseline",
      "--mappings",
      "z",
      "--runtime-inventory",
      "r",
      "--runtime-root",
      "src",
      "--local-root",
      ".",
      "--upstream-root",
      "u",
    ]);
  });

  it("reads the pinned Writer mapping and reports bounded unresolved ODT parity" /**
   * Verifies production reading preserves atomic ODT gaps while resolving all declared local, upstream, and divergence evidence without writing a repository file.
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
      behaviorParityCount: 43,
      classifiedDivergenceCount: 105,
      contractParityCount: 43,
      defaultParityCount: 43,
      differentialParityCount: 43,
      exceptionCount: 2,
      gapCount: 2,
      implementedCount: 43,
      ownershipParityCount: 43,
      parityReady: true,
      recordCount: 45,
      runtime: {
        commandCount: 41,
        placeholderSuiteCount: 6,
        schemaVersion: 3,
        semanticViolationCount: 0,
      },
      schemaVersion: 6,
      scopeLimitationCount: 74,
      serializationParityCount: 43,
      unclassifiedDivergenceCount: 0,
      unresolvedParityCount: 0,
      verifiedCount: 43,
    });
  }, 30_000);

  it("closes the umbrella ODT compatibility record with pinned fixture evidence" /**
   * Prevents a package checksum assertion from standing in for the complete bounded ODT round trip.
   * @returns A promise resolving after the production manifest is inspected.
   */, async function rejectsUmbrellaOdtVerification(): Promise<void> {
    const manifest = JSON.parse(
      await readUtf8File("docs/program/parity/writer-command-slice.json"),
    ) as Readonly<{ records: readonly Record<string, unknown>[] }>;
    const umbrella = manifest.records.find(
      /** Finds the compatibility umbrella. @param record - Candidate manifest record. @returns Whether this is CAP-0130. */ (
        record,
      ) => record.id === "LO-WRITER-0130",
    );
    expect(umbrella).toMatchObject({
      assertionEvidence: [
        {
          local: {
            marker: "pinned LibreOffice ODT feature fixtures",
            path: "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
          },
        },
      ],
      behaviorParity: true,
      contractParity: true,
      defaultParity: true,
      maturity: "verified",
      verified: true,
    });
    expect(umbrella).toHaveProperty("closure");
    expect(umbrella).toHaveProperty("verification");
  });
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
