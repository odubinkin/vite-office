/**
 * @fileoverview Verifies strict parsing, approved exceptions, deterministic evidence resolution, and failure diagnostics for atomic parity mappings.
 */

import { describe, expect, it } from "vitest";

import type { BaselineManifest } from "./contracts";
import { parseParityMappingManifest, validateParityMappingEvidence } from "./parity-mappings";

/** Provides the narrow baseline fields consumed by the mapping parser. */
const baseline = { commit: "pinned-commit", tag: "pinned-tag" } as BaselineManifest;

/**
 * Provides one valid deterministic mapping source with caller-selected overrides.
 *
 * @param overrides - Top-level JSON fields replacing the default valid document values.
 * @returns Serialized mapping JSON source.
 */
function createManifestSource(overrides: Readonly<Record<string, unknown>> = {}): string {
  return JSON.stringify({
    baselineCommit: "pinned-commit",
    baselineTag: "pinned-tag",
    records: [createRecord("LO-WRITER-0101")],
    schemaVersion: 3,
    ...overrides,
  });
}

/**
 * Creates source, test, and documentation evidence with unique stable markers.
 *
 * @param prefix - Prefix that makes synthetic evidence markers and paths unambiguous.
 * @returns Serializable evidence object.
 */
function createEvidence(prefix: string): Record<string, unknown> {
  return {
    docs: [{ marker: `${prefix}-docs`, path: `${prefix}-docs.md` }],
    implementation: [{ marker: `${prefix}-implementation`, path: `${prefix}-implementation.ts` }],
    tests: [{ marker: `${prefix}-tests`, path: `${prefix}-tests.ts` }],
  };
}

