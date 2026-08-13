/**
 * @fileoverview Verifies strict parsing and exhaustive runtime-tree validation for the LibreOffice-derived source-provenance manifest.
 */

import { describe, expect, it } from "vitest";

import {
  parseSourceProvenanceManifest,
  validateSourceProvenanceManifest,
} from "./check-source-provenance";

/** Defines a compact pinned LibreOffice identity used by synthetic provenance manifests. */
const baseline = { commit: "pinned-commit", tag: "pinned-tag" };

/**
 * Creates valid strict source-provenance JSON with optional top-level overrides.
 *
 * @param overrides - Partial source document replacing default valid fields.
 * @returns Serialized strict provenance manifest source.
 */
function createManifestSource(overrides: Readonly<Record<string, unknown>> = {}): string {
  return JSON.stringify({
    baselineCommit: baseline.commit,
    baselineTag: baseline.tag,
    entries: [
      {
        localPath: "apps/office/src/sw/source/core/doc/writer.ts",
        status: "mapped",
        upstreamPath: "sw/source/core/doc/docnew.cxx",
      },
      {
        localPath: "apps/office/src/main.tsx",
        rationale:
          "Browser mounting is specific to Vite and React, so no native LibreOffice file can honestly be treated as an implementation equivalent for this entrypoint.",
        status: "browser-only",
      },
    ],
    schemaVersion: 1,
    ...overrides,
  });
}

/**
 * Parses an intentionally invalid source manifest and expects a deterministic error.
 *
 * @param sourceText - Invalid JSON or structurally invalid manifest source.
 * @returns Nothing; parsing must throw.
 */
function expectInvalidManifest(sourceText: string): void {
  expect(
    /** Executes the invalid parser input. @returns Invalid parsed manifest that always throws. */
    function parsesInvalidManifest() {
      return parseSourceProvenanceManifest(sourceText, baseline);
    },
  ).toThrowError();
}

describe("source provenance" /** Groups complete current runtime source-provenance contract tests. @returns Nothing; Vitest registers enclosed tests. */, function defineSourceProvenanceTests(): void {
  it("parses a pinned manifest and reports complete mapped and browser-only runtime entries" /** Verifies explicit browser-only exceptions remain visible rather than counting as direct mappings. @returns A promise resolved after async upstream validation. */, async function parsesAndValidatesManifest(): Promise<void> {
    const manifest = parseSourceProvenanceManifest(createManifestSource(), baseline);
    await expect(
      validateSourceProvenanceManifest(
        manifest,
        ["apps/office/src/main.tsx", "apps/office/src/sw/source/core/doc/writer.ts"],
        /** Resolves only the declared synthetic mapped upstream path. @param upstreamPath - Candidate synthetic upstream source path. @returns Promise resolving true only for docnew.cxx. */
        async function syntheticUpstreamExists(upstreamPath: string): Promise<boolean> {
          return upstreamPath === "sw/source/core/doc/docnew.cxx";
        },
      ),
    ).resolves.toEqual({ browserOnlyCount: 1, mappedCount: 1, moduleCount: 2 });
  });

  it("rejects malformed baseline, entry, duplicate, missing, stale, and upstream-source evidence" /** Verifies the gate cannot silently accept incomplete or false source ownership claims. @returns A promise resolved after all rejection paths are asserted. */, async function rejectsInvalidProvenance(): Promise<void> {
    expectInvalidManifest("{");
    expectInvalidManifest(createManifestSource({ baselineCommit: "other" }));
    expectInvalidManifest(createManifestSource({ schemaVersion: 2 }));
    expectInvalidManifest(createManifestSource({ entries: [] }));
    expectInvalidManifest(
      createManifestSource({
        entries: [
          {
            localPath: "not-a-runtime-module.ts",
            status: "mapped",
            upstreamPath: "sw/source/core/doc/docnew.cxx",
          },
        ],
      }),
    );
    expectInvalidManifest(
      createManifestSource({
        entries: [
          {
            localPath: "apps/office/src/main.tsx",
            rationale: "Too short.",
            status: "browser-only",
          },
        ],
      }),
    );
    const manifest = parseSourceProvenanceManifest(createManifestSource(), baseline);
    await expect(
      validateSourceProvenanceManifest(
        manifest,
        ["apps/office/src/main.tsx"],
        /** Reports all synthetic upstream paths as present so missing local coverage is isolated. @returns Promise resolving true. */
        async function acceptsSyntheticPath(): Promise<boolean> {
          return true;
        },
      ),
    ).rejects.toThrowError(/stale modules/u);
    await expect(
      validateSourceProvenanceManifest(
        manifest,
        [
          "apps/office/src/main.tsx",
          "apps/office/src/sw/source/core/doc/writer.ts",
          "apps/office/src/sw/source/core/doc/list.ts",
        ],
        /** Reports all synthetic upstream paths as present so missing manifest coverage is isolated. @returns Promise resolving true. */
        async function acceptsSyntheticPath(): Promise<boolean> {
          return true;
        },
      ),
    ).rejects.toThrowError(/omits runtime modules/u);
    await expect(
      validateSourceProvenanceManifest(
        manifest,
        ["apps/office/src/main.tsx", "apps/office/src/sw/source/core/doc/writer.ts"],
        /** Reports every synthetic path absent to prove concrete upstream files are mandatory. @returns Promise resolving false. */
        async function rejectsSyntheticPath(): Promise<boolean> {
          return false;
        },
      ),
    ).rejects.toThrowError(/upstream path does not exist/u);
  });
});
