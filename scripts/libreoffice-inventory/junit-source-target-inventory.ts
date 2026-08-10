/**
 * @fileoverview Links parsed JunitTest Java source targets to inventoried constructors and preserves both tracked and absent pinned paths as explicit provenance states.
 */

import type {
  CoreJunitSourceTargetInventory,
  CoreJunitSourceTargetRecord,
  CoreJunitSourceTargetStatus,
  CoreTestInventory,
  CoreTestRecord,
} from "./contracts";
import type { GbuildSourceTarget } from "./gbuild-source-targets";

/** Immutable linked Java-target counts observed from pinned libreoffice-26.8.0.2 JunitTest sourcefile declarations. */
export const expectedCoreJunitSourceTargetCounts: Readonly<
  Record<CoreJunitSourceTargetStatus, number>
> = {
  expression: 0,
  missing: 4,
  tracked: 156,
};

/** Associates one parsed JunitTest source target with the makefile that declares it. */
export interface JunitSourceTargetDeclaration extends GbuildSourceTarget {
  /** Exact core-repository-relative makefile path that declares the target. */
  readonly declarationPath: string;
}

/**
 * Creates the canonical Java source-target inventory for JunitTest constructors in the core test inventory.
 *
 * @param coreCommit - Immutable pinned core commit shared by all generated records.
 * @param constructors - Complete canonical core test-constructor inventory used for ID linkage.
 * @param declarations - Parsed JunitTest source targets together with their makefile provenance.
 * @param trackedPaths - Exact Git-tracked core paths used to classify literal .java source paths.
 * @returns Deterministically ordered linked Java source-target inventory with pinned count guards.
 * @throws {Error} When constructors mismatch the commit, a declaration lacks a JunitTest owner, records duplicate, or counts drift.
 */
export function createCoreJunitSourceTargetInventory(
  coreCommit: string,
  constructors: CoreTestInventory,
  declarations: readonly JunitSourceTargetDeclaration[],
  trackedPaths: readonly string[],
): CoreJunitSourceTargetInventory {
  if (constructors.coreCommit !== coreCommit) {
    throw new Error(
      "Core test constructor inventory commit does not match Junit source-target extraction.",
    );
  }

  const constructorsByLocation = new Map(
    constructors.records.filter(isJunitConstructor).map(createConstructorEntry),
  );
  const trackedPathSet = new Set(trackedPaths);
  const records = declarations.map(
    /**
     * Converts one parsed declaration to a record after requiring a matching inventoried JunitTest constructor.
     *
     * @param declaration - Parsed target and exact makefile provenance.
     * @returns One canonical Java source-target record.
     * @throws {Error} When the declaration has no JunitTest constructor record.
     */
    function createLinkedRecord(
      declaration: JunitSourceTargetDeclaration,
    ): CoreJunitSourceTargetRecord {
      const constructor = constructorsByLocation.get(createDeclarationLookupKey(declaration));
      if (constructor === undefined) {
        throw new Error(
          `JunitTest source target has no inventoried constructor: ${declaration.declarationPath}:${declaration.testName}`,
        );
      }
      return createSourceTargetRecord(coreCommit, constructor, declaration, trackedPathSet);
    },
  );
  assertUniqueRecords(records);
  const summary = createSummary(records);
  assertExpectedCounts(summary);

  return {
    coreCommit,
    corpusId: "core",
    generatedBy: "inventory:junit-source-targets",
    records: [...records].sort(compareRecords),
    schemaVersion: 1,
    summary,
  };
}

/**
 * Determines whether one core test-constructor record belongs to the JunitTest family.
 *
 * @param record - Candidate core test-constructor record.
 * @returns True only for JunitTest records with Java source declarations in scope.
 */
function isJunitConstructor(record: CoreTestRecord): boolean {
  return record.kind === "JunitTest";
}

/**
 * Creates a lookup entry for one JunitTest constructor's declaration path and target name.
 *
 * @param constructor - Inventoried JunitTest constructor.
 * @returns Stable location key and original constructor record.
 */
function createConstructorEntry(constructor: CoreTestRecord): readonly [string, CoreTestRecord] {
  return [createConstructorLookupKey(constructor), constructor];
}

/**
 * Creates a makefile-and-name lookup key for an inventoried JunitTest constructor.
 *
 * @param constructor - Inventoried JunitTest constructor with exact makefile provenance.
 * @returns Deterministic key that cannot collide across path and target name.
 */
function createConstructorLookupKey(constructor: CoreTestRecord): string {
  return `${constructor.referencePath}\0${constructor.testName}`;
}

