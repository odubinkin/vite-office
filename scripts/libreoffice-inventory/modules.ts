/**
 * @fileoverview Converts pinned core Module_*.mk declaration paths into canonical unmapped records without reading or copying upstream content.
 */

import type { CoreModuleInventory, CoreModuleRecord } from "./contracts";

const moduleFilePattern = /(^|\/)Module_([^/]+)\.mk$/u;

/**
 * Creates a canonical core-module inventory from raw Git-tracked paths.
 *
 * @param coreCommit - Immutable core commit that scopes every generated record.
 * @param trackedPaths - Git-tracked core paths collected from the validated checkout.
 * @returns A schema-versioned inventory with lexically ordered unique module records.
 * @throws {Error} When a supplied module path is malformed or repeated.
 */
export function createCoreModuleInventory(
  coreCommit: string,
  trackedPaths: readonly string[],
): CoreModuleInventory {
  const modulePaths = collectModulePaths(trackedPaths);

  return {
    coreCommit,
    corpusId: "core",
    generatedBy: "inventory:modules",
    records: modulePaths.map(createModuleRecord.bind(undefined, coreCommit)),
    schemaVersion: 1,
  };
}

/**
 * Selects, validates, de-duplicates, and lexically sorts every core Module_*.mk declaration path.
 *
 * @param trackedPaths - Raw repository-relative paths returned by Git.
 * @returns Valid unique declaration paths in canonical lexical order.
 * @throws {Error} When duplicate matching paths are supplied.
 */
function collectModulePaths(trackedPaths: readonly string[]): readonly string[] {
  const paths = trackedPaths.filter(isModuleDeclarationPath);
  const uniquePaths = new Set(paths);

  if (uniquePaths.size !== paths.length) {
    throw new Error("Core module inventory input contains duplicate Module_*.mk paths.");
  }

  return [...uniquePaths].sort(comparePaths);
}

/**
 * Determines whether one Git-tracked path names a Module_*.mk declaration at any repository depth.
 *
 * @param trackedPath - Repository-relative path returned by Git.
 * @returns True only for a filename matching the Module_<name>.mk declaration convention.
 */
function isModuleDeclarationPath(trackedPath: string): boolean {
  return moduleFilePattern.test(trackedPath);
}

/**
 * Converts one validated declaration path into an unmapped core-module record.
 *
 * @param coreCommit - Immutable core commit that scopes the record.
 * @param referencePath - Exact repository-relative declaration path.
 * @returns A serializable unmapped module record.
 * @throws {Error} When a non-matching path reaches record creation.
 */
function createModuleRecord(coreCommit: string, referencePath: string): CoreModuleRecord {
  const fileName = referencePath.slice(referencePath.lastIndexOf("/") + 1);
  const moduleName = fileName.slice("Module_".length, -".mk".length);

  return {
    commit: coreCommit,
    corpusId: "core",
    id: `LO-CORE-MODULE:${referencePath}`,
    mappingStatus: "unmapped",
    moduleName,
    referencePath,
  };
}

/**
 * Orders repository-relative paths with portable lexical comparison for deterministic generated output.
 *
 * @param left - First repository-relative path.
 * @param right - Second repository-relative path.
 * @returns Negative, zero, or positive lexical comparison result.
 */
function comparePaths(left: string, right: string): number {
  return left < right ? -1 : 1;
}
