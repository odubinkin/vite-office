/**
 * @fileoverview Links parsed CppunitTest source targets to inventoried constructors and verifies every literal target against the pinned core Git path set.
 */

import type {
  CoreTestInventory,
  CoreTestRecord,
  CoreTestSourceTargetInventory,
  CoreTestSourceTargetRecord,
  CoreTestSourceTargetStatus,
} from "./contracts";
import type { CppunitSourceTarget } from "./test-source-targets";

/** Immutable linked target counts observed from the pinned libreoffice-26.8.0.2 core source declarations. */
export const expectedCoreTestSourceTargetCounts: Readonly<
  Record<CoreTestSourceTargetStatus, number>
> = {
  expression: 2,
  tracked: 684,
};

/** Associates one parsed CppunitTest source target with the makefile that declares it. */
export interface CppunitSourceTargetDeclaration extends CppunitSourceTarget {
  /** Exact core-repository-relative makefile path that declares the target. */
  readonly declarationPath: string;
}

/**
 * Creates the canonical source-target inventory for CppunitTest constructors already present in the core test inventory.
 *
 * @param coreCommit - Immutable pinned core commit shared by all generated records.
 * @param constructors - Complete canonical core test-constructor inventory used for ID linkage.
 * @param declarations - Parsed CppunitTest source targets together with their makefile provenance.
 * @param trackedPaths - Exact Git-tracked core paths used to validate literal .cxx source paths.
 * @returns Deterministically ordered linked source-target inventory with pinned count guards.
 * @throws {Error} When the supplied constructor inventory is mismatched, duplicated, or any literal target is absent from Git.
 */
export function createCoreTestSourceTargetInventory(
  coreCommit: string,
  constructors: CoreTestInventory,
  declarations: readonly CppunitSourceTargetDeclaration[],
  trackedPaths: readonly string[],
): CoreTestSourceTargetInventory {
  if (constructors.coreCommit !== coreCommit) {
    throw new Error(
      "Core test constructor inventory commit does not match source-target extraction.",
    );
  }

  const constructorsByLocation = new Map(
    constructors.records.filter(isCppunitConstructor).map(createConstructorEntry),
  );
  const trackedPathSet = new Set(trackedPaths);
  const records = declarations.flatMap(
    /**
     * Creates a source-target record only when the declaration has an inventoried CppunitTest owner.
     *
     * @param declaration - Parsed target and makefile provenance.
     * @returns A one-record array for linked declarations, or empty for non-inventoried legacy declarations.
     */
    function createLinkedRecord(
      declaration: CppunitSourceTargetDeclaration,
    ): readonly CoreTestSourceTargetRecord[] {
      const constructor = constructorsByLocation.get(createDeclarationLookupKey(declaration));
      return constructor === undefined
        ? []
        : [createSourceTargetRecord(coreCommit, constructor, declaration, trackedPathSet)];
    },
  );
  assertUniqueRecords(records);
  const summary = createSummary(records);
  assertExpectedCounts(summary);

  return {
    coreCommit,
    corpusId: "core",
    generatedBy: "inventory:test-source-targets",
    records: [...records].sort(compareRecords),
    schemaVersion: 1,
    summary,
  };
}

/**
 * Determines whether one core test-constructor record belongs to the CppunitTest family.
 *
 * @param record - Candidate core test-constructor record.
 * @returns True only for CppunitTest records with source-target declarations in scope.
 */
function isCppunitConstructor(record: CoreTestRecord): boolean {
  return record.kind === "CppunitTest";
}

/**
 * Creates a lookup entry for a CppunitTest constructor's declaration path and test name.
 *
 * @param constructor - Inventoried CppunitTest constructor.
 * @returns Stable location key and original constructor record.
 */
function createConstructorEntry(constructor: CoreTestRecord): readonly [string, CoreTestRecord] {
  return [createConstructorLookupKey(constructor), constructor];
}

/**
 * Creates a makefile-and-name lookup key for an inventoried CppunitTest constructor.
 *
 * @param constructor - Inventoried CppunitTest constructor with exact makefile provenance.
 * @returns A deterministic key that cannot collide across the two fields.
 */
function createConstructorLookupKey(constructor: CoreTestRecord): string {
  return `${constructor.referencePath}\0${constructor.testName}`;
}

/**
 * Creates a makefile-and-name lookup key for one parsed CppunitTest source-target declaration.
 *
 * @param declaration - Parsed target declaration with exact makefile provenance.
 * @returns A deterministic key that cannot collide across the two fields.
 */
