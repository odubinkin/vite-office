/**
 * @fileoverview Links parsed UITest module roots to inventoried constructors and expands only their Git-tracked Python source paths into atomic provenance records.
 */

import type {
  CoreTestInventory,
  CoreTestRecord,
  CoreUITestSourceTargetInventory,
  CoreUITestSourceTargetRecord,
  CoreUITestSourceTargetStatus,
} from "./contracts";
import type { UITestModuleRootTarget } from "./ui-test-module-roots";

/** Immutable source-target counts observed from pinned libreoffice-26.8.0.2 UITest module-root declarations. */
export const expectedCoreUITestSourceTargetCounts: Readonly<
  Record<CoreUITestSourceTargetStatus, number>
> = { expression: 0, missing: 0, tracked: 649 };

/** Associates one parsed UITest module root with the makefile that declares it. */
export interface UITestModuleRootDeclaration extends UITestModuleRootTarget {
  /** Exact core-repository-relative makefile path that declares the module root. */
  readonly declarationPath: string;
}

/**
 * Creates the canonical Python source-target inventory for UITest constructors in the core test inventory.
 *
 * @param coreCommit - Immutable pinned core commit shared by all generated records.
 * @param constructors - Complete canonical core test-constructor inventory used for ID linkage.
 * @param declarations - Parsed UITest module roots together with makefile provenance.
 * @param trackedPaths - Exact Git-tracked core paths used to expand module roots into Python files.
 * @returns Deterministically ordered linked Python source-target inventory with pinned count guards.
 * @throws {Error} When constructors mismatch the commit, a module root has no UITest owner, records duplicate, or counts drift.
 */
export function createCoreUITestSourceTargetInventory(
  coreCommit: string,
  constructors: CoreTestInventory,
  declarations: readonly UITestModuleRootDeclaration[],
  trackedPaths: readonly string[],
): CoreUITestSourceTargetInventory {
  if (constructors.coreCommit !== coreCommit) {
    throw new Error(
      "Core test constructor inventory commit does not match UITest source extraction.",
    );
  }
  const constructorsByLocation = new Map(
    constructors.records.filter(isUITestConstructor).map(createConstructorEntry),
  );
  const records = declarations.flatMap(
    /**
     * Expands one linked UITest module root only after requiring constructor provenance.
     *
     * @param declaration - Parsed module root and exact makefile provenance.
     * @returns Atomic source-target records for the module root.
     * @throws {Error} When the declaration has no UITest constructor record.
     */
    function createLinkedRecords(
      declaration: UITestModuleRootDeclaration,
    ): readonly CoreUITestSourceTargetRecord[] {
      const constructor = constructorsByLocation.get(createDeclarationLookupKey(declaration));
      if (constructor === undefined) {
        throw new Error(
          `UITest module root has no inventoried constructor: ${declaration.declarationPath}:${declaration.testName}`,
        );
      }
      return createModuleRootRecords(coreCommit, constructor, declaration, trackedPaths);
    },
  );
  assertUniqueRecords(records);
  const summary = createSummary(records);
  assertExpectedCounts(summary);
  return {
    coreCommit,
    corpusId: "core",
    generatedBy: "inventory:ui-test-source-targets",
    records: [...records].sort(compareRecords),
    schemaVersion: 1,
    summary,
  };
}

/**
 * Determines whether a core test-constructor record belongs to the UITest family.
 *
 * @param record - Candidate core test-constructor record.
 * @returns True only for UITest records with module-root declarations in scope.
 */
function isUITestConstructor(record: CoreTestRecord): boolean {
  return record.kind === "UITest";
}

/**
 * Creates a lookup entry for one UITest constructor's declaration path and target name.
 *
 * @param constructor - Inventoried UITest constructor.
 * @returns Stable location key and original constructor record.
 */
function createConstructorEntry(constructor: CoreTestRecord): readonly [string, CoreTestRecord] {
  return [createConstructorLookupKey(constructor), constructor];
}

/**
 * Creates a makefile-and-name lookup key for an inventoried UITest constructor.
 *
 * @param constructor - Inventoried UITest constructor with exact makefile provenance.
 * @returns Deterministic key that cannot collide across path and target name.
 */
function createConstructorLookupKey(constructor: CoreTestRecord): string {
  return `${constructor.referencePath}\0${constructor.testName}`;
}

/**
 * Creates a makefile-and-name lookup key for a parsed UITest module-root declaration.
 *
 * @param declaration - Parsed UITest module-root declaration with makefile provenance.
 * @returns Deterministic key that cannot collide across path and target name.
 */
function createDeclarationLookupKey(declaration: UITestModuleRootDeclaration): string {
  return `${declaration.declarationPath}\0${declaration.testName}`;
}

/**
 * Expands one linked declaration into physical Python records or one explicit unresolved record.
 *
 * @param coreCommit - Immutable pinned core commit to attach to records.
 * @param constructor - Inventoried UITest constructor that owns the module root.
 * @param declaration - Parsed module root with makefile provenance.
 * @param trackedPaths - Exact Git-tracked core paths used for physical source discovery.
 * @returns Atomic physical records, or one missing/expression record when no physical source is derivable.
 */
