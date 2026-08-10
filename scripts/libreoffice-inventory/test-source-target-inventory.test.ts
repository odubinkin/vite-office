/**
 * @fileoverview Verifies constructor linkage, physical-path validation, omission of non-inventoried declarations, and pinned source-target count guards.
 */

import { describe, expect, it } from "vitest";

import type { CoreTestInventory } from "./contracts";
import {
  createCoreTestSourceTargetInventory,
  expectedCoreTestSourceTargetCounts,
} from "./test-source-target-inventory";

/**
 * Provides a CppunitTest constructor inventory fixture matching the pinned source-target count contract.
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
        id: "LO-CORE-TEST:CppunitTest:alpha/CppunitTest_alpha.mk:12",
        kind: "CppunitTest",
        line: 12,
        mappingStatus: "unmapped",
        referencePath: "alpha/CppunitTest_alpha.mk",
        testName: "alpha",
      },
    ],
    schemaVersion: 1,
    summary: { CppunitTest: 415, JunitTest: 58, PythonTest: 13, UITest: 79 },
  };
}

/**
 * Creates declarations that match the pinned tracked and expression count guards without duplicating fixture prose.
 *
 * @returns Literal and expression source-target declaration fixtures.
 */
function createPinnedDeclarations() {
  return [
    ...Array.from({ length: expectedCoreTestSourceTargetCounts.tracked }, createTrackedDeclaration),
    ...Array.from(
      { length: expectedCoreTestSourceTargetCounts.expression },
      createExpressionDeclaration,
    ),
  ];
}

/**
 * Creates one unique literal declaration for the pinned-count fixture.
 *
 * @param unusedValue - Array factory value, deliberately unused because only the index identifies the target.
 * @param index - Zero-based literal target index.
 * @returns One valid linked literal source-target declaration.
 */
function createTrackedDeclaration(unusedValue: unknown, index: number) {
  void unusedValue;
  return {
    declarationPath: "alpha/CppunitTest_alpha.mk",
    declaredTarget: `alpha/test-${index}`,
    targetKind: "literal" as const,
    testName: "alpha",
  };
}

/**
 * Creates one unique expression declaration for the pinned-count fixture.
 *
 * @param unusedValue - Array factory value, deliberately unused because only the index identifies the target.
 * @param index - Zero-based expression target index.
 * @returns One valid linked expression source-target declaration.
 */
function createExpressionDeclaration(unusedValue: unknown, index: number) {
  void unusedValue;
  return {
    declarationPath: "alpha/CppunitTest_alpha.mk",
    declaredTarget: `$(if $(FLAG_${index}),alpha/test-${index})`,
    targetKind: "expression" as const,
    testName: "alpha",
  };
}

/**
 * Creates Git-tracked C++ paths matching every literal fixture declaration.
 *
 * @returns Exact physical source paths for every fixture literal target.
 */
function createTrackedPaths(): readonly string[] {
  return Array.from(
    { length: expectedCoreTestSourceTargetCounts.tracked },
    /**
     * Converts one fixture index into its tracked physical .cxx path.
     *
     * @param unusedValue - Array factory value, deliberately unused because only the index identifies the path.
     * @param index - Zero-based literal target index.
     * @returns Exact core-repository-relative tracked source path.
     */
    function createTrackedPath(unusedValue: unknown, index: number): string {
      void unusedValue;
      return `alpha/test-${index}.cxx`;
    },
  );
}

describe("createCoreTestSourceTargetInventory" /**
 * Groups canonical linkage, provenance validation, and pinned completeness checks.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineSourceTargetInventoryTests(): void {
  it("links literal and expression targets only to inventoried CppunitTest constructors" /**
   * Verifies canonical source paths, null expression paths, deterministic ordering, and legacy omission.
   *
   * @returns Nothing; assertions validate the generated inventory contract.
   */, function createsCanonicalInventory(): void {
    const inventory = createCoreTestSourceTargetInventory(
      "core-commit",
      createConstructorInventory(),
      [
        ...createPinnedDeclarations(),
        {
          declarationPath: "legacy/CppunitTest_legacy.mk",
          declaredTarget: "legacy/test",
          targetKind: "literal",
          testName: "legacy",
        },
      ],
      createTrackedPaths(),
    );

    expect(inventory).toMatchObject({
      coreCommit: "core-commit",
      generatedBy: "inventory:test-source-targets",
      schemaVersion: 1,
      summary: expectedCoreTestSourceTargetCounts,
    });
    expect(inventory.records).toHaveLength(686);
    expect(inventory.records.find(selectExpressionRecord)).toMatchObject({
      sourcePath: null,
      targetStatus: "expression",
    });
    expect(inventory.records.find(selectTrackedRecord)).toMatchObject({
      sourcePath: "alpha/test-0.cxx",
      targetStatus: "tracked",
    });
  });

  it("rejects mismatched commits, absent tracked files, duplicate records, and count drift" /**
   * Verifies source-target evidence cannot silently diverge from the pinned baseline.
   *
   * @returns Nothing; assertions validate each guarded provenance failure.
   */, function rejectsInvalidInventoryInputs(): void {
    const constructors = createConstructorInventory();
    const declarations = createPinnedDeclarations();
    const trackedPaths = createTrackedPaths();
    expectInventoryError("other-commit", constructors, declarations, trackedPaths);
    expectInventoryError("core-commit", constructors, declarations, []);
    expectInventoryError("core-commit", constructors, declarations.slice(1), trackedPaths);
    expectInventoryError(
      "core-commit",
      constructors,
      [...declarations, createTrackedDeclaration(undefined, 0)],
      trackedPaths,
    );
  });
});

/**
 * Identifies one expression source-target record for assertions.
 *
 * @param record - Generated source-target record to inspect.
 * @param record.targetStatus - Resolution status that selects expression records.
 * @returns True only for expression records.
 */
function selectExpressionRecord(record: { readonly targetStatus: string }): boolean {
  return record.targetStatus === "expression";
}

/**
 * Identifies one tracked source-target record for assertions.
 *
 * @param record - Generated source-target record to inspect.
 * @param record.targetStatus - Resolution status that selects tracked records.
 * @returns True only for tracked records.
 */
function selectTrackedRecord(record: { readonly targetStatus: string }): boolean {
  return record.targetStatus === "tracked";
}

/**
 * Expects one invalid source-target inventory input to throw an explicit validation error.
 *
 * @param coreCommit - Core commit passed to inventory creation.
 * @param constructors - Constructor inventory fixture.
 * @param declarations - Parsed source-target declaration fixture.
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
     * Invokes inventory creation under an expected error assertion.
     *
     * @returns Inventory result that never returns for invalid input.
     */
    function createInvalidInventory(): unknown {
      return createCoreTestSourceTargetInventory(
        coreCommit,
        constructors,
        declarations,
        trackedPaths,
      );
    },
  ).toThrowError();
}