function createDeclarationLookupKey(declaration: CppunitSourceTargetDeclaration): string {
  return `${declaration.declarationPath}\0${declaration.testName}`;
}

/**
 * Converts one linked declaration into a canonical source-target record and validates literal physical paths.
 *
 * @param coreCommit - Immutable pinned core commit to attach to the record.
 * @param constructor - Inventoried CppunitTest constructor that owns the target.
 * @param declaration - Parsed source-target declaration with makefile provenance.
 * @param trackedPaths - Exact tracked core paths used for literal source validation.
 * @returns One canonical linked source-target record.
 * @throws {Error} When a literal source target does not resolve to a tracked .cxx path.
 */
function createSourceTargetRecord(
  coreCommit: string,
  constructor: CoreTestRecord,
  declaration: CppunitSourceTargetDeclaration,
  trackedPaths: ReadonlySet<string>,
): CoreTestSourceTargetRecord {
  const sourcePath =
    declaration.targetKind === "literal" ? `${declaration.declaredTarget}.cxx` : null;
  if (sourcePath !== null && !trackedPaths.has(sourcePath)) {
    throw new Error(`CppunitTest source target is not Git-tracked: ${sourcePath}`);
  }

  const targetStatus: CoreTestSourceTargetStatus = sourcePath === null ? "expression" : "tracked";
  return {
    commit: coreCommit,
    constructorId: constructor.id,
    corpusId: "core",
    declarationPath: declaration.declarationPath,
    declaredTarget: declaration.declaredTarget,
    id: `LO-CORE-TEST-SOURCE:${constructor.id}:${targetStatus}:${declaration.declaredTarget}`,
    mappingStatus: "unmapped",
    sourcePath,
    targetStatus,
  };
}

/**
 * Produces exact per-status source-target counts from generated records.
 *
 * @param records - Linked source-target records in any order.
 * @returns Immutable tracked and expression count summary.
 */
function createSummary(
  records: readonly CoreTestSourceTargetRecord[],
): Readonly<Record<CoreTestSourceTargetStatus, number>> {
  const summary: Record<CoreTestSourceTargetStatus, number> = { expression: 0, tracked: 0 };
  for (const record of records) {
    summary[record.targetStatus] += 1;
  }
  return summary;
}

/**
 * Rejects incomplete or unexpectedly expanded source target records against the pinned baseline contract.
 *
 * @param summary - Observed per-status source-target counts.
 * @returns Nothing; count mismatches throw an error.
 * @throws {Error} When either observed status count differs from the pinned declaration count.
 */
function assertExpectedCounts(summary: Readonly<Record<CoreTestSourceTargetStatus, number>>): void {
  for (const status of ["expression", "tracked"] as const) {
    if (summary[status] !== expectedCoreTestSourceTargetCounts[status]) {
      throw new Error(`Unexpected ${status} CppunitTest source target count: ${summary[status]}`);
    }
  }
}

/**
 * Rejects repeated stable IDs so overlapping macros cannot silently collapse provenance evidence.
 *
 * @param records - Source-target records before canonical sorting.
 * @returns Nothing; duplicate IDs throw an error.
 * @throws {Error} When any source-target record ID appears more than once.
 */
function assertUniqueRecords(records: readonly CoreTestSourceTargetRecord[]): void {
  const ids = new Set(records.map(selectRecordId));
  if (ids.size !== records.length) {
    throw new Error("Core test source-target input contains duplicate declaration records.");
  }
}

/**
 * Extracts a source-target record ID for duplicate detection.
 *
 * @param record - Parsed source-target record.
 * @returns Stable record identifier.
 */
function selectRecordId(record: CoreTestSourceTargetRecord): string {
  return record.id;
}

/**
 * Orders source-target records by constructor ID, target status, declaration path, then target value.
 *
 * @param left - First source-target record.
 * @param right - Second source-target record.
 * @returns Negative or positive deterministic comparison result for unique records.
 */
function compareRecords(
  left: CoreTestSourceTargetRecord,
  right: CoreTestSourceTargetRecord,
): number {
  const leftKey = `${left.constructorId}\0${left.targetStatus}\0${left.declarationPath}\0${left.declaredTarget}`;
  const rightKey = `${right.constructorId}\0${right.targetStatus}\0${right.declarationPath}\0${right.declaredTarget}`;
  return leftKey < rightKey ? -1 : 1;
}
