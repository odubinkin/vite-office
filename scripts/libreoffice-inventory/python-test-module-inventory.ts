/**
 * @fileoverview Links parsed PythonTest module targets to inventoried constructors and classifies their derived `.py` paths against the pinned core Git tree.
 */

import type {
  CorePythonTestModuleInventory,
  CorePythonTestModuleRecord,
  CorePythonTestModuleStatus,
  CoreTestInventory,
  CoreTestRecord,
} from "./contracts";
import type { PythonTestModuleTarget } from "./python-test-modules";

/** Immutable linked module counts observed from pinned libreoffice-26.8.0.2 PythonTest add-modules declarations. */
export const expectedCorePythonTestModuleCounts: Readonly<
  Record<CorePythonTestModuleStatus, number>
> = { expression: 0, missing: 0, tracked: 59 };

/** Associates one parsed PythonTest module target with the makefile that declares it. */
export interface PythonTestModuleDeclaration extends PythonTestModuleTarget {
  /** Exact core-repository-relative makefile path that declares the module. */
  readonly declarationPath: string;
}

/**
 * Creates the canonical Python module inventory for PythonTest constructors in the core test inventory.
 *
 * @param coreCommit - Immutable pinned core commit shared by all generated records.
 * @param constructors - Complete canonical core test-constructor inventory used for ID linkage.
 * @param declarations - Parsed PythonTest module targets together with makefile provenance.
 * @param trackedPaths - Exact Git-tracked core paths used to classify literal `.py` module paths.
 * @returns Deterministically ordered linked Python module inventory with pinned count guards.
 * @throws {Error} When constructors mismatch the commit, a module has no PythonTest owner, records duplicate, or counts drift.
 */
export function createCorePythonTestModuleInventory(
  coreCommit: string,
  constructors: CoreTestInventory,
  declarations: readonly PythonTestModuleDeclaration[],
  trackedPaths: readonly string[],
): CorePythonTestModuleInventory {
  if (constructors.coreCommit !== coreCommit) {
    throw new Error(
      "Core test constructor inventory commit does not match Python module extraction.",
    );
  }
  const constructorsByLocation = new Map(
    constructors.records.filter(isPythonConstructor).map(createConstructorEntry),
  );
  const trackedPathSet = new Set(trackedPaths);
  const records = declarations.map(
    /**
     * Converts one parsed module declaration into a linked inventory record.
     *
     * @param declaration - Parsed Python module target and makefile provenance.
     * @returns Canonical linked Python module record.
     * @throws {Error} When no matching PythonTest constructor exists.
     */
    function createLinkedRecord(
      declaration: PythonTestModuleDeclaration,
    ): CorePythonTestModuleRecord {
      const constructor = constructorsByLocation.get(createDeclarationLookupKey(declaration));
      if (constructor === undefined) {
        throw new Error(
          `PythonTest module has no inventoried constructor: ${declaration.declarationPath}:${declaration.testName}`,
        );
      }
      return createModuleRecord(coreCommit, constructor, declaration, trackedPathSet);
    },
  );
  assertUniqueRecords(records);
  const summary = createSummary(records);
  assertExpectedCounts(summary);
  return {
    coreCommit,
    corpusId: "core",
    generatedBy: "inventory:python-test-modules",
    records: [...records].sort(compareRecords),
    schemaVersion: 1,
    summary,
  };
}

/**
 * Determines whether a core test-constructor record belongs to the PythonTest family.
 *
 * @param record - Candidate core test-constructor record.
 * @returns True only for PythonTest records with module declarations in scope.
 */
function isPythonConstructor(record: CoreTestRecord): boolean {
  return record.kind === "PythonTest";
}

/**
 * Creates a lookup entry for one PythonTest constructor's declaration path and target name.
 *
 * @param constructor - Inventoried PythonTest constructor.
 * @returns Stable location key and original constructor record.
 */
function createConstructorEntry(constructor: CoreTestRecord): readonly [string, CoreTestRecord] {
  return [createConstructorLookupKey(constructor), constructor];
}

/**
 * Creates a makefile-and-name lookup key for an inventoried PythonTest constructor.
 *
 * @param constructor - Inventoried PythonTest constructor with exact makefile provenance.
 * @returns Deterministic key that cannot collide across path and target name.
 */
function createConstructorLookupKey(constructor: CoreTestRecord): string {
  return `${constructor.referencePath}\0${constructor.testName}`;
}

