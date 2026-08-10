/**
 * @fileoverview Verifies JunitTest constructor linkage, tracked-versus-missing Java path classification, and pinned source-target count guards.
 */

import { describe, expect, it } from "vitest";

import type { CoreTestInventory } from "./contracts";
import {
  createCoreJunitSourceTargetInventory,
  expectedCoreJunitSourceTargetCounts,
} from "./junit-source-target-inventory";
import type { JunitSourceTargetDeclaration } from "./junit-source-target-inventory";

/**
 * Provides a JunitTest constructor inventory fixture matching the pinned source-target count contract.
 *
 * @returns Complete canonical constructor inventory fixture.
 */
function createConstructorInventory(): CoreTestInventory {
  return {
    coreCommit: "core-commit",
    corpusId: "core",
    generatedBy: "inventory:tests",
    records: [
      {
        commit: "core-commit",
        corpusId: "core",
        id: "LO-CORE-TEST:JunitTest:alpha/JunitTest_alpha.mk:12",
        kind: "JunitTest",
        line: 12,
        mappingStatus: "unmapped",
        referencePath: "alpha/JunitTest_alpha.mk",
        testName: "alpha",
      },
    ],
    schemaVersion: 1,
    summary: { CppunitTest: 415, JunitTest: 58, PythonTest: 13, UITest: 79 },
  };
}

/**
 * Creates literal declarations that match pinned tracked and missing JunitTest source-target counts.
 *
 * @returns Java source-target declarations covering every successful physical-path status.
 */
function createPinnedDeclarations(): readonly JunitSourceTargetDeclaration[] {
  return [
    ...Array.from(
      { length: expectedCoreJunitSourceTargetCounts.tracked },
      createTrackedDeclaration,
    ),
    ...Array.from(
      { length: expectedCoreJunitSourceTargetCounts.missing },
      createMissingDeclaration,
    ),
  ];
}

/**
 * Creates one unique tracked literal declaration for the pinned-count fixture.
 *
 * @param unusedValue - Array factory value, deliberately unused because only the index identifies the target.
 * @param index - Zero-based tracked target index.
 * @returns One valid linked literal Java source-target declaration.
 */
function createTrackedDeclaration(unusedValue: unknown, index: number) {
  void unusedValue;
  return {
    declarationPath: "alpha/JunitTest_alpha.mk",
    declaredTarget: `alpha/tracked-${index}`,
    targetKind: "literal" as const,
    testName: "alpha",
  };
}

/**
 * Creates one unique missing literal declaration for the pinned-count fixture.
 *
 * @param unusedValue - Array factory value, deliberately unused because only the index identifies the target.
 * @param index - Zero-based missing target index.
 * @returns One valid linked literal Java source-target declaration that has no Git path fixture.
 */
function createMissingDeclaration(unusedValue: unknown, index: number) {
  void unusedValue;
  return {
    declarationPath: "alpha/JunitTest_alpha.mk",
    declaredTarget: `alpha/missing-${index}`,
    targetKind: "literal" as const,
    testName: "alpha",
  };
}

/**
 * Creates Git-tracked Java paths matching every tracked literal fixture declaration.
 *
 * @returns Exact physical source paths for every fixture tracked literal target.
 */
function createTrackedPaths(): readonly string[] {
  return Array.from(
    { length: expectedCoreJunitSourceTargetCounts.tracked },
    /**
     * Converts one fixture index into its tracked physical .java path.
     *
     * @param unusedValue - Array factory value, deliberately unused because only the index identifies the path.
     * @param index - Zero-based tracked target index.
     * @returns Exact core-repository-relative tracked Java source path.
     */
    function createTrackedPath(unusedValue: unknown, index: number): string {
      void unusedValue;
      return `alpha/tracked-${index}.java`;
    },
  );
}

