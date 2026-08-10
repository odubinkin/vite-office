/**
 * @fileoverview Converts pinned LibreOffice dictionary AFF and DIC paths into canonical unmapped records without reading lexical data.
 */

import type {
  DictionaryFileInventory,
  DictionaryFileKind,
  DictionaryFileRecord,
} from "./contracts";

/** Exact AFF file count observed in the pinned dictionaries release corpus. */
export const expectedAffFileCount = 98;

/** Exact DIC file count observed in the pinned dictionaries release corpus. */
export const expectedDicFileCount = 147;

/** Exact supported dictionary file count observed in the pinned release corpus. */
export const expectedDictionaryFileCount = expectedAffFileCount + expectedDicFileCount;

/**
 * Creates a deterministic dictionary-file inventory from raw Git-tracked paths.
 *
 * @param dictionariesCommit - Immutable dictionaries repository commit shared by every record.
 * @param trackedPaths - Raw dictionaries-repository-relative paths returned by Git.
 * @returns A complete canonical dictionary-file inventory with per-kind counts.
 * @throws {Error} When matching paths duplicate or violate pinned completeness counts.
 */
export function createDictionaryFileInventory(
  dictionariesCommit: string,
  trackedPaths: readonly string[],
): DictionaryFileInventory {
  const dictionaryPaths = trackedPaths.filter(isDictionaryFilePath);
  const uniquePaths = new Set(dictionaryPaths);
  if (uniquePaths.size !== dictionaryPaths.length) {
    throw new Error("Dictionary file inventory input contains duplicate AFF or DIC paths.");
  }
  if (dictionaryPaths.length !== expectedDictionaryFileCount) {
    throw new Error(`Unexpected dictionary file count: ${dictionaryPaths.length}`);
  }
  const records = [...uniquePaths]
    .sort(comparePaths)
    .map(createDictionaryRecord.bind(undefined, dictionariesCommit));
  const summary = createKindSummary(records);
  if (summary.aff !== expectedAffFileCount || summary.dic !== expectedDicFileCount) {
    throw new Error(
      `Unexpected dictionary file kind counts: aff=${summary.aff}, dic=${summary.dic}`,
    );
  }
  return {
    corpusId: "dictionaries",
    dictionariesCommit,
    generatedBy: "inventory:dictionaries",
    records,
    schemaVersion: 1,
    summary,
  };
}

/**
 * Determines whether a tracked path ends in a supported dictionary extension.
 *
 * @param trackedPath - Repository-relative path returned by Git.
 * @returns True only for AFF or DIC file paths beneath a package directory.
 */
function isDictionaryFilePath(trackedPath: string): boolean {
  return /^[^/]+\/.+\.(aff|dic)$/u.test(trackedPath);
}

/**
 * Converts one validated file path into a provenance-only unmapped dictionary record.
 *
 * @param dictionariesCommit - Immutable dictionaries commit attached to the record.
 * @param referencePath - Exact repository-relative AFF or DIC file path.
 * @returns A serializable dictionary file record.
 */
function createDictionaryRecord(
  dictionariesCommit: string,
  referencePath: string,
): DictionaryFileRecord {
  const kind = referencePath.endsWith(".aff") ? "aff" : "dic";
  return {
    commit: dictionariesCommit,
    corpusId: "dictionaries",
    id: `LO-DICTIONARY-FILE:${referencePath}`,
    kind,
    mappingStatus: "unmapped",
    packageName: referencePath.split("/")[0] as string,
    referencePath,
  };
}

/**
 * Produces complete deterministic AFF and DIC counts from canonical records.
 *
 * @param records - Generated dictionary file records.
 * @returns Per-kind count summary.
 */
function createKindSummary(
  records: readonly DictionaryFileRecord[],
): Readonly<Record<DictionaryFileKind, number>> {
  return records.reduce(countDictionaryKind, { aff: 0, dic: 0 });
}

/**
 * Adds one dictionary record to a per-kind counter without mutating the input accumulator.
 *
 * @param counts - Current per-kind counts.
 * @param record - Generated dictionary record to count.
 * @returns Updated per-kind counts.
 */
function countDictionaryKind(
  counts: Record<DictionaryFileKind, number>,
  record: DictionaryFileRecord,
): Record<DictionaryFileKind, number> {
  return { ...counts, [record.kind]: counts[record.kind] + 1 };
}

/**
 * Orders exact repository-relative paths by portable code-unit lexical order.
 *
 * @param left - First path.
 * @param right - Second path.
 * @returns Negative or positive lexical comparison result.
 */
function comparePaths(left: string, right: string): number {
  return left < right ? -1 : 1;
}