/**
 * Creates a makefile-and-name lookup key for a parsed JunitTest source-target declaration.
 *
 * @param declaration - Parsed Java target declaration with exact makefile provenance.
 * @returns Deterministic key that cannot collide across path and target name.
 */
function createDeclarationLookupKey(declaration: JunitSourceTargetDeclaration): string {
  return `${declaration.declarationPath}\0${declaration.testName}`;
}

/**
 * Converts one linked Java declaration into a canonical source-target record and classifies its pinned path.
 *
 * @param coreCommit - Immutable pinned core commit to attach to the record.
 * @param constructor - Inventoried JunitTest constructor that owns the target.
 * @param declaration - Parsed source-target declaration with makefile provenance.
 * @param trackedPaths - Exact tracked core paths used for literal source classification.
 * @returns One canonical linked Java source-target record.
 */
function createSourceTargetRecord(
  coreCommit: string,
  constructor: CoreTestRecord,
  declaration: JunitSourceTargetDeclaration,
  trackedPaths: ReadonlySet<string>,
): CoreJunitSourceTargetRecord {
  const sourcePath =
    declaration.targetKind === "literal" ? `${declaration.declaredTarget}.java` : null;
  const targetStatus: CoreJunitSourceTargetStatus =
    sourcePath === null ? "expression" : trackedPaths.has(sourcePath) ? "tracked" : "missing";
  return {
    commit: coreCommit,
    constructorId: constructor.id,
    corpusId: "core",
    declarationPath: declaration.declarationPath,
    declaredTarget: declaration.declaredTarget,
    id: `LO-CORE-JUNIT-SOURCE:${constructor.id}:${targetStatus}:${declaration.declaredTarget}`,
    mappingStatus: "unmapped",
    sourcePath,
    targetStatus,
  };
}

/**
 * Produces exact per-status Java source-target counts from generated records.
 *
 * @param records - Linked Java source-target records in any order.
 * @returns Immutable tracked, missing, and expression count summary.
 */
function createSummary(
  records: readonly CoreJunitSourceTargetRecord[],
): Readonly<Record<CoreJunitSourceTargetStatus, number>> {
  const summary: Record<CoreJunitSourceTargetStatus, number> = {
    expression: 0,
    missing: 0,
    tracked: 0,
  };
  for (const record of records) {
    summary[record.targetStatus] += 1;
  }
  return summary;
}

/**
 * Rejects incomplete or unexpectedly expanded Java source-target records against the pinned baseline contract.
 *
 * @param summary - Observed per-status Java source-target counts.
 * @returns Nothing; count mismatches throw an error.
 * @throws {Error} When any observed status count differs from the pinned declaration count.
 */
function assertExpectedCounts(
  summary: Readonly<Record<CoreJunitSourceTargetStatus, number>>,
): void {
  for (const status of ["expression", "missing", "tracked"] as const) {
    if (summary[status] !== expectedCoreJunitSourceTargetCounts[status]) {
      throw new Error(`Unexpected ${status} JunitTest source target count: ${summary[status]}`);
    }
  }
}

/**
 * Rejects repeated stable IDs so overlapping declarations cannot silently collapse provenance evidence.
 *
 * @param records - Java source-target records before canonical sorting.
 * @returns Nothing; duplicate IDs throw an error.
 * @throws {Error} When any Java source-target record ID appears more than once.
 */
function assertUniqueRecords(records: readonly CoreJunitSourceTargetRecord[]): void {
  const ids = new Set(records.map(selectRecordId));
  if (ids.size !== records.length) {
    throw new Error("JunitTest source-target input contains duplicate declaration records.");
  }
}

/**
 * Extracts a Java source-target record ID for duplicate detection.
 *
 * @param record - Parsed Java source-target record.
 * @returns Stable record identifier.
 */
function selectRecordId(record: CoreJunitSourceTargetRecord): string {
  return record.id;
}

/**
 * Orders Java source-target records by constructor ID, target status, declaration path, then target value.
 *
 * @param left - First Java source-target record.
 * @param right - Second Java source-target record.
 * @returns Negative or positive deterministic comparison result for unique records.
 */
function compareRecords(
  left: CoreJunitSourceTargetRecord,
  right: CoreJunitSourceTargetRecord,
): number {
  const leftKey = `${left.constructorId}\0${left.targetStatus}\0${left.declarationPath}\0${left.declaredTarget}`;
  const rightKey = `${right.constructorId}\0${right.targetStatus}\0${right.declarationPath}\0${right.declaredTarget}`;
  return leftKey < rightKey ? -1 : 1;
}