/**
 * Creates a makefile-and-name lookup key for a parsed PythonTest module declaration.
 *
 * @param declaration - Parsed Python module declaration with exact makefile provenance.
 * @returns Deterministic key that cannot collide across path and target name.
 */
function createDeclarationLookupKey(declaration: PythonTestModuleDeclaration): string {
  return `${declaration.declarationPath}\0${declaration.testName}`;
}

/**
 * Converts one linked Python declaration into a canonical module record and classifies its derived path.
 *
 * @param coreCommit - Immutable pinned core commit to attach to the record.
 * @param constructor - Inventoried PythonTest constructor that owns the module.
 * @param declaration - Parsed module declaration with makefile provenance.
 * @param trackedPaths - Exact tracked core paths used for literal module classification.
 * @returns One canonical linked Python module record.
 */
function createModuleRecord(
  coreCommit: string,
  constructor: CoreTestRecord,
  declaration: PythonTestModuleDeclaration,
  trackedPaths: ReadonlySet<string>,
): CorePythonTestModuleRecord {
  const modulePath =
    declaration.targetKind === "literal"
      ? `${declaration.sourceDirectory}/${declaration.declaredModule}.py`
      : null;
  const targetStatus: CorePythonTestModuleStatus =
    modulePath === null ? "expression" : trackedPaths.has(modulePath) ? "tracked" : "missing";
  return {
    commit: coreCommit,
    constructorId: constructor.id,
    corpusId: "core",
    declarationPath: declaration.declarationPath,
    declaredModule: declaration.declaredModule,
    id: `LO-CORE-PYTHON-MODULE:${constructor.id}:${targetStatus}:${declaration.sourceDirectory}:${declaration.declaredModule}`,
    mappingStatus: "unmapped",
    modulePath,
    sourceDirectory: declaration.sourceDirectory,
    targetStatus,
  };
}

/**
 * Produces exact per-status Python module counts from generated records.
 *
 * @param records - Linked Python module records in any order.
 * @returns Immutable tracked, missing, and expression count summary.
 */
function createSummary(
  records: readonly CorePythonTestModuleRecord[],
): Readonly<Record<CorePythonTestModuleStatus, number>> {
  const summary: Record<CorePythonTestModuleStatus, number> = {
    expression: 0,
    missing: 0,
    tracked: 0,
  };
  for (const record of records) summary[record.targetStatus] += 1;
  return summary;
}

/**
 * Rejects incomplete or unexpectedly expanded Python module records against the pinned baseline contract.
 *
 * @param summary - Observed per-status Python module counts.
 * @returns Nothing; count mismatches throw an error.
 * @throws {Error} When any observed status count differs from the pinned declaration count.
 */
function assertExpectedCounts(summary: Readonly<Record<CorePythonTestModuleStatus, number>>): void {
  for (const status of ["expression", "missing", "tracked"] as const) {
    if (summary[status] !== expectedCorePythonTestModuleCounts[status]) {
      throw new Error(`Unexpected ${status} PythonTest module count: ${summary[status]}`);
    }
  }
}

/**
 * Rejects repeated stable IDs so overlapping declarations cannot silently collapse provenance evidence.
 *
 * @param records - Python module records before canonical sorting.
 * @returns Nothing; duplicate IDs throw an error.
 * @throws {Error} When any Python module record ID appears more than once.
 */
function assertUniqueRecords(records: readonly CorePythonTestModuleRecord[]): void {
  const ids = new Set(records.map(selectRecordId));
  if (ids.size !== records.length)
    throw new Error("PythonTest module input contains duplicate declaration records.");
}

/**
 * Extracts a Python module record ID for duplicate detection.
 *
 * @param record - Parsed Python module record.
 * @returns Stable record identifier.
 */
function selectRecordId(record: CorePythonTestModuleRecord): string {
  return record.id;
}

/**
 * Orders Python module records by constructor ID, target status, source directory, then module name.
 *
 * @param left - First Python module record.
 * @param right - Second Python module record.
 * @returns Negative or positive deterministic comparison result for unique records.
 */
function compareRecords(
  left: CorePythonTestModuleRecord,
  right: CorePythonTestModuleRecord,
): number {
  const leftKey = `${left.constructorId}\0${left.targetStatus}\0${left.sourceDirectory}\0${left.declaredModule}`;
  const rightKey = `${right.constructorId}\0${right.targetStatus}\0${right.sourceDirectory}\0${right.declaredModule}`;
  return leftKey < rightKey ? -1 : 1;
}
