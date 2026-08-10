/**
 * @fileoverview Verifies exact parsing, completeness guards, ordering, and rejection behavior for pinned gbuild test-constructor inventories.
 */

import { describe, expect, it } from "vitest";

import type { CoreTestKind } from "./contracts";
import { createCoreTestInventory, expectedCoreTestCounts } from "./tests";

/**
 * Creates all four exact-count raw Git grep streams with optional non-invocation macro definition noise.
 *
 * @returns Raw Git output indexed by constructor family.
 */
function createOutputs(): Record<CoreTestKind, string> {
  return {
    CppunitTest: createOutput("CppunitTest", true),
    JunitTest: createOutput("JunitTest", false),
    PythonTest: createOutput("PythonTest", false),
    UITest: createOutput("UITest", false),
  };
}

/**
 * Creates an exact-count raw grep output stream for one supported constructor family.
 *
 * @param kind - Supported constructor family.
 * @param includeDefinition - Whether to include a gbuild macro definition that must be ignored.
 * @returns Newline-delimited fake git grep output.
 */
function createOutput(kind: CoreTestKind, includeDefinition: boolean): string {
  const lines = [];
  if (includeDefinition) lines.push(`solenv/gbuild/${kind}.mk:1:define gb_${kind}_${kind}`);
  for (let index = 1; index <= expectedCoreTestCounts[kind]; index += 1) {
    lines.push(
      `module/${kind}_${index}.mk:${index}:$(eval $(call gb_${kind}_${kind},${kind}_${index}))`,
    );
  }
  return lines.join("\n");
}

describe("createCoreTestInventory" /**
 * Groups successful generation and malformed, incomplete, duplicate input cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineCoreTestInventoryTests(): void {
  it("creates a complete ordered unmapped inventory and ignores gbuild macro definitions" /**
   * Verifies metadata-only records, exact summary, and deterministic sort behavior.
   *
   * @returns Nothing; assertions validate canonical inventory output.
   */, function createsInventory(): void {
    const inventory = createCoreTestInventory("pinned", createOutputs());
    expect(inventory.summary).toEqual(expectedCoreTestCounts);
    expect(inventory.records).toHaveLength(565);
    expect(inventory).toMatchObject({
      corpusId: "core",
      generatedBy: "inventory:tests",
      schemaVersion: 1,
    });
    expect(inventory.records[0]).toMatchObject({ kind: "CppunitTest", mappingStatus: "unmapped" });
    expect(inventory.records.some(isMacroDefinitionRecord)).toBe(false);
  });

  it("rejects incomplete counts, malformed invocations, invalid line numbers, and duplicate records" /**
   * Verifies every input-corruption guard fails before generated output can claim completeness.
   *
   * @returns Nothing; assertions validate deterministic failures.
   */, function rejectsInvalidInputs(): void {
    const incomplete = createOutputs();
    incomplete.UITest = incomplete.UITest.slice(0, incomplete.UITest.lastIndexOf("\n"));
    expectInventoryError(incomplete, "Unexpected UITest declaration count");

    const malformed = createOutputs();
    malformed.PythonTest = malformed.PythonTest.replace(
      "gb_PythonTest_PythonTest,PythonTest_1)",
      "gb_PythonTest_PythonTest, )",
    );
    expectInventoryError(malformed, "Malformed PythonTest");

    const invalidLine = createOutputs();
    invalidLine.JunitTest = invalidLine.JunitTest.replace(":1:", ":0:");
    expectInventoryError(invalidLine, "Invalid JunitTest declaration line");

    const duplicate = createOutputs();
    const firstLine = duplicate.CppunitTest.split("\n")[1] as string;
    duplicate.CppunitTest = duplicate.CppunitTest.replace(
      "module/CppunitTest_2.mk:2",
      "module/CppunitTest_1.mk:1",
    );
    duplicate.CppunitTest = duplicate.CppunitTest.replace("CppunitTest_2))", "CppunitTest_1))");
    expect(firstLine).toContain("CppunitTest_1");
    expectInventoryError(duplicate, "duplicate declaration records");
  });
});

/**
 * Determines whether a generated record accidentally originated from a gbuild macro definition.
 *
 * @param record - Generated test record with its exact declaration path.
 * @param record.referencePath - Exact repository-relative path used to identify a gbuild definition directory.
 * @returns True only when the record comes from the gbuild macro-definition directory.
 */
function isMacroDefinitionRecord(record: { readonly referencePath: string }): boolean {
  return record.referencePath.startsWith("solenv/gbuild/");
}

/**
 * Expects inventory creation to throw an error containing a stable diagnostic substring.
 *
 * @param outputs - Fake raw Git output indexed by constructor family.
 * @param message - Required error substring.
 * @returns Nothing; assertion validates expected rejection.
 */
function expectInventoryError(outputs: Record<CoreTestKind, string>, message: string): void {
  expect(
    /**
     * Invokes inventory creation for an expected exception assertion.
     *
     * @returns Inventory result that never returns for corrupted input.
     */
    function createInvalidInventory(): unknown {
      return createCoreTestInventory("pinned", outputs);
    },
  ).toThrowError(message);
}
