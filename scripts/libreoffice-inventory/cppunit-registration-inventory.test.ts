/**
 * @fileoverview Verifies Cppunit registration linkage to physical source targets, constructor provenance, and pinned macro-count guards.
 */

import { describe, expect, it } from "vitest";

import type { CoreTestSourceTargetInventory } from "./contracts";
import {
  createCoreCppunitRegistrationInventory,
  expectedCoreCppunitRegistrationCounts,
  type CppunitRegistrationDeclaration,
} from "./cppunit-registration-inventory";

/**
 * Provides a tracked Cppunit source-target inventory fixture that owns all registration declarations.
 *
 * @returns Canonical physical Cppunit source-target inventory fixture.
 */
function createSourceTargetInventory(): CoreTestSourceTargetInventory {
  return {
    coreCommit: "core-commit",
    corpusId: "core",
    generatedBy: "inventory:test-source-targets",
    records: [
      {
        commit: "core-commit",
        constructorId: "LO-CORE-TEST:CppunitTest:alpha/CppunitTest_alpha.mk:12",
        corpusId: "core",
        declarationPath: "alpha/CppunitTest_alpha.mk",
        declaredTarget: "alpha/test",
        id: "LO-CORE-SOURCE:alpha/test",
        mappingStatus: "unmapped",
        sourcePath: "alpha/test.cxx",
        targetStatus: "tracked",
      },
    ],
    schemaVersion: 1,
    summary: { expression: 2, tracked: 684 },
  };
}

/**
 * Creates declarations that exactly satisfy both pinned Cppunit registration macro counts.
 *
 * @returns Parsed registration fixture records associated with one physical C++ source target.
 */
function createDeclarations(): readonly CppunitRegistrationDeclaration[] {
  return [
    ...Array.from(
      { length: expectedCoreCppunitRegistrationCounts.CPPUNIT_TEST },
      createTestDeclaration,
    ),
    ...Array.from(
      { length: expectedCoreCppunitRegistrationCounts.CPPUNIT_TEST_FIXTURE },
      createFixtureDeclaration,
    ),
  ];
}

/**
 * Creates one unique CPPUNIT_TEST declaration fixture.
 *
 * @param unusedValue - Array factory value, deliberately unused because only the index identifies the registration.
 * @param index - Zero-based registration index.
 * @returns One literal CPPUNIT_TEST registration declaration.
 */
function createTestDeclaration(
  unusedValue: unknown,
  index: number,
): CppunitRegistrationDeclaration {
  void unusedValue;
  return {
    fixtureName: null,
    kind: "CPPUNIT_TEST",
    line: index + 1,
    sourcePath: "alpha/test.cxx",
    testName: `test_${index}`,
  };
}

/**
 * Creates one unique CPPUNIT_TEST_FIXTURE declaration fixture.
 *
 * @param unusedValue - Array factory value, deliberately unused because only the index identifies the registration.
 * @param index - Zero-based fixture registration index.
 * @returns One literal CPPUNIT_TEST_FIXTURE registration declaration.
 */
function createFixtureDeclaration(
  unusedValue: unknown,
  index: number,
): CppunitRegistrationDeclaration {
  void unusedValue;
  return {
    fixtureName: "Fixture",
    kind: "CPPUNIT_TEST_FIXTURE",
    line: expectedCoreCppunitRegistrationCounts.CPPUNIT_TEST + index + 1,
    sourcePath: "alpha/test.cxx",
    testName: `fixture_${index}`,
  };
}

describe("createCoreCppunitRegistrationInventory" /**
 * Groups canonical Cppunit registration linkage and guarded invalid-input cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineCppunitRegistrationInventoryTests(): void {
  it("links all pinned macro fixtures to their physical source target and constructor" /**
   * Verifies generated records retain both provenance links instead of only test-method text.
   *
   * @returns Nothing; assertions validate the canonical Cppunit registration inventory contract.
   */, function createsCanonicalInventory(): void {
    const inventory = createCoreCppunitRegistrationInventory(
      "core-commit",
      createSourceTargetInventory(),
      createDeclarations(),
    );
    expect(inventory).toMatchObject({
      coreCommit: "core-commit",
      generatedBy: "inventory:cppunit-registrations",
      schemaVersion: 1,
      summary: expectedCoreCppunitRegistrationCounts,
    });
    expect(inventory.records).toHaveLength(8072);
    expect(inventory.records[0]).toMatchObject({
      constructorId: "LO-CORE-TEST:CppunitTest:alpha/CppunitTest_alpha.mk:12",
      sourceTargetId: "LO-CORE-SOURCE:alpha/test",
      testName: "test_0",
    });
  });

  it("rejects commit mismatch, absent physical sources, duplicate registrations, and count drift" /**
   * Verifies no invalid source-target provenance or incomplete registration corpus can silently pass.
   *
   * @returns Nothing; assertions validate guarded invalid-input behavior.
   */, function rejectsInvalidInputs(): void {
    const sourceTargets = createSourceTargetInventory();
    const declarations = createDeclarations();
    const firstDeclaration = createTestDeclaration(undefined, 0);
    expectInventoryError("other-commit", sourceTargets, declarations);
    expectInventoryError("core-commit", sourceTargets, [
      { ...firstDeclaration, sourcePath: "other/test.cxx" },
    ]);
    expectInventoryError("core-commit", sourceTargets, [
      ...declarations,
      createTestDeclaration(undefined, 0),
    ]);
    expectInventoryError("core-commit", sourceTargets, declarations.slice(1));
  });
});

/**
 * Expects one invalid Cppunit registration inventory input to throw an explicit validation error.
 *
 * @param coreCommit - Core commit passed to inventory creation.
 * @param sourceTargets - Cppunit source-target inventory fixture.
 * @param declarations - Parsed registration declaration fixture.
 * @returns Nothing; assertion validates guarded failure behavior.
 */
function expectInventoryError(
  coreCommit: string,
  sourceTargets: CoreTestSourceTargetInventory,
  declarations: readonly CppunitRegistrationDeclaration[],
): void {
  expect(
    /**
     * Invokes Cppunit registration inventory creation under an expected error assertion.
     *
     * @returns Inventory result that never returns for invalid input.
     */
    function createInvalidInventory(): unknown {
      return createCoreCppunitRegistrationInventory(coreCommit, sourceTargets, declarations);
    },
  ).toThrowError();
}
