/**
 * @fileoverview Verifies strict parsing and honest rejection behavior for the version-two LibreOffice baseline manifest.
 */

import { describe, expect, it } from "vitest";

import { BaselineValidationError } from "./contracts";
import { parseBaselineManifest } from "./manifest";

/**
 * Creates one complete valid baseline JSON object that individual tests can safely alter.
 *
 * @returns Mutable JSON-shaped baseline fixture.
 */
function createManifestRecord(): Record<string, unknown> {
  return {
    commit: "core-commit",
    corpora: [
      createCorpus("core", "vendor/libreoffice-reference/", 4),
      createCorpus("dictionaries", "vendor/libreoffice-reference/dictionaries/", 2, {
        affFiles: 1,
        dictionaryFiles: 1,
      }),
      createCorpus("helpcontent2", "vendor/libreoffice-reference/helpcontent2/", 2, {
        xhpTopics: 1,
      }),
      createCorpus("translations", "vendor/libreoffice-reference/translations/", 3, {
        localeDirectories: 2,
        poCatalogs: 2,
      }),
    ],
    referencePath: "vendor/libreoffice-reference/",
    repository: "https://github.com/LibreOffice/core.git",
    schemaVersion: 2,
    tag: "libreoffice-26.8.0.2",
    tagObject: "core-tag-object",
  };
}

/**
 * Creates one valid corpus record for a test-only baseline JSON object.
 *
 * @param id - Stable corpus identifier.
 * @param referencePath - Corpus path below the core reference root.
 * @param trackedFiles - Positive tracked-file acquisition floor.
 * @param corpusShape - Optional positive category-level floors.
 * @returns Mutable JSON-shaped corpus record for test setup.
 */
function createCorpus(
  id: string,
  referencePath: string,
  trackedFiles: number,
  corpusShape?: Record<string, number>,
): Record<string, unknown> {
  return {
    commit: `${id}-commit`,
    ...(corpusShape === undefined ? {} : { corpusShape }),
    id,
    referencePath,
    repository: `https://github.com/LibreOffice/${id}.git`,
    tagObject: `${id}-tag-object`,
    trackedFiles,
  };
}

/**
 * Serializes one test baseline object using the same JSON boundary as production input.
 *
 * @param record - Mutable JSON-shaped baseline fixture.
 * @returns JSON source accepted by the production parser.
 */
function serializeManifest(record: Record<string, unknown>): string {
  return JSON.stringify(record);
}

