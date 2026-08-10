/**
 * @fileoverview Verifies PythonTest module linkage, physical Python-path classification, and pinned module-count guards.
 */

import { describe, expect, it } from "vitest";

import type { CoreTestInventory } from "./contracts";
import {
  createCorePythonTestModuleInventory,
  expectedCorePythonTestModuleCounts,
  type PythonTestModuleDeclaration,
} from "./python-test-module-inventory";

/**
 * Provides a PythonTest constructor inventory fixture matching the pinned module-count contract.
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
        id: "LO-CORE-TEST:PythonTest:alpha/PythonTest_alpha.mk:12",
        kind: "PythonTest",
        line: 12,
        mappingStatus: "unmapped",
        referencePath: "alpha/PythonTest_alpha.mk",
        testName: "alpha",
      },
    ],
    schemaVersion: 1,
    summary: { CppunitTest: 415, JunitTest: 58, PythonTest: 13, UITest: 79 },
  };
}

/**
 * Creates literal module declarations that match every pinned PythonTest module count.
 *
 * @returns Python module declarations that all derive to tracked physical paths.
 */
function createPinnedDeclarations(): readonly PythonTestModuleDeclaration[] {
  return Array.from({ length: expectedCorePythonTestModuleCounts.tracked }, createDeclaration);
}

/**
 * Creates one unique literal Python module declaration for the pinned-count fixture.
 *
 * @param unusedValue - Array factory value, deliberately unused because only the index identifies the module.
 * @param index - Zero-based Python module index.
 * @returns One valid linked literal Python module declaration.
 */
function createDeclaration(unusedValue: unknown, index: number): PythonTestModuleDeclaration {
  void unusedValue;
  return {
    declarationPath: "alpha/PythonTest_alpha.mk",
    declaredModule: `module_${index}`,
    sourceDirectory: "alpha/python",
    targetKind: "literal",
    testName: "alpha",
  };
}

/**
 * Creates Git-tracked Python paths matching every literal fixture declaration.
 *
 * @returns Exact physical source paths for every fixture module.
 */
function createTrackedPaths(): readonly string[] {
  return Array.from(
    { length: expectedCorePythonTestModuleCounts.tracked },
    /**
     * Converts one fixture index into its tracked Python source path.
     *
     * @param unusedValue - Array factory value, deliberately unused because only the index identifies the path.
     * @param index - Zero-based Python module index.
     * @returns Exact core-repository-relative tracked Python source path.
     */
    function createTrackedPath(unusedValue: unknown, index: number): string {
      void unusedValue;
      return `alpha/python/module_${index}.py`;
    },
  );
}

describe("createCorePythonTestModuleInventory" /**
 * Groups canonical Python module linkage, physical-path classification, and guarded failure cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function definePythonTestModuleInventoryTests(): void {
  it("links tracked Python modules to their inventoried PythonTest constructor" /**
   * Verifies canonical records retain physical path and constructor provenance for every pinned module.
   *
   * @returns Nothing; assertions validate the generated Python module inventory contract.
   */, function createsCanonicalInventory(): void {
    const inventory = createCorePythonTestModuleInventory(
      "core-commit",
      createConstructorInventory(),
      createPinnedDeclarations(),
      createTrackedPaths(),
    );

    expect(inventory).toMatchObject({
      coreCommit: "core-commit",
      generatedBy: "inventory:python-test-modules",
      schemaVersion: 1,
      summary: expectedCorePythonTestModuleCounts,
    });
    expect(inventory.records).toHaveLength(59);
    expect(inventory.records[0]).toMatchObject({
      constructorId: "LO-CORE-TEST:PythonTest:alpha/PythonTest_alpha.mk:12",
      modulePath: "alpha/python/module_0.py",
      targetStatus: "tracked",
    });
  });

  it("rejects commit mismatch, unknown constructors, expressions, missing paths, duplicates, and count drift" /**
   * Verifies no provenance or count mismatch can silently enter a generated module inventory.
   *
   * @returns Nothing; assertions validate guarded invalid-input behavior.
   */, function rejectsInvalidInventoryInputs(): void {
    const constructors = createConstructorInventory();
    const declarations = createPinnedDeclarations();
    const firstDeclaration = createDeclaration(undefined, 0);
    const trackedPaths = createTrackedPaths();
    expectInventoryError("other-commit", constructors, declarations, trackedPaths);
    expectInventoryError(
      "core-commit",
      constructors,
      [
        {
          ...firstDeclaration,
          declarationPath: "other/PythonTest_other.mk",
          testName: "other",
        },
        ...declarations.slice(1),
      ],
      trackedPaths,
    );
    expectInventoryError(
      "core-commit",
      constructors,
      [
        {
          ...firstDeclaration,
          declaredModule: "$(if $(FLAG),conditional)",
          targetKind: "expression",
        },
        ...declarations.slice(1),
      ],
      trackedPaths,
    );
    expectInventoryError(
      "core-commit",
      constructors,
      [{ ...firstDeclaration, declaredModule: "absent_module" }, ...declarations.slice(1)],
      trackedPaths,
    );
    expectInventoryError(
      "core-commit",
      constructors,
      [...declarations, createDeclaration(undefined, 0)],
      trackedPaths,
    );
    expectInventoryError("core-commit", constructors, declarations.slice(1), trackedPaths);
  });
});

/**
 * Expects one invalid Python module inventory input to throw an explicit validation error.
 *
 * @param coreCommit - Core commit passed to inventory creation.
 * @param constructors - Constructor inventory fixture.
 * @param declarations - Parsed Python module declaration fixture.
 * @param trackedPaths - Git-tracked path fixture.
 * @returns Nothing; assertion validates guarded failure behavior.
 */
function expectInventoryError(
  coreCommit: string,
  constructors: CoreTestInventory,
  declarations: readonly PythonTestModuleDeclaration[],
  trackedPaths: readonly string[],
): void {
  expect(
    /**
     * Invokes Python module inventory creation under an expected error assertion.
     *
     * @returns Inventory result that never returns for invalid input.
     */
    function createInvalidInventory(): unknown {
      return createCorePythonTestModuleInventory(
        coreCommit,
        constructors,
        declarations,
        trackedPaths,
      );
    },
  ).toThrowError();
}