describe("createCoreJunitSourceTargetInventory" /**
 * Groups canonical Java-source linkage, physical-path status classification, and guarded failure cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineJunitSourceTargetInventoryTests(): void {
  it("links tracked and missing Java targets to their inventoried JunitTest constructor" /**
   * Verifies canonical record metadata preserves both physical-path statuses instead of dropping stale declarations.
   *
   * @returns Nothing; assertions validate the generated Junit source-target inventory contract.
   */, function createsCanonicalInventory(): void {
    const inventory = createCoreJunitSourceTargetInventory(
      "core-commit",
      createConstructorInventory(),
      createPinnedDeclarations(),
      createTrackedPaths(),
    );

    expect(inventory).toMatchObject({
      coreCommit: "core-commit",
      generatedBy: "inventory:junit-source-targets",
      schemaVersion: 1,
      summary: expectedCoreJunitSourceTargetCounts,
    });
    expect(inventory.records).toHaveLength(160);
    expect(inventory.records.find(selectMissingRecord)).toMatchObject({
      sourcePath: "alpha/missing-0.java",
      targetStatus: "missing",
    });
    expect(inventory.records.find(selectTrackedRecord)).toMatchObject({
      sourcePath: "alpha/tracked-0.java",
      targetStatus: "tracked",
    });
  });

  it("rejects commit mismatch, unknown constructors, expression drift, duplicates, and count drift" /**
   * Verifies the generated inventory cannot silently break constructor provenance or its pinned completeness contract.
   *
   * @returns Nothing; assertions validate guarded invalid-input behavior.
   */, function rejectsInvalidInventoryInputs(): void {
    const constructors = createConstructorInventory();
    const declarations = createPinnedDeclarations();
    const trackedPaths = createTrackedPaths();
    expectInventoryError("other-commit", constructors, declarations, trackedPaths);
    expectInventoryError(
      "core-commit",
      constructors,
      [
        ...declarations.slice(1),
        {
          declarationPath: "other/JunitTest_other.mk",
          declaredTarget: "other/Test",
          targetKind: "literal",
          testName: "other",
        },
      ],
      trackedPaths,
    );
    expectInventoryError(
      "core-commit",
      constructors,
      [
        ...declarations.slice(1),
        {
          declarationPath: "alpha/JunitTest_alpha.mk",
          declaredTarget: "$(if $(FLAG),alpha/conditional)",
          targetKind: "expression",
          testName: "alpha",
        },
      ],
      trackedPaths,
    );
    expectInventoryError(
      "core-commit",
      constructors,
      [...declarations, createTrackedDeclaration(undefined, 0)],
      trackedPaths,
    );
    expectInventoryError("core-commit", constructors, declarations.slice(1), trackedPaths);
  });
});

/**
 * Identifies one missing Java source-target record for assertions.
 *
 * @param record - Generated Java source-target record to inspect.
 * @param record.targetStatus - Resolution status that selects missing records.
 * @returns True only for declared-but-absent records.
 */
function selectMissingRecord(record: { readonly targetStatus: string }): boolean {
  return record.targetStatus === "missing";
}

/**
 * Identifies one tracked Java source-target record for assertions.
 *
 * @param record - Generated Java source-target record to inspect.
 * @param record.targetStatus - Resolution status that selects tracked records.
 * @returns True only for Git-tracked records.
 */
function selectTrackedRecord(record: { readonly targetStatus: string }): boolean {
  return record.targetStatus === "tracked";
}

/**
 * Expects one invalid Junit source-target inventory input to throw an explicit validation error.
 *
 * @param coreCommit - Core commit passed to inventory creation.
 * @param constructors - Constructor inventory fixture.
 * @param declarations - Parsed Junit source-target declaration fixture.
 * @param trackedPaths - Git-tracked path fixture.
 * @returns Nothing; assertion validates guarded failure behavior.
 */
function expectInventoryError(
  coreCommit: string,
  constructors: CoreTestInventory,
  declarations: ReturnType<typeof createPinnedDeclarations>,
  trackedPaths: readonly string[],
): void {
  expect(
    /**
     * Invokes Junit source-target inventory creation under an expected error assertion.
     *
     * @returns Inventory result that never returns for invalid input.
     */
    function createInvalidInventory(): unknown {
      return createCoreJunitSourceTargetInventory(
        coreCommit,
        constructors,
        declarations,
        trackedPaths,
      );
    },
  ).toThrowError();
}
