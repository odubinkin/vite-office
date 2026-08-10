/**
 * @fileoverview Parses gbuild PythonTest module declarations into deterministic source-directory and module tokens without retaining makefile content.
 */

import {
  extractGbuildMacroArguments,
  splitGbuildSourceList,
  type GbuildSourceTargetKind,
} from "./gbuild-source-targets";

/** Describes one Python module declared by a gb_PythonTest_add_modules invocation. */
export interface PythonTestModuleTarget {
  /** Raw Python module token from the Make source list, preserving an expression when it cannot be resolved statically. */
  readonly declaredModule: string;
  /** Exact core-repository-relative directory resolved from the macro's `$(SRCDIR)/` argument. */
  readonly sourceDirectory: string;
  /** PythonTest target name supplied as the macro's first argument. */
  readonly testName: string;
  /** Whether declaredModule is a physical literal or an unevaluated Make expression. */
  readonly targetKind: GbuildSourceTargetKind;
}

const macroName = "gb_PythonTest_add_modules";
const sourceDirectoryPrefix = "$(SRCDIR)/";

/**
 * Extracts deterministic module target tokens from pinned PythonTest add-modules declarations.
 *
 * @param sourceText - Complete UTF-8 PythonTest makefile text from the pinned core checkout.
 * @returns Unique module targets ordered by test name, directory, target kind, then module token.
 * @throws {Error} When a declaration lacks required arguments or its source directory is not an exact SRCDIR-relative path.
 */
export function extractPythonTestModuleTargets(
  sourceText: string,
): readonly PythonTestModuleTarget[] {
  const records = extractGbuildMacroArguments(sourceText, macroName).flatMap(createModuleRecords);
  return [...new Map(records.map(createRecordEntry)).values()].sort(compareTargets);
}

/**
 * Converts one PythonTest add-modules argument list into module targets.
 *
 * @param argumentsList - Trimmed top-level macro arguments ordered as test name, source directory, and module list.
 * @returns Canonical module target records for the supplied test target.
 * @throws {Error} When the target name, source directory, or module list is missing or invalid.
 */
function createModuleRecords(argumentsList: readonly string[]): readonly PythonTestModuleTarget[] {
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
    throw new Error("Malformed gb_PythonTest_add_modules declaration.");
  }

  const sourceDirectory = parseSourceDirectory(rawDirectory);
  return splitGbuildSourceList(moduleList).map(
    /**
     * Converts one module-list token into a canonical provenance record.
     *
     * @param declaredModule - One literal or unevaluated Make module token.
     * @returns Canonical module record linked to its PythonTest name and source directory.
     */
    function createModuleRecord(declaredModule: string): PythonTestModuleTarget {
      return {
        declaredModule,
        sourceDirectory,
        targetKind: declaredModule.includes("$(") ? "expression" : "literal",
        testName,
      };
    },
  );
}

/**
 * Validates and strips the exact source-root prefix accepted for PythonTest module discovery.
 *
 * @param rawDirectory - Second gbuild macro argument before normalization.
 * @returns Core-repository-relative source directory without a trailing slash.
 * @throws {Error} When the directory does not have one exact non-expression `$(SRCDIR)/` prefix.
 */
function parseSourceDirectory(rawDirectory: string): string {
  if (!rawDirectory.startsWith(sourceDirectoryPrefix)) {
    throw new Error(`Unsupported PythonTest source directory: ${rawDirectory}`);
  }
  const sourceDirectory = rawDirectory.slice(sourceDirectoryPrefix.length).replace(/\/+$/u, "");
  if (sourceDirectory.length === 0 || sourceDirectory.includes("$(")) {
    throw new Error(`Unsupported PythonTest source directory: ${rawDirectory}`);
  }
  return sourceDirectory;
}

/**
 * Creates a stable deduplication entry for one Python module target record.
 *
 * @param record - Python module target record to key.
 * @returns A stable key and its original record.
 */
function createRecordEntry(
  record: PythonTestModuleTarget,
): readonly [string, PythonTestModuleTarget] {
  return [
    `${record.testName}\0${record.sourceDirectory}\0${record.targetKind}\0${record.declaredModule}`,
    record,
  ];
}

/**
 * Orders Python module target records by test name, directory, target kind, then module token.
 *
 * @param left - First Python module target record.
 * @param right - Second Python module target record.
 * @returns Negative or positive lexical comparison result for unique records.
 */
function compareTargets(left: PythonTestModuleTarget, right: PythonTestModuleTarget): number {
  const leftKey = `${left.testName}\0${left.sourceDirectory}\0${left.targetKind}\0${left.declaredModule}`;
  const rightKey = `${right.testName}\0${right.sourceDirectory}\0${right.targetKind}\0${right.declaredModule}`;
  return leftKey < rightKey ? -1 : 1;
}
