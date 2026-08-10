/**
 * @fileoverview Parses gbuild UITest module-root declarations into deterministic source-directory and directory-root tokens without retaining makefile content.
 */

import {
  extractGbuildMacroArguments,
  splitGbuildSourceList,
  type GbuildSourceTargetKind,
} from "./gbuild-source-targets";

/** Describes one module root declared by a gb_UITest_add_modules invocation. */
export interface UITestModuleRootTarget {
  /** Raw module-root token after trailing-slash normalization, preserving an expression when it cannot be resolved statically. */
  readonly declaredModuleRoot: string;
  /** Exact core-repository-relative directory resolved from the macro's source-root argument. */
  readonly sourceDirectory: string;
  /** UITest target name supplied as the macro's first argument. */
  readonly testName: string;
  /** Whether declaredModuleRoot is a physical literal or an unevaluated Make expression. */
  readonly targetKind: GbuildSourceTargetKind;
}

const macroName = "gb_UITest_add_modules";
const sourceDirectoryPrefix = "$(SRCDIR)/";

/**
 * Extracts deterministic module-root tokens from pinned UITest add-modules declarations.
 *
 * @param sourceText - Complete UTF-8 UITest makefile text from the pinned core checkout.
 * @returns Unique module-root targets ordered by test name, directory, target kind, then module root.
 * @throws {Error} When a declaration lacks required arguments or its source directory is not an exact source-root-relative path.
 */
export function extractUITestModuleRootTargets(
  sourceText: string,
): readonly UITestModuleRootTarget[] {
  const records = extractGbuildMacroArguments(sourceText, macroName).flatMap(
    createModuleRootRecords,
  );
  return [...new Map(records.map(createRecordEntry)).values()].sort(compareTargets);
}

/**
 * Converts one UITest add-modules argument list into module-root targets.
 *
 * @param argumentsList - Trimmed top-level macro arguments ordered as test name, source directory, and module roots.
 * @returns Canonical module-root target records for the supplied UITest target.
 * @throws {Error} When the target name, source directory, or module root list is missing or invalid.
 */
function createModuleRootRecords(
  argumentsList: readonly string[],
): readonly UITestModuleRootTarget[] {
  const testName = argumentsList[0]?.trim();
  const rawDirectory = argumentsList[1]?.trim();
  const moduleList = argumentsList[2]?.trim();
  if (
    testName === undefined ||
    testName.length === 0 ||
    rawDirectory === undefined ||
    rawDirectory.length === 0 ||
    moduleList === undefined ||
    moduleList.length === 0
  ) {
    throw new Error("Malformed gb_UITest_add_modules declaration.");
  }
  const sourceDirectory = parseSourceDirectory(rawDirectory);
  return splitGbuildSourceList(moduleList).map(
    /**
     * Converts one module-list token into a canonical provenance record.
     *
     * @param rawModuleRoot - One literal or unevaluated Make module-root token.
     * @returns Canonical module-root record linked to its UITest name and source directory.
     * @throws {Error} When slash normalization leaves an empty module root.
     */
    function createModuleRootRecord(rawModuleRoot: string): UITestModuleRootTarget {
      const declaredModuleRoot = rawModuleRoot.replace(/\/+$/u, "");
      if (declaredModuleRoot.length === 0) {
        throw new Error("UITest module root cannot be empty.");
      }
      return {
        declaredModuleRoot,
        sourceDirectory,
        targetKind: declaredModuleRoot.includes("$(") ? "expression" : "literal",
        testName,
      };
    },
  );
}

/**
 * Validates and strips the exact source-root prefix accepted for UITest module-root discovery.
 *
 * @param rawDirectory - Second gbuild macro argument before normalization.
 * @returns Core-repository-relative source directory without a trailing slash.
 * @throws {Error} When the directory does not have one exact non-expression source-root prefix.
 */
function parseSourceDirectory(rawDirectory: string): string {
  if (!rawDirectory.startsWith(sourceDirectoryPrefix)) {
    throw new Error(`Unsupported UITest source directory: ${rawDirectory}`);
  }
  const sourceDirectory = rawDirectory.slice(sourceDirectoryPrefix.length).replace(/\/+$/u, "");
  if (sourceDirectory.length === 0 || sourceDirectory.includes("$(")) {
    throw new Error(`Unsupported UITest source directory: ${rawDirectory}`);
  }
  return sourceDirectory;
}

/**
 * Creates a stable deduplication entry for one UITest module-root record.
 *
 * @param record - UITest module-root target record to key.
 * @returns A stable key and its original record.
 */
function createRecordEntry(
  record: UITestModuleRootTarget,
): readonly [string, UITestModuleRootTarget] {
  return [
    `${record.testName}\0${record.sourceDirectory}\0${record.targetKind}\0${record.declaredModuleRoot}`,
    record,
  ];
}

/**
 * Orders UITest module-root target records by test name, directory, target kind, then module root.
 *
 * @param left - First UITest module-root target record.
 * @param right - Second UITest module-root target record.
 * @returns Negative or positive lexical comparison result for unique records.
 */
function compareTargets(left: UITestModuleRootTarget, right: UITestModuleRootTarget): number {
  const leftKey = `${left.testName}\0${left.sourceDirectory}\0${left.targetKind}\0${left.declaredModuleRoot}`;
  const rightKey = `${right.testName}\0${right.sourceDirectory}\0${right.targetKind}\0${right.declaredModuleRoot}`;
  return leftKey < rightKey ? -1 : 1;
}
