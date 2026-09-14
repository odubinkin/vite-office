/** @fileoverview Verifies strict responsibility-, symbol-, evidence-, and runtime-classification provenance. */

import { describe, expect, it } from "vitest";

import {
  parseSourceProvenanceManifest,
  validateSourceProvenanceManifest,
} from "./check-source-provenance";

const baseline = { commit: "pinned-commit", tag: "pinned-tag" };
const writerPath = "apps/office/src/sw/source/core/doc/writer.ts";
const mainPath = "apps/office/src/main.tsx";

/** Creates one valid strict schema-v2 fixture. @param overrides - Top-level overrides. @returns Serialized manifest. */
function createManifestSource(overrides: Readonly<Record<string, unknown>> = {}): string {
  return JSON.stringify({
    baselineCommit: baseline.commit,
    baselineTag: baseline.tag,
    entries: [mappedEntry(), localEntry()],
    filenameDivergences: [
      {
        localPath: writerPath,
        rationale:
          "The local Writer aggregate exposes a bounded construction helper while the upstream constructor remains owned by docnew.cxx, so the distinct filename is intentional and reviewable.",
      },
    ],
    schemaVersion: 2,
    ...overrides,
  });
}

/** Creates one valid exact-symbol upstream mapping. @param overrides - Entry overrides. @returns Mapped entry. */
function mappedEntry(overrides: Readonly<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    classification: "upstream-mechanism",
    evidence: {
      local: [{ marker: "createWriterDocument", path: writerPath }],
      upstream: [
        {
          marker: "SwDoc::SwDoc",
          path: "vendor/libreoffice-reference/sw/source/core/doc/docnew.cxx",
        },
      ],
    },
    localPath: writerPath,
    localSymbols: ["createWriterDocument"],
    omittedResponsibilities: ["Native document-shell attachment is outside this bounded helper."],
    preservedResponsibilities: ["Construct the canonical Writer document graph."],
    status: "mapped",
    upstreamPath: "vendor/libreoffice-reference/sw/source/core/doc/docnew.cxx",
    upstreamSymbols: ["SwDoc::SwDoc"],
    ...overrides,
  };
}

/** Creates one valid explicit local-only browser adapter. @param overrides - Entry overrides. @returns Local-only entry. */
function localEntry(overrides: Readonly<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    classification: "browser-adaptation",
    evidence: { local: [{ marker: "mountApplication", path: mainPath }] },
    localPath: mainPath,
    rationale:
      "Vite and React mount into a browser DOM root; the native LibreOffice process bootstrap cannot be claimed as a source-file implementation for this adapter.",
    responsibilities: ["Mount the application into the supplied browser DOM root."],
    stackDivergence: {
      kind: "browser-adaptation",
      rationale: "The browser DOM and React replace the native application window bootstrap.",
    },
    status: "local-only",
    ...overrides,
  };
}

/** Returns exact synthetic source text. @param path - Fixture path. @returns Matching source text. */
async function readFixture(path: string): Promise<string> {
  const sources: Readonly<Record<string, string>> = {
    [mainPath]: "export function mountApplication() {}",
    [writerPath]: "export function createWriterDocument() {}",
    "vendor/libreoffice-reference/sw/source/core/doc/docnew.cxx": "SwDoc::SwDoc() {}",
  };
  const source = sources[path];
  if (source === undefined) throw new Error(`Missing fixture path: ${path}`);
  return source;
}

/** Parses malformed source under a rejection assertion. @param sourceText - Invalid JSON source. @returns Nothing. */
function expectInvalid(sourceText: string): void {
  expect(
    /** Parses an invalid manifest. @returns A result that should never be produced. */
    function parseInvalid(): unknown {
      return parseSourceProvenanceManifest(sourceText, baseline);
    },
  ).toThrowError();
}

