/**
 * @fileoverview Links parsed Cppunit registration macros to existing physical Cppunit source-target and constructor provenance records.
 */

import type {
  CoreCppunitRegistrationInventory,
  CoreCppunitRegistrationKind,
  CoreCppunitRegistrationRecord,
  CoreTestSourceTargetInventory,
  CoreTestSourceTargetRecord,
} from "./contracts";
import type { CppunitRegistration } from "./cppunit-registrations";

/** Immutable registration counts observed from pinned libreoffice-26.8.0.2 physical Cppunit source targets. */
export const expectedCoreCppunitRegistrationCounts: Readonly<
  Record<CoreCppunitRegistrationKind, number>
> = { CPPUNIT_TEST: 3508, CPPUNIT_TEST_FIXTURE: 4564 };

/** Associates one parsed Cppunit registration with its exact physical C++ source path. */
export interface CppunitRegistrationDeclaration extends CppunitRegistration {
  /** Exact Git-tracked core-repository-relative C++ source path that contains the registration. */
  readonly sourcePath: string;
}

/**
 * Creates the canonical Cppunit registration inventory linked to existing physical source-target records.
 *
 * @param coreCommit - Immutable pinned core commit shared by all generated records.
 * @param sourceTargets - Complete canonical Cppunit source-target inventory used for constructor and source-target ID linkage.
 * @param declarations - Parsed Cppunit registrations together with physical source-path provenance.
 * @returns Deterministically ordered Cppunit registration inventory with pinned count guards.
 * @throws {Error} When source targets mismatch the commit, a registration has no physical Cppunit source target, records duplicate, or counts drift.
 */
export function createCoreCppunitRegistrationInventory(
  coreCommit: string,
  sourceTargets: CoreTestSourceTargetInventory,
  declarations: readonly CppunitRegistrationDeclaration[],
): CoreCppunitRegistrationInventory {
  if (sourceTargets.coreCommit !== coreCommit) {
    throw new Error(
      "Cppunit source-target inventory commit does not match registration extraction.",
    );
  }
  const targetByPath = new Map(
    sourceTargets.records.filter(isTrackedCppunitSourceTarget).map(createSourceTargetEntry),
  );
  const records = declarations.map(
    /**
     * Converts one registration only after requiring physical source-target provenance.
     *
     * @param declaration - Parsed Cppunit registration and exact physical source path.
     * @returns One linked Cppunit registration record.
     * @throws {Error} When no existing physical Cppunit source target owns sourcePath.
     */
    function createLinkedRecord(
      declaration: CppunitRegistrationDeclaration,
    ): CoreCppunitRegistrationRecord {
      const sourceTarget = targetByPath.get(declaration.sourcePath);
      if (sourceTarget === undefined) {
        throw new Error(
          `Cppunit registration has no physical source target: ${declaration.sourcePath}`,
        );
      }
      return createRecord(coreCommit, sourceTarget, declaration);
    },
  );
  assertUniqueRecords(records);
  const summary = createSummary(records);
  assertExpectedCounts(summary);
  return {
    coreCommit,
    corpusId: "core",
    generatedBy: "inventory:cppunit-registrations",
    records: [...records].sort(compareRecords),
    schemaVersion: 1,
    summary,
  };
}

/**
 * Determines whether a source-target record owns a physical C++ file suitable for registration parsing.
 *
 * @param record - Candidate Cppunit source-target record.
 * @returns True only for records that resolve to tracked physical C++ source paths.
 */
function isTrackedCppunitSourceTarget(record: CoreTestSourceTargetRecord): boolean {
  return record.targetStatus === "tracked" && record.sourcePath !== null;
}

/**
 * Creates a lookup entry for one physical Cppunit source-target record.
 *
 * @param sourceTarget - Inventoried tracked physical Cppunit source target.
 * @returns Stable physical path key and original source-target record.
 */
function createSourceTargetEntry(
  sourceTarget: CoreTestSourceTargetRecord,
): readonly [string, CoreTestSourceTargetRecord] {
  /* v8 ignore next -- the preceding tracked-source predicate guarantees a non-null physical path. */
  if (sourceTarget.sourcePath === null) {
    throw new Error("Tracked Cppunit source target lacks a physical source path.");
  }
  return [sourceTarget.sourcePath, sourceTarget];
}

