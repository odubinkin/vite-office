/**
 * @fileoverview Verifies deterministic dictionary AFF and DIC inventory creation and completeness guards.
 */

import { describe, expect, it } from "vitest";

import {
  createDictionaryFileInventory,
  expectedAffFileCount,
  expectedDicFileCount,
} from "./dictionaries";

/**
 * Creates an exact-count synthetic dictionary path fixture without upstream lexical content.
 *
 * @returns Synthetic repository-relative AFF and DIC paths.
 */
function createDictionaryPaths(): string[] {
  return [
    ...Array.from({ length: expectedAffFileCount }, createAffPath),
    ...Array.from({ length: expectedDicFileCount }, createDicPath),
  ];
}

/**
 * Creates one synthetic AFF path at a stable index.
 *
 * @param unusedValue - Array slot value, intentionally unused.
 * @param index - Zero-based AFF index.
 * @returns Repository-relative AFF path.
 */
function createAffPath(unusedValue: undefined, index: number): string {
  void unusedValue;
  return `package-${String(index).padStart(3, "0")}/dictionary.aff`;
}

/**
 * Creates one synthetic DIC path at a stable index.
 *
 * @param unusedValue - Array slot value, intentionally unused.
 * @param index - Zero-based DIC index.
 * @returns Repository-relative DIC path.
 */
function createDicPath(unusedValue: undefined, index: number): string {
  void unusedValue;
  return `package-${String(index).padStart(3, "0")}/dictionary-${String(index).padStart(3, "0")}.dic`;
}

describe("createDictionaryFileInventory" /**
 * Groups canonical success and malformed-path rejection cases for dictionary provenance metadata.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineDictionaryInventoryTests(): void {
  it("creates ordered unmapped records with exact per-kind counts" /**
   * Verifies output retains path-derived package and kind metadata without lexical data.
   *
   * @returns Nothing; assertions validate canonical generated inventory fields.
   */, function createsInventory(): void {
    const inventory = createDictionaryFileInventory("dictionaries-commit", [
      "README.md",
      ...createDictionaryPaths().reverse(),
    ]);
    expect(inventory).toMatchObject({
      corpusId: "dictionaries",
      dictionariesCommit: "dictionaries-commit",
      generatedBy: "inventory:dictionaries",
      schemaVersion: 1,
      summary: { aff: expectedAffFileCount, dic: expectedDicFileCount },
    });
    expect(inventory.records).toHaveLength(expectedAffFileCount + expectedDicFileCount);
    expect(inventory.records[0]).toMatchObject({
      id: "LO-DICTIONARY-FILE:package-000/dictionary-000.dic",
      kind: "dic",
      mappingStatus: "unmapped",
      packageName: "package-000",
    });
  });

  it("rejects incomplete, duplicate, and wrong-kind-count path inputs" /**
   * Verifies malformed path sets cannot claim complete dictionary inventory coverage.
   *
   * @returns Nothing; assertions validate explicit integrity guards.
   */, function rejectsInvalidPaths(): void {
    const incomplete = createDictionaryPaths();
    incomplete.pop();
    expectInventoryError(incomplete, "Unexpected dictionary file count");

    const duplicate = createDictionaryPaths();
    duplicate[1] = duplicate[0] as string;
    expectInventoryError(duplicate, "duplicate AFF or DIC paths");

    const wrongKinds = createDictionaryPaths();
    wrongKinds[0] = "package-999/dictionary-999.dic";
    expectInventoryError(wrongKinds, "Unexpected dictionary file kind counts");
  });
});

/**
 * Expects dictionary inventory creation to reject corrupted path input.
 *
 * @param paths - Corrupted raw path fixture.
 * @param message - Required stable error substring.
 * @returns Nothing; assertion validates rejection behavior.
 */
function expectInventoryError(paths: readonly string[], message: string): void {
  expect(
    /**
     * Invokes inventory creation under the expected error assertion.
     *
     * @returns Inventory result that never returns for corrupted input.
     */
    function createInvalidInventory(): unknown {
      return createDictionaryFileInventory("dictionaries-commit", paths);
    },
  ).toThrowError(message);
}
