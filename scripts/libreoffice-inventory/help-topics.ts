/**
 * @fileoverview Converts pinned LibreOffice help XHP paths into canonical unmapped topic records without reading or copying topic content.
 */

import type { HelpTopicInventory, HelpTopicRecord } from "./contracts";

/** Exact XHP topic count observed in the pinned helpcontent2 release corpus. */
export const expectedHelpTopicCount = 2_746;

/**
 * Creates a deterministic XHP topic inventory from raw help-repository Git-tracked paths.
 *
 * @param helpCommit - Immutable help repository commit shared by every topic record.
 * @param trackedPaths - Raw help-repository-relative paths returned by Git.
 * @returns A complete canonical topic inventory with area summary.
 * @throws {Error} When XHP paths duplicate or do not meet the pinned topic count.
 */
export function createHelpTopicInventory(
  helpCommit: string,
  trackedPaths: readonly string[],
): HelpTopicInventory {
  const topicPaths = trackedPaths.filter(isXhpPath);
  const uniquePaths = new Set(topicPaths);
  if (uniquePaths.size !== topicPaths.length) {
    throw new Error("Help topic inventory input contains duplicate XHP paths.");
  }
  if (topicPaths.length !== expectedHelpTopicCount) {
    throw new Error(`Unexpected XHP topic count: ${topicPaths.length}`);
  }

  const records = [...uniquePaths]
    .sort(comparePaths)
    .map(createTopicRecord.bind(undefined, helpCommit));
  return {
    corpusId: "helpcontent2",
    generatedBy: "inventory:help-topics",
    helpCommit,
    records,
    schemaVersion: 1,
    summary: createAreaSummary(records),
  };
}

/**
 * Determines whether a tracked path is a help XHP topic under the expected source/text/<area>/ layout.
 *
 * @param trackedPath - Repository-relative help path returned by Git.
 * @returns True only for XHP paths with a non-empty help area segment.
 */
function isXhpPath(trackedPath: string): boolean {
  return /^source\/text\/[^/]+\/.+\.xhp$/u.test(trackedPath);
}

/**
 * Converts one validated XHP path into a provenance-only unmapped topic record.
 *
 * @param helpCommit - Immutable help commit attached to the record.
 * @param referencePath - Exact repository-relative XHP topic path.
 * @returns A serializable XHP topic record.
 */
function createTopicRecord(helpCommit: string, referencePath: string): HelpTopicRecord {
  const area = referencePath.split("/")[2] as string;
  return {
    area,
    commit: helpCommit,
    corpusId: "helpcontent2",
    id: `LO-HELP-TOPIC:${referencePath}`,
    mappingStatus: "unmapped",
    referencePath,
  };
}

/**
 * Produces deterministic per-area topic counts from canonical records.
 *
 * @param records - Generated XHP topic records.
 * @returns Area count summary with lexical object-key insertion order.
 */
function createAreaSummary(records: readonly HelpTopicRecord[]): Readonly<Record<string, number>> {
  const counts = new Map<string, number>();
  for (const record of records) {
    counts.set(record.area, (counts.get(record.area) ?? 0) + 1);
  }
  return Object.fromEntries(counts);
}

/**
 * Orders exact repository-relative paths by portable code-unit lexical order.
 *
 * @param left - First path.
 * @param right - Second path.
 * @returns Negative, zero, or positive lexical comparison result.
 */
function comparePaths(left: string, right: string): number {
  return left < right ? -1 : 1;
}
