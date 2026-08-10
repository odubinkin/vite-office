/**
 * @fileoverview Converts pinned LibreOffice PO catalog paths into canonical unmapped localization records without reading or copying message content.
 */

import type { TranslationCatalogInventory, TranslationCatalogRecord } from "./contracts";

/** Exact PO catalog count observed in the pinned translations release corpus. */
export const expectedTranslationCatalogCount = 25_699;

/** Exact locale-directory count observed in the pinned translations release corpus. */
export const expectedTranslationLocaleCount = 131;

/** Matches PO catalog paths under the expected source/<locale>/ repository layout. */
const translationCatalogPathPattern = /^source\/([^/]+)\/.+\.po$/u;

/**
 * Creates a deterministic PO catalog inventory from raw translations-repository Git-tracked paths.
 *
 * @param translationsCommit - Immutable translations repository commit shared by every catalog record.
 * @param trackedPaths - Raw translations-repository-relative paths returned by Git.
 * @returns A complete canonical catalog inventory with per-locale summary.
 * @throws {Error} When PO catalog paths duplicate or do not meet pinned catalog or locale counts.
 */
export function createTranslationCatalogInventory(
  translationsCommit: string,
  trackedPaths: readonly string[],
): TranslationCatalogInventory {
  const catalogPaths = trackedPaths.filter(isTranslationCatalogPath);
  const uniquePaths = new Set(catalogPaths);
  if (uniquePaths.size !== catalogPaths.length) {
    throw new Error("Translation catalog inventory input contains duplicate PO paths.");
  }
  if (catalogPaths.length !== expectedTranslationCatalogCount) {
    throw new Error(`Unexpected translation catalog count: ${catalogPaths.length}`);
  }

  const records = [...uniquePaths]
    .sort(comparePaths)
    .map(createCatalogRecord.bind(undefined, translationsCommit));
  const summary = createLocaleSummary(records);
  if (Object.keys(summary).length !== expectedTranslationLocaleCount) {
    throw new Error(`Unexpected translation locale count: ${Object.keys(summary).length}`);
  }

  return {
    corpusId: "translations",
    generatedBy: "inventory:translations",
    records,
    schemaVersion: 1,
    summary,
    translationsCommit,
  };
}

/**
 * Determines whether one Git-tracked path names a PO catalog beneath source/<locale>/.
 *
 * @param trackedPath - Repository-relative path returned by Git.
 * @returns True only for a PO catalog with a non-empty locale segment.
 */
function isTranslationCatalogPath(trackedPath: string): boolean {
  return translationCatalogPathPattern.test(trackedPath);
}

/**
 * Converts one validated PO path into a provenance-only unmapped catalog record.
 *
 * @param translationsCommit - Immutable translations commit attached to the record.
 * @param referencePath - Exact repository-relative PO catalog path.
 * @returns A serializable PO catalog record.
 */
function createCatalogRecord(
  translationsCommit: string,
  referencePath: string,
): TranslationCatalogRecord {
  const locale = referencePath.split("/")[1] as string;
  return {
    commit: translationsCommit,
    corpusId: "translations",
    id: `LO-TRANSLATION-CATALOG:${referencePath}`,
    locale,
    mappingStatus: "unmapped",
    referencePath,
  };
}

/**
 * Produces deterministic per-locale catalog counts from canonical records.
 *
 * @param records - Generated PO catalog records in lexical path order.
 * @returns Locale count summary with lexical object-key insertion order.
 */
function createLocaleSummary(
  records: readonly TranslationCatalogRecord[],
): Readonly<Record<string, number>> {
  const counts = new Map<string, number>();
  for (const record of records) {
    counts.set(record.locale, (counts.get(record.locale) ?? 0) + 1);
  }
  return Object.fromEntries(counts);
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