describe("parseBaselineManifest" /**
 * Groups strict parsing cases for valid and invalid baseline JSON documents.
 *
 * @returns Nothing; Vitest registers the enclosed test cases.
 */, function defineManifestParsingTests(): void {
  it("returns the required four typed corpora and optional shape floors" /**
   * Verifies successful strict parsing preserves required inventory contract data.
   *
   * @returns Nothing; assertions validate parsed manifest fields.
   */, function parsesCompleteManifest(): void {
    const manifest = parseBaselineManifest(serializeManifest(createManifestRecord()));

    expect(manifest.schemaVersion).toBe(2);
    expect(manifest.corpora).toHaveLength(4);
    expect(manifest.corpora[1]?.corpusShape).toEqual({ affFiles: 1, dictionaryFiles: 1 });
    expect(manifest.corpora[0]?.corpusShape).toBeUndefined();
  });

  it("rejects invalid JSON and non-object roots with a structured manifest issue" /**
   * Verifies invalid syntax and root-shape failures remain deterministic and typed.
   *
   * @returns Nothing; assertions validate structured validation errors.
   */, function rejectsInvalidJsonAndRoot(): void {
    expectManifestField("{", "json");
    expectManifestField("[]", "root");
  });

  it("rejects unsupported schemas and malformed mandatory properties" /**
   * Verifies every primitive property reader refuses invalid version, string, and integer values.
   *
   * @returns Nothing; assertions validate field-specific errors.
   */, function rejectsMalformedProperties(): void {
    const wrongVersion = createManifestRecord();
    wrongVersion.schemaVersion = 3;
    expectManifestField(serializeManifest(wrongVersion), "schemaVersion");

    const blankCommit = createManifestRecord();
    blankCommit.commit = " ";
    expectManifestField(serializeManifest(blankCommit), "commit");

    const invalidTrackedFiles = createManifestRecord();
    const corpora = invalidTrackedFiles.corpora as Record<string, unknown>[];
    getCorpusAt(corpora, 0).trackedFiles = 0;
    expectManifestField(serializeManifest(invalidTrackedFiles), "trackedFiles");

    const invalidShape = createManifestRecord();
    const shapeCorpora = invalidShape.corpora as Record<string, unknown>[];
    getCorpusAt(shapeCorpora, 1).corpusShape = { affFiles: "one" };
    expectManifestField(serializeManifest(invalidShape), "affFiles");

    const nonObjectShape = createManifestRecord();
    const nonObjectShapeCorpora = nonObjectShape.corpora as Record<string, unknown>[];
    getCorpusAt(nonObjectShapeCorpora, 1).corpusShape = "invalid";
    expectManifestField(serializeManifest(nonObjectShape), "corpusShape");
  });

  it("rejects non-arrays, malformed entries, invalid identifiers, duplicates, and missing required corpora" /**
   * Verifies the list-level corpus invariants cannot silently lose a required corpus.
   *
   * @returns Nothing; assertions validate corpus contract diagnostics.
   */, function rejectsMalformedCorpusLists(): void {
    const nonArray = createManifestRecord();
    nonArray.corpora = {};
    expectManifestField(serializeManifest(nonArray), "corpora");

    const nonObjectEntry = createManifestRecord();
    nonObjectEntry.corpora = ["bad"];
    expectManifestField(serializeManifest(nonObjectEntry), "corpora[0]");

    const invalidIdentifier = createManifestRecord();
    const invalidIdCorpora = invalidIdentifier.corpora as Record<string, unknown>[];
    getCorpusAt(invalidIdCorpora, 0).id = "unknown";
    expectManifestField(serializeManifest(invalidIdentifier), "corpora[0].id");

    const duplicate = createManifestRecord();
    const duplicateCorpora = duplicate.corpora as Record<string, unknown>[];
    getCorpusAt(duplicateCorpora, 3).id = "helpcontent2";
    expectManifestField(serializeManifest(duplicate), "corpora");

    const missing = createManifestRecord();
    const missingCorpora = missing.corpora as Record<string, unknown>[];
    missingCorpora.pop();
    expectManifestField(serializeManifest(missing), "corpora");
  });

  it("rejects top-level core fields that disagree with the core corpus declaration" /**
   * Verifies duplicate identity fields cannot encode contradictory core provenance.
   *
   * @returns Nothing; assertions validate cross-field agreement enforcement.
   */, function rejectsCoreDisagreement(): void {
    const inconsistent = createManifestRecord();
    inconsistent.repository = "https://example.invalid/core.git";
    expectManifestField(serializeManifest(inconsistent), "core.repository");
  });
});

/**
 * Expects parsing to throw a structured error containing one target manifest field.
 *
 * @param sourceText - JSON source supplied to the parser.
 * @param field - Expected first structured issue field.
 * @returns Nothing; assertions validate error typing and diagnostic stability.
 */
function expectManifestField(sourceText: string, field: string): void {
  try {
    parseBaselineManifest(sourceText);
    throw new Error("Expected manifest parsing to fail.");
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(BaselineValidationError);
    expect((error as BaselineValidationError).issues[0]?.field).toBe(field);
  }
}

/**
 * Returns one mutable fixture corpus record while asserting that fixture setup supplied the requested index.
 *
 * @param corpora - Mutable corpus fixture records.
 * @param index - Required zero-based fixture index.
 * @returns The requested mutable corpus record.
 */
function getCorpusAt(
  corpora: readonly Record<string, unknown>[],
  index: number,
): Record<string, unknown> {
  const corpus = corpora[index];
  if (corpus === undefined) {
    throw new Error(`Missing test corpus at index ${index}`);
  }

  return corpus;
}