/**
 * Creates one canonical Cppunit registration record from physical source-target provenance.
 *
 * @param coreCommit - Immutable pinned core commit to attach to the record.
 * @param sourceTarget - Existing physical Cppunit source-target record.
 * @param declaration - Parsed Cppunit registration and physical source path.
 * @returns One canonical linked Cppunit registration record.
 */
function createRecord(
  coreCommit: string,
  sourceTarget: CoreTestSourceTargetRecord,
  declaration: CppunitRegistrationDeclaration,
): CoreCppunitRegistrationRecord {
  return {
    commit: coreCommit,
    constructorId: sourceTarget.constructorId,
    corpusId: "core",
    fixtureName: declaration.fixtureName,
    id: `LO-CORE-CPPUNIT-REGISTRATION:${sourceTarget.id}:${declaration.line}:${declaration.kind}:${declaration.testName}`,
    kind: declaration.kind,
    line: declaration.line,
    mappingStatus: "unmapped",
    sourcePath: declaration.sourcePath,
    sourceTargetId: sourceTarget.id,
    testName: declaration.testName,
  };
}

/**
 * Produces exact per-macro Cppunit registration counts from generated records.
 *
 * @param records - Linked Cppunit registration records in any order.
 * @returns Immutable CPPUNIT_TEST and CPPUNIT_TEST_FIXTURE count summary.
 */
function createSummary(
  records: readonly CoreCppunitRegistrationRecord[],
): Readonly<Record<CoreCppunitRegistrationKind, number>> {
  const summary: Record<CoreCppunitRegistrationKind, number> = {
    CPPUNIT_TEST: 0,
    CPPUNIT_TEST_FIXTURE: 0,
  };
  for (const record of records) summary[record.kind] += 1;
  return summary;
}

/**
 * Rejects incomplete or unexpectedly expanded registration records against the pinned baseline contract.
 *
 * @param summary - Observed per-macro registration counts.
 * @returns Nothing; count mismatches throw an error.
 * @throws {Error} When any observed macro count differs from the pinned registration count.
 */
function assertExpectedCounts(
  summary: Readonly<Record<CoreCppunitRegistrationKind, number>>,
): void {
  for (const kind of ["CPPUNIT_TEST", "CPPUNIT_TEST_FIXTURE"] as const) {
    if (summary[kind] !== expectedCoreCppunitRegistrationCounts[kind]) {
      throw new Error(`Unexpected ${kind} Cppunit registration count: ${summary[kind]}`);
    }
  }
}

/**
 * Rejects repeated stable IDs so duplicate parser output cannot silently collapse registration evidence.
 *
 * @param records - Cppunit registration records before canonical sorting.
 * @returns Nothing; duplicate IDs throw an error.
 * @throws {Error} When any Cppunit registration record ID appears more than once.
 */
function assertUniqueRecords(records: readonly CoreCppunitRegistrationRecord[]): void {
  const ids = new Set(records.map(selectRecordId));
  if (ids.size !== records.length)
    throw new Error("Cppunit registration input contains duplicate records.");
}

/**
 * Extracts a Cppunit registration record ID for duplicate detection.
 *
 * @param record - Generated Cppunit registration record.
 * @returns Stable record identifier.
 */
function selectRecordId(record: CoreCppunitRegistrationRecord): string {
  return record.id;
}

/**
 * Orders Cppunit registration records by source path, line, macro kind, fixture, then test method.
 *
 * @param left - First Cppunit registration record.
 * @param right - Second Cppunit registration record.
 * @returns Negative or positive deterministic comparison result for unique records.
 */
function compareRecords(
  left: CoreCppunitRegistrationRecord,
  right: CoreCppunitRegistrationRecord,
): number {
  const leftKey = `${left.sourcePath}\0${left.line}\0${left.kind}\0${left.fixtureName}\0${left.testName}`;
  const rightKey = `${right.sourcePath}\0${right.line}\0${right.kind}\0${right.fixtureName}\0${right.testName}`;
  return leftKey < rightKey ? -1 : 1;
}