function createModuleRootRecords(
  coreCommit: string,
  constructor: CoreTestRecord,
  declaration: UITestModuleRootDeclaration,
  trackedPaths: readonly string[],
): readonly CoreUITestSourceTargetRecord[] {
  if (declaration.targetKind === "expression") {
    return [createRecord(coreCommit, constructor, declaration, null, null, "expression")];
  }
  const moduleRootPath = `${declaration.sourceDirectory}/${declaration.declaredModuleRoot}`;
  const sourcePaths = trackedPaths.filter(isTrackedPythonPathBelow(moduleRootPath));
  if (sourcePaths.length === 0) {
    return [createRecord(coreCommit, constructor, declaration, moduleRootPath, null, "missing")];
  }
  return sourcePaths.map(
    /**
     * Converts one discovered Git-tracked Python path into an atomic provenance record.
     *
     * @param sourcePath - Exact Git-tracked Python path below the declared module root.
     * @returns One tracked UITest Python source-target record.
     */
    function createTrackedRecord(sourcePath: string): CoreUITestSourceTargetRecord {
      return createRecord(
        coreCommit,
        constructor,
        declaration,
        moduleRootPath,
        sourcePath,
        "tracked",
      );
    },
  );
}

/**
 * Creates a predicate that selects only Git-tracked Python files below one exact module-root directory.
 *
 * @param moduleRootPath - Exact core-repository-relative module-root directory without a trailing slash.
 * @returns Predicate that accepts only descendant physical Python paths.
 */
function isTrackedPythonPathBelow(moduleRootPath: string): (pathValue: string) => boolean {
  const prefix = `${moduleRootPath}/`;
  /**
   * Checks one Git-tracked path against the declared module-root boundary.
   *
   * @param pathValue - Exact Git-tracked core path to inspect.
   * @returns True only for descendant .py files.
   */
  function isTrackedPythonPath(pathValue: string): boolean {
    return pathValue.startsWith(prefix) && pathValue.endsWith(".py");
  }
  return isTrackedPythonPath;
}

/**
 * Creates one canonical UITest Python source-target record.
 *
 * @param coreCommit - Immutable pinned core commit to attach to the record.
 * @param constructor - Inventoried UITest constructor that owns the record.
 * @param declaration - Parsed module-root declaration with makefile provenance.
 * @param moduleRootPath - Literal core-relative module-root directory, or null for expressions.
 * @param sourcePath - Exact physical Python source path, or null when unresolved.
 * @param targetStatus - Resolution state that explains sourcePath availability.
 * @returns One canonical linked UITest Python source-target record.
 */
function createRecord(
  coreCommit: string,
  constructor: CoreTestRecord,
  declaration: UITestModuleRootDeclaration,
  moduleRootPath: string | null,
  sourcePath: string | null,
  targetStatus: CoreUITestSourceTargetStatus,
): CoreUITestSourceTargetRecord {
  return {
    commit: coreCommit,
    constructorId: constructor.id,
    corpusId: "core",
    declarationPath: declaration.declarationPath,
    declaredModuleRoot: declaration.declaredModuleRoot,
    id: `LO-CORE-UI-SOURCE:${constructor.id}:${targetStatus}:${sourcePath ?? declaration.declaredModuleRoot}`,
    mappingStatus: "unmapped",
    moduleRootPath,
    sourceDirectory: declaration.sourceDirectory,
    sourcePath,
    targetStatus,
  };
}

/**
 * Produces exact per-status UITest Python source-target counts from generated records.
 *
 * @param records - Linked UITest source-target records in any order.
 * @returns Immutable tracked, missing, and expression count summary.
 */
function createSummary(
  records: readonly CoreUITestSourceTargetRecord[],
): Readonly<Record<CoreUITestSourceTargetStatus, number>> {
  const summary: Record<CoreUITestSourceTargetStatus, number> = {
    expression: 0,
    missing: 0,
    tracked: 0,
  };
  for (const record of records) summary[record.targetStatus] += 1;
  return summary;
}

/**
 * Rejects incomplete or unexpectedly expanded UITest source records against the pinned baseline contract.
 *
 * @param summary - Observed per-status source-target counts.
 * @returns Nothing; count mismatches throw an error.
 * @throws {Error} When any observed status count differs from the pinned declaration count.
 */
function assertExpectedCounts(
  summary: Readonly<Record<CoreUITestSourceTargetStatus, number>>,
): void {
  for (const status of ["expression", "missing", "tracked"] as const) {
    if (summary[status] !== expectedCoreUITestSourceTargetCounts[status]) {
      throw new Error(`Unexpected ${status} UITest Python source-target count: ${summary[status]}`);
    }
  }
}

/**
 * Rejects repeated stable IDs so overlapping module roots cannot silently collapse provenance evidence.
 *
 * @param records - UITest source-target records before canonical sorting.
 * @returns Nothing; duplicate IDs throw an error.
 * @throws {Error} When any UITest source-target record ID appears more than once.
 */
function assertUniqueRecords(records: readonly CoreUITestSourceTargetRecord[]): void {
  const ids = new Set(records.map(selectRecordId));
  if (ids.size !== records.length)
    throw new Error("UITest source-target input contains duplicate records.");
}

/**
 * Extracts a UITest source-target record ID for duplicate detection.
 *
 * @param record - Generated UITest source-target record.
 * @returns Stable record identifier.
 */
function selectRecordId(record: CoreUITestSourceTargetRecord): string {
  return record.id;
}

/**
 * Orders UITest source-target records by constructor ID, resolution status, module root, then source path.
 *
 * @param left - First UITest source-target record.
 * @param right - Second UITest source-target record.
 * @returns Negative or positive deterministic comparison result for unique records.
 */
function compareRecords(
  left: CoreUITestSourceTargetRecord,
  right: CoreUITestSourceTargetRecord,
): number {
  const leftKey = `${left.constructorId}\0${left.targetStatus}\0${left.moduleRootPath}\0${left.sourcePath}`;
  const rightKey = `${right.constructorId}\0${right.targetStatus}\0${right.moduleRootPath}\0${right.sourcePath}`;
  return leftKey < rightKey ? -1 : 1;
}