describe("parity mappings" /**
 * Groups strict mapping contract and evidence resolution tests.
 *
 * @returns Nothing; Vitest registers the enclosed test cases.
 */, function defineParityMappingTests(): void {
  it("parses a pinned implemented mapping and resolves all local and upstream evidence" /**
   * Verifies the report preserves fixed evidence order, baseline identity, and visible gaps.
   *
   * @returns A promise resolving after all injected evidence references are read.
   */, async function parsesAndResolvesMapping(): Promise<void> {
    const manifest = parseParityMappingManifest(createManifestSource(), baseline);
    const report = await validateParityMappingEvidence(
      manifest,
      /**
       * Returns evidence text whose marker is derived from the requested synthetic path.
       *
       * @param path - Rooted synthetic local or upstream evidence path.
       * @returns A promise resolving to text that contains the declared marker.
       */
      async function readSyntheticEvidence(path: string): Promise<string> {
        return path.replace(/^(local-root|upstream-root)\//, "").replace(/\.(md|ts)$/, "");
      },
      { local: "local-root", upstream: "upstream-root" },
    );
    expect(report).toEqual({
      baselineCommit: "pinned-commit",
      exceptionCount: 0,
      exceptions: [],
      gapCount: 1,
      implementedCount: 1,
      recordCount: 1,
      resolvedEvidence: [
        { kind: "implementation", path: "local-implementation.ts", side: "local" },
        { kind: "tests", path: "local-tests.ts", side: "local" },
        { kind: "docs", path: "local-docs.md", side: "local" },
        { kind: "implementation", path: "upstream-implementation.ts", side: "upstream" },
        { kind: "tests", path: "upstream-tests.ts", side: "upstream" },
        { kind: "docs", path: "upstream-docs.md", side: "upstream" },
      ],
      schemaVersion: 3,
      verifiedCount: 0,
    });
  });

  it("requires exact baseline identity, schema, records, ordered IDs, and complete evidence" /**
   * Verifies malformed documents cannot silently become parity records.
   *
   * @returns Nothing; all invalid inputs throw deterministic errors.
   */, function rejectsInvalidDocumentContracts(): void {
    expectInvalid("{");
    expectInvalid("[]");
    expectInvalid(createManifestSource({ schemaVersion: 1 }));
    expectInvalid(createManifestSource({ baselineCommit: "other" }));
    expectInvalid(createManifestSource({ baselineTag: "other" }));
    expectInvalid(createManifestSource({ records: [] }));
    expectInvalid(
      createManifestSource({
        records: [createRecord("LO-WRITER-0102"), createRecord("LO-WRITER-0101")],
      }),
    );
    expectInvalid(createManifestSource({ records: [{ id: "invalid" }] }));
    expectInvalid(createManifestSource({ records: [null] }));
    expectInvalid(
      createManifestSource({ records: [{ ...createRecord("LO-WRITER-0101"), maturity: "bad" }] }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), aspect: "umbrella" }],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), atomicOperation: "" }],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), gaps: ["gap"], maturity: "verified" }],
      }),
    );
    expectInvalid(
      createManifestSource({ records: [{ ...createRecord("LO-WRITER-0101"), local: [] }] }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            local: { ...createEvidence("local"), docs: [] },
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({ records: [{ ...createRecord("LO-WRITER-0101"), gaps: [""] }] }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            local: { ...createEvidence("local"), tests: [null] },
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), capabilityId: "LO-WRITER-0101" }],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          createRecord("LO-WRITER-0101"),
          { ...createRecord("LO-WRITER-0102"), capabilityId: "CAP-0101" },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), assertions: [] }],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), assertions: [], manualContract: "" }],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), suite: "format" }],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), type: "macro" }],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), stackDivergence: null }],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            stackDivergence: { kind: "native-reuse", rationale: "Not allowlisted." },
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            gaps: [],
            maturity: "verified",
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            assertionEvidence: createAssertionEvidence(
              "The pinned upstream test asserts the bounded Writer command behavior.",
            ),
            gaps: [],
            maturity: "verified",
            verification: null,
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            assertionEvidence: createAssertionEvidence(
              "The pinned upstream test asserts the bounded Writer command behavior.",
            ),
            gaps: [],
            maturity: "verified",
            verification: { ...createVerification(), commit: "not-a-hash" },
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            assertionEvidence: createAssertionEvidence(
              "The pinned upstream test asserts the bounded Writer command behavior.",
            ),
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            assertionEvidence: createAssertionEvidence(
              "The pinned upstream test asserts the bounded Writer command behavior.",
            ),
            gaps: [],
            maturity: "verified",
          },
        ],
      }),
    );
  });

  it("accepts every Stage 0 suite, type, maturity, and stack-divergence value" /**
   * Verifies the full closed schema vocabulary, manual contracts, and verified reporting.
   *
   * @returns A promise resolving after the vocabulary report is checked.
   */, async function acceptsSchemaVocabulary(): Promise<void> {
    const exception = {
      approvedBy: "user decision",
      disposition: "not-implementable",
      rationale: "Native integration has no browser counterpart.",
      reason: "browser-runtime-inapplicable",
    };
    const coordinates = [
      ["LO-BASE-0001", "CAP-0001", "base", "command", "planned", "none"],
      ["LO-CALC-0002", "CAP-0002", "calc", "model", "mapped", "browser-adaptation"],
      ["LO-CHART-0003", "CAP-0003", "chart", "filter", "implemented", "local-infrastructure"],
      ["LO-DRAW-0004", "CAP-0004", "draw", "platform", "verified", "none"],
      ["LO-IMPRESS-0005", "CAP-0005", "impress", "lifecycle", "planned", "none"],
      ["LO-MATH-0006", "CAP-0006", "math", "infrastructure", "mapped", "none"],
      ["LO-SHARED-0007", "CAP-0007", "shared", "command", "implemented", "none"],
      ["LO-WRITER-0008", "CAP-0008", "writer", "model", "exception-approved", "none"],
    ] as const;
    const records = coordinates.map(
      /**
       * Creates one valid record exercising the selected schema coordinates.
       * @param coordinate - ID, ownership, maturity, and divergence tuple.
       * @param index - Tuple index used to select the manual-contract fixture.
       * @returns Valid authored parity record.
       */
      function createVocabularyRecord(coordinate, index) {
        const [id, capabilityId, suite, type, maturity, kind] = coordinate;
        const isClosed = maturity === "verified" || maturity === "exception-approved";
        return {
          ...createRecord(id),
          assertions: index === 0 ? [] : ["Mapped assertion."],
          ...(maturity === "verified"
            ? { assertionEvidence: createAssertionEvidence("Mapped assertion.") }
            : {}),
          capabilityId,
          ...(maturity === "exception-approved" ? { exception } : {}),
          gaps: maturity === "verified" ? [] : ["Visible gap."],
          ...(index === 0 ? { manualContract: "Review the bounded behavior manually." } : {}),
          maturity,
          stackDivergence: { kind, rationale: "Reviewed Stage 0 classification." },
          suite,
          type,
          ...(isClosed ? { verification: createVerification() } : {}),
        };
      },
    );
    const manifest = parseParityMappingManifest(createManifestSource({ records }), baseline);
    const report = await validateParityMappingEvidence(
      manifest,
      /**
       * Returns synthetic evidence containing its marker.
       * @param path - Rooted synthetic evidence path.
       * @returns A promise resolving to marker-bearing content.
       */
      async function readVocabularyEvidence(path: string): Promise<string> {
        return path.replace(/^(local-root|upstream-root)\//, "").replace(/\.(md|ts)$/, "");
      },
      { local: "local-root", upstream: "upstream-root" },
    );
    expect(report).toMatchObject({ implementedCount: 2, recordCount: 8, verifiedCount: 1 });
    expect(manifest.records[0]?.manualContract).toBe("Review the bounded behavior manually.");
    expect(manifest.records[3]?.verification).toEqual(createVerification());
  });

  it("requires and resolves assertion-level local and upstream evidence before verification" /**
   * Proves a verified claim cannot be inferred from implementation and test-file existence alone.
   * @returns A promise resolving after valid and malformed assertion evidence is exercised.
   */, async function validatesAssertionEvidence(): Promise<void> {
    const assertion = "The pinned upstream test asserts the bounded Writer command behavior.";
    const verified = {
      ...createRecord("LO-WRITER-0101"),
      assertionEvidence: createAssertionEvidence(assertion),
      gaps: [],
      maturity: "verified",
      verification: createVerification(),
    };
    const manifest = parseParityMappingManifest(
      createManifestSource({ records: [verified] }),
      baseline,
    );
    const report = await validateParityMappingEvidence(
      manifest,
      /** Returns marker-bearing assertion evidence. @param path - Rooted fixture path. @returns Synthetic evidence text. */
      async function readAssertionEvidence(path): Promise<string> {
        return path.replace(/^(local-root|upstream-root)\//, "").replace(/\.(md|ts)$/, "");
      },
      { local: "local-root", upstream: "upstream-root" },
    );
    expect(report.verifiedCount).toBe(1);
    expect(report.resolvedEvidence.slice(-2)).toEqual([
      { kind: "tests", path: "local-tests.ts", side: "local" },
      { kind: "tests", path: "upstream-tests.ts", side: "upstream" },
    ]);
    expectInvalid(createManifestSource({ records: [{ ...verified, assertionEvidence: [] }] }));
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...verified,
            assertionEvidence: createAssertionEvidence("A different assertion."),
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...verified,
            assertionEvidence: [
              {
                assertion,
                local: {
                  exception: { approvedBy: "n/a" },
                  marker: "local-tests",
                  path: "local-tests.ts",
                },
                upstream: { marker: "upstream-tests", path: "upstream-tests.ts" },
              },
            ],
          },
        ],
      }),
    );
    expectInvalid(createManifestSource({ records: [{ ...verified, assertionEvidence: [null] }] }));
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...verified,
            assertionEvidence: [
              {
                assertion,
                local: null,
                upstream: { marker: "upstream-tests", path: "upstream-tests.ts" },
              },
            ],
          },
        ],
      }),
    );
  });

  it("requires auditable exceptions for whole capabilities and individual evidence references" /**
   * Verifies browser-environment exceptions cannot conceal missing approval or rationale.
   *
   * @returns Nothing; accepted and rejected exception shapes are asserted.
   */, function validatesExceptionEvidence(): void {
    const exception = {
      approvedBy: "user decision",
      disposition: "not-implementable",
      rationale: "Browser API is stronger.",
      reason: "browser-runtime-supersedes",
    };
    expect(
      parseParityMappingManifest(
        createManifestSource({
          records: [
            {
              ...createRecord("LO-WRITER-0101"),
              exception,
              gaps: ["Explicitly approved."],
              local: { ...createEvidence("local"), implementation: [], tests: [] },
              maturity: "exception-approved",
              verification: createVerification(),
            },
          ],
        }),
        baseline,
      ).records[0]?.exception,
    ).toEqual(exception);
    expect(
      parseParityMappingManifest(
        createManifestSource({
          records: [
            {
              ...createRecord("LO-WRITER-0101"),
              upstream: {
                ...createEvidence("upstream"),
                tests: [{ exception, marker: "upstream-tests", path: "upstream-tests.ts" }],
              },
            },
          ],
        }),
        baseline,
      ).records[0]?.upstream.tests[0]?.exception,
    ).toEqual(exception);
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            exception: { ...exception, disposition: "implemented" },
            gaps: ["Explicitly approved."],
            maturity: "exception-approved",
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            upstream: {
              ...createEvidence("upstream"),
              implementation: [
                {
                  exception,
                  marker: "upstream-implementation",
                  path: "upstream-implementation.ts",
                },
              ],
            },
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), maturity: "exception-approved" }],
      }),
    );
    expectInvalid(
      createManifestSource({ records: [{ ...createRecord("LO-WRITER-0101"), exception }] }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            exception,
            gaps: [],
            maturity: "exception-approved",
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            exception: { ...exception, approvedBy: "" },
            maturity: "exception-approved",
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            exception: { ...exception, reason: "not-a-browser-reason" },
            gaps: ["Explicitly approved."],
            maturity: "exception-approved",
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          { ...createRecord("LO-WRITER-0101"), exception: null, maturity: "exception-approved" },
        ],
      }),
    );
  });

  it("reports non-implementable capabilities and upstream tests separately from resolved coverage" /**
   * Verifies auditable exception counts retain the approved metadata and the upstream test identity.
   *
   * @returns A promise resolving after deterministic exception reporting is asserted.
   */, async function reportsExceptions(): Promise<void> {
    const capabilityException = {
      approvedBy: "Task 42",
      disposition: "not-implementable",
      rationale: "The browser owns this lifecycle.",
      reason: "browser-runtime-inapplicable",
    } as const;
    const testException = {
      approvedBy: "Task 43",
      disposition: "not-implementable",
      rationale: "The Clipboard API subsumes native clipboard plumbing.",
      reason: "browser-runtime-supersedes",
    } as const;
    const manifest = parseParityMappingManifest(
      createManifestSource({
        records: [
          {
            ...createRecord("LO-WRITER-0101"),
            exception: capabilityException,
            gaps: ["Browser runtime exception."],
            local: { ...createEvidence("local"), implementation: [], tests: [] },
            maturity: "exception-approved",
            verification: createVerification(),
            upstream: {
              ...createEvidence("upstream"),
              tests: [
                { exception: testException, marker: "upstream-tests", path: "upstream-tests.ts" },
              ],
            },
          },
        ],
      }),
      baseline,
    );
    const report = await validateParityMappingEvidence(
      manifest,
      /**
       * Returns evidence text whose marker is derived from the requested synthetic path.
       *
       * @param path - Rooted synthetic local or upstream evidence path.
       * @returns A promise resolving to text that contains the declared marker.
       */
      async function readSyntheticEvidence(path: string): Promise<string> {
        return path.replace(/^(local-root|upstream-root)\//, "").replace(/\.(md|ts)$/, "");
      },
      { local: "local-root", upstream: "upstream-root" },
    );
    expect(report.exceptionCount).toBe(2);
    expect(report.exceptions).toEqual([
      { exception: capabilityException, id: "LO-WRITER-0101", scope: "capability" },
      {
        exception: testException,
        id: "LO-WRITER-0101",
        reference: {
          exception: testException,
          marker: "upstream-tests",
          path: "upstream-tests.ts",
        },
        scope: "upstream-test",
      },
    ]);
  });

  it("reports an absent evidence marker after the path reader succeeds" /**
   * Verifies a readable but imprecise path cannot be treated as a valid test or source reference.
   *
   * @returns A promise resolving after the expected rejection is asserted.
   */, async function rejectsMissingEvidenceMarker(): Promise<void> {
    const manifest = parseParityMappingManifest(createManifestSource(), baseline);
    await expect(
      validateParityMappingEvidence(
        manifest,
        /**
         * Returns text with no declared marker.
         *
         * @returns A promise resolving to unrelated evidence text.
         */
        async function readMissingMarker(): Promise<string> {
          return "unrelated";
        },
        { local: "local-root", upstream: "upstream-root" },
      ),
    ).rejects.toThrowError("Parity local implementation marker is absent");
  });
});