describe("source provenance" /** Defines strict provenance test cases. @returns Nothing. */, function defineSourceProvenanceTests(): void {
  it("validates exhaustive exact-symbol provenance against runtime classifications" /** Validates the complete successful fixture. @returns Completion after validation. */, async function validatesManifest(): Promise<void> {
    const manifest = parseSourceProvenanceManifest(createManifestSource(), baseline);
    await expect(
      validateSourceProvenanceManifest(
        manifest,
        [
          { classification: "upstream-mechanism", path: writerPath },
          { classification: "browser-adaptation", path: mainPath },
        ],
        readFixture,
      ),
    ).resolves.toEqual({
      browserAdaptationCount: 1,
      localInfrastructureCount: 0,
      mappedCount: 1,
      moduleCount: 2,
    });
  });

  it("rejects malformed contracts before filesystem validation" /** Rejects malformed schema shapes. @returns Nothing. */, function rejectsMalformed(): void {
    expectInvalid("{");
    expectInvalid(createManifestSource({ baselineCommit: "other" }));
    expectInvalid(createManifestSource({ schemaVersion: 1 }));
    expectInvalid(createManifestSource({ entries: [] }));
    expectInvalid(createManifestSource({ filenameDivergences: undefined }));
    expectInvalid(createManifestSource({ entries: [mappedEntry({ localSymbols: [] })] }));
    expectInvalid(createManifestSource({ entries: [mappedEntry({ upstreamSymbols: [] })] }));
    expectInvalid(
      createManifestSource({ entries: [mappedEntry({ preservedResponsibilities: [] })] }),
    );
    expectInvalid(
      createManifestSource({ entries: [mappedEntry({ omittedResponsibilities: [] })] }),
    );
    expectInvalid(
      createManifestSource({
        entries: [mappedEntry({ classification: "browser-adaptation" })],
      }),
    );
    expectInvalid(createManifestSource({ entries: [localEntry({ rationale: "too short" })] }));
    expectInvalid(
      createManifestSource({
        entries: [
          localEntry({ stackDivergence: { kind: "local-infrastructure", rationale: "Mismatch." } }),
        ],
      }),
    );
  });

  it("rejects coverage, classification, symbol, marker, and basename-only claims" /** Rejects insufficient runtime and source evidence. @returns Completion after all rejection assertions. */, async function rejectsWeakEvidence(): Promise<void> {
    const manifest = parseSourceProvenanceManifest(createManifestSource(), baseline);
    await expect(
      validateSourceProvenanceManifest(
        manifest,
        [{ classification: "upstream-mechanism", path: writerPath }],
        readFixture,
      ),
    ).rejects.toThrowError(/coverage mismatch/u);
    await expect(
      validateSourceProvenanceManifest(
        manifest,
        [
          { classification: "local-infrastructure", path: writerPath },
          { classification: "browser-adaptation", path: mainPath },
        ],
        readFixture,
      ),
    ).rejects.toThrowError(/classification mismatch/u);
    const absentSymbol = parseSourceProvenanceManifest(
      createManifestSource({
        entries: [mappedEntry({ upstreamSymbols: ["MissingSymbol"] }), localEntry()],
      }),
      baseline,
    );
    await expect(
      validateSourceProvenanceManifest(
        absentSymbol,
        [
          { classification: "upstream-mechanism", path: writerPath },
          { classification: "browser-adaptation", path: mainPath },
        ],
        readFixture,
      ),
    ).rejects.toThrowError(/upstream symbols are absent/u);
    const absentMarker = parseSourceProvenanceManifest(
      createManifestSource({
        entries: [
          mappedEntry({
            evidence: {
              local: [{ marker: "MissingMarker", path: writerPath }],
              upstream: [
                {
                  marker: "SwDoc::SwDoc",
                  path: "vendor/libreoffice-reference/sw/source/core/doc/docnew.cxx",
                },
              ],
            },
          }),
          localEntry(),
        ],
      }),
      baseline,
    );
    await expect(
      validateSourceProvenanceManifest(
        absentMarker,
        [
          { classification: "upstream-mechanism", path: writerPath },
          { classification: "browser-adaptation", path: mainPath },
        ],
        readFixture,
      ),
    ).rejects.toThrowError(/evidence marker is absent/u);
    const basenameOnly = parseSourceProvenanceManifest(
      createManifestSource({
        entries: [mappedEntry({ upstreamSymbols: ["docnew"] }), localEntry()],
      }),
      baseline,
    );
    await expect(
      validateSourceProvenanceManifest(
        basenameOnly,
        [
          { classification: "upstream-mechanism", path: writerPath },
          { classification: "browser-adaptation", path: mainPath },
        ],
        /** Returns basename-only evidence for the upstream fixture. @param path - Fixture path. @returns Synthetic evidence. */
        async function readBasenameFixture(path): Promise<string> {
          return path.endsWith("docnew.cxx") ? "docnew" : readFixture(path);
        },
      ),
    ).rejects.toThrowError(/basename similarity/u);
  });
});
