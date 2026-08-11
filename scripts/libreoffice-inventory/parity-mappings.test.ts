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
    records: [
      {
        capability: "A bounded Writer command",
        gaps: ["Browser behavior is intentionally narrower."],
        id: "LO-WRITER-0101",
        local: createEvidence("local"),
        status: "implemented",
        upstream: createEvidence("upstream"),
      },
    ],
    schemaVersion: 1,
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
      resolvedEvidence: [
        { kind: "implementation", path: "local-implementation.ts", side: "local" },
        { kind: "tests", path: "local-tests.ts", side: "local" },
        { kind: "docs", path: "local-docs.md", side: "local" },
        { kind: "implementation", path: "upstream-implementation.ts", side: "upstream" },
        { kind: "tests", path: "upstream-tests.ts", side: "upstream" },
        { kind: "docs", path: "upstream-docs.md", side: "upstream" },
      ],
      schemaVersion: 1,
    });
  });

  it("requires exact baseline identity, schema, records, ordered IDs, and complete evidence" /**
   * Verifies malformed documents cannot silently become parity records.
   *
   * @returns Nothing; all invalid inputs throw deterministic errors.
   */, function rejectsInvalidDocumentContracts(): void {
    expectInvalid("{");
    expectInvalid("[]");
    expectInvalid(createManifestSource({ schemaVersion: 2 }));
    expectInvalid(createManifestSource({ baselineCommit: "other" }));
    expectInvalid(createManifestSource({ baselineTag: "other" }));
    expectInvalid(createManifestSource({ records: [] }));
    expectInvalid(
      createManifestSource({
        records: [createRecord("LO-WRITER-0102"), createRecord("LO-WRITER-0101")],
      }),
    );
    expectInvalid(createManifestSource({ records: [{ id: "LO-CALC-0101" }] }));
    expectInvalid(createManifestSource({ records: [null] }));
    expectInvalid(
      createManifestSource({ records: [{ ...createRecord("LO-WRITER-0101"), status: "bad" }] }),
    );
    expectInvalid(
      createManifestSource({
        records: [{ ...createRecord("LO-WRITER-0101"), gaps: ["gap"], status: "mapped" }],
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
              status: "exception-approved",
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
            status: "exception-approved",
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
        records: [{ ...createRecord("LO-WRITER-0101"), status: "exception-approved" }],
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
            status: "exception-approved",
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
            status: "exception-approved",
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
            status: "exception-approved",
          },
        ],
      }),
    );
    expectInvalid(
      createManifestSource({
        records: [
          { ...createRecord("LO-WRITER-0101"), exception: null, status: "exception-approved" },
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
            status: "exception-approved",
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
    capability: "A bounded Writer command",
    gaps: ["Browser behavior is intentionally narrower."],
    id,
    local: createEvidence("local"),
    status: "implemented",
    upstream: createEvidence("upstream"),
  };
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
