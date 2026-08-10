/**
 * @fileoverview Verifies UITest constructor linkage, module-root Python source expansion, and pinned count guards.
 */

import { describe, expect, it } from "vitest";

import type { CoreTestInventory } from "./contracts";
import {
  createCoreUITestSourceTargetInventory,
  expectedCoreUITestSourceTargetCounts,
  type UITestModuleRootDeclaration,
} from "./ui-test-source-inventory";

/**
 * Provides a UITest constructor inventory fixture matching the pinned source-target count contract.
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
        id: "LO-CORE-TEST:UITest:alpha/UITest_alpha.mk:12",
        kind: "UITest",
        line: 12,
        mappingStatus: "unmapped",
        referencePath: "alpha/UITest_alpha.mk",
        testName: "alpha",
      },
    ],
    schemaVersion: 1,
    summary: { CppunitTest: 415, JunitTest: 58, PythonTest: 13, UITest: 79 },
  };
}

/**
 * Creates one literal module-root declaration that expands to the complete pinned tracked-file fixture.
 *
 * @returns One valid UITest module-root declaration.
 */
function createDeclaration(): UITestModuleRootDeclaration {
  return {
    declarationPath: "alpha/UITest_alpha.mk",
    declaredModuleRoot: "modules",
    sourceDirectory: "alpha/qa/uitest",
    targetKind: "literal",
    testName: "alpha",
  };
}

/**
 * Creates Git-tracked Python paths matching every fixture source-target record.
 *
 * @returns Exact physical Python source paths for the complete pinned-count fixture.
 */
function createTrackedPaths(): readonly string[] {
  return Array.from(
    { length: expectedCoreUITestSourceTargetCounts.tracked },
    /**
     * Converts one fixture index into a tracked Python source path below the declared module root.
     *
     * @param unusedValue - Array factory value, deliberately unused because only the index identifies the path.
     * @param index - Zero-based Python source-target index.
     * @returns Exact core-repository-relative tracked Python source path.
     */
    function createTrackedPath(unusedValue: unknown, index: number): string {
      void unusedValue;
      return `alpha/qa/uitest/modules/test_${index}.py`;
    },
  );
}

describe("createCoreUITestSourceTargetInventory" /**
 * Groups canonical UITest source expansion, constructor linkage, and guarded failure cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineUITestSourceInventoryTests(): void {
  it("links every tracked Python path below one declared module root to its UITest constructor" /**
   * Verifies module-root provenance is retained for each expanded physical Python source file.
   *
   * @returns Nothing; assertions validate the generated UITest source-target inventory contract.
   */, function createsCanonicalInventory(): void {
    const inventory = createCoreUITestSourceTargetInventory(
      "core-commit",
      createConstructorInventory(),
      [createDeclaration()],
      createTrackedPaths(),
    );

    expect(inventory).toMatchObject({
      coreCommit: "core-commit",
      generatedBy: "inventory:ui-test-source-targets",
      schemaVersion: 1,
      summary: expectedCoreUITestSourceTargetCounts,
    });
    expect(inventory.records).toHaveLength(649);
    expect(inventory.records[0]).toMatchObject({
      constructorId: "LO-CORE-TEST:UITest:alpha/UITest_alpha.mk:12",
      moduleRootPath: "alpha/qa/uitest/modules",
      sourcePath: "alpha/qa/uitest/modules/test_0.py",
      targetStatus: "tracked",
    });
  });

  it("rejects commit mismatch, unknown constructors, expressions, empty roots, duplicate paths, and count drift" /**
   * Verifies generated inventories cannot silently lose constructor provenance or declared module-root evidence.
   *
   * @returns Nothing; assertions validate guarded invalid-input behavior.
   */, function rejectsInvalidInventoryInputs(): void {
    const constructors = createConstructorInventory();
    const declaration = createDeclaration();
    const trackedPaths = createTrackedPaths();
    expectInventoryError("other-commit", constructors, [declaration], trackedPaths);
    expectInventoryError(
      "core-commit",
      constructors,
      [{ ...declaration, declarationPath: "other/UITest_other.mk", testName: "other" }],
      trackedPaths,
    );
    expectInventoryError(
      "core-commit",
      constructors,
      [
        {
          ...declaration,
          declaredModuleRoot: "$(if $(FLAG),conditional)",
          targetKind: "expression",
        },
      ],
      trackedPaths,
    );
    expectInventoryError(
      "core-commit",
      constructors,
      [{ ...declaration, declaredModuleRoot: "empty" }],
      trackedPaths,
    );
    expectInventoryError("core-commit", constructors, [declaration, declaration], trackedPaths);
    expectInventoryError("core-commit", constructors, [declaration], trackedPaths.slice(1));
  });
});

/**
 * Expects one invalid UITest source-target inventory input to throw an explicit validation error.
 *
 * @param coreCommit - Core commit passed to inventory creation.
 * @param constructors - Constructor inventory fixture.
 * @param declarations - Parsed UITest module-root declaration fixture.
 * @param trackedPaths - Git-tracked path fixture.
 * @returns Nothing; assertion validates guarded failure behavior.
 */
function expectInventoryError(
  coreCommit: string,
  constructors: CoreTestInventory,
  declarations: readonly UITestModuleRootDeclaration[],
  trackedPaths: readonly string[],
): void {
  expect(
    /**
     * Invokes UITest source-target inventory creation under an expected error assertion.
     *
     * @returns Inventory result that never returns for invalid input.
     */
    function createInvalidInventory(): unknown {
      return createCoreUITestSourceTargetInventory(
        coreCommit,
        constructors,
        declarations,
        trackedPaths,
      );
    },
  ).toThrowError();
}