/**
 * Creates a full valid record for targeted schema mutations.
 *
 * @param id - Immutable Writer parity identifier to place in the record.
 * @returns Serializable valid mapping record.
 */
function createRecord(id: string): Record<string, unknown> {
  return {
    aspect: "command-state",
    atomicOperation: "Dispatch one bounded Writer command and query its state",
    assertions: ["The pinned upstream test asserts the bounded Writer command behavior."],
    capability: "A bounded Writer command",
    capabilityId: id.replace("LO-WRITER", "CAP"),
    gaps: ["Browser behavior is intentionally narrower."],
    id,
    local: createEvidence("local"),
    maturity: "implemented",
    stackDivergence: {
      kind: "browser-adaptation",
      rationale: "The browser supplies the platform integration boundary.",
    },
    subsystem: "test",
    suite: "writer",
    type: "command",
    upstream: createEvidence("upstream"),
  };
}

/** Creates exact local and upstream test references. @param assertion - Exact assertion text. @returns Evidence pairs. */
function createAssertionEvidence(assertion: string): readonly Record<string, unknown>[] {
  return [
    {
      assertion,
      local: { marker: "local-tests", path: "local-tests.ts" },
      upstream: { marker: "upstream-tests", path: "upstream-tests.ts" },
    },
  ];
}

/** Creates complete closure evidence for exception and verified-record fixtures. @returns Valid closure evidence. */
function createVerification(): Record<string, string> {
  return { commit: "abcdef1", evidence: "npm test passed", taskId: "TASK-1" };
}

/**
 * Expects a malformed source to fail strict mapping parsing.
 *
 * @param sourceText - Invalid mapping JSON source to parse under the failure assertion.
 * @returns Nothing; the expectation records the parser failure.
 */
function expectInvalid(sourceText: string): void {
  expect(
    /**
     * Parses invalid source under the expected failure assertion.
     *
     * @returns A parsing result that never returns for malformed input.
     */
    function parseInvalidSource(): unknown {
      return parseParityMappingManifest(sourceText, baseline);
    },
  ).toThrowError();
}
