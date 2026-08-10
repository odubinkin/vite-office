/**
 * @fileoverview Verifies deterministic PO catalog inventory creation, count guards, duplicate rejection, locale guards, and summaries.
 */

import { describe, expect, it } from "vitest";

import {
  createTranslationCatalogInventory,
  expectedTranslationCatalogCount,
  expectedTranslationLocaleCount,
} from "./translations";

/**
 * Creates an exact-count synthetic PO path fixture across a caller-selected locale count without upstream content.
 *
 * @param localeCount - Number of synthetic locale directories represented in the fixture.
 * @returns Synthetic repository-relative PO catalog paths.
 */
function createCatalogPaths(localeCount = expectedTranslationLocaleCount): string[] {
  return Array.from(
    { length: expectedTranslationCatalogCount },
    /**
     * Creates one path-only synthetic PO fixture at the required index.
     *
     * @param unusedValue - Array slot value, intentionally unused.
     * @param index - Zero-based synthetic catalog index.
     * @returns Repository-relative PO catalog path.
     */
    function createCatalogPath(unusedValue: undefined, index: number): string {
      void unusedValue;
      const locale = `locale-${String(index % localeCount).padStart(3, "0")}`;
      return `source/${locale}/domain/catalog-${String(index).padStart(5, "0")}.po`;
    },
  );
}

describe("createTranslationCatalogInventory" /**
 * Groups success and malformed-input rejection cases for path-only PO catalog metadata.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineTranslationCatalogInventoryTests(): void {
  it("creates ordered provenance records and deterministic per-locale counts" /**
   * Verifies generated output contains only path metadata, stable IDs, and a complete locale summary.
   *
   * @returns Nothing; assertions validate canonical PO catalog inventory fields.
   */, function createsInventory(): void {
    const inventory = createTranslationCatalogInventory("translations-commit", [
      "README.md",
      ...createCatalogPaths().reverse(),
    ]);
    expect(inventory).toMatchObject({
      corpusId: "translations",
      generatedBy: "inventory:translations",
      schemaVersion: 1,
      translationsCommit: "translations-commit",
    });
    expect(inventory.records).toHaveLength(expectedTranslationCatalogCount);
    expect(inventory.records[0]).toMatchObject({
      id: "LO-TRANSLATION-CATALOG:source/locale-000/domain/catalog-00000.po",
      locale: "locale-000",
      mappingStatus: "unmapped",
    });
    expect(Object.keys(inventory.summary)).toHaveLength(expectedTranslationLocaleCount);
    expect(inventory.summary["locale-000"]).toBe(197);
    expect(inventory.summary["locale-130"]).toBe(196);
  });

  it("rejects incomplete, duplicate, and wrong-locale-count catalog inputs" /**
   * Verifies malformed path sets cannot claim complete localization inventory coverage.
   *
   * @returns Nothing; assertions validate completeness and integrity guards.
   */, function rejectsInvalidPathSets(): void {
    const incomplete = createCatalogPaths();
    incomplete.pop();
    expectCatalogError(incomplete, "Unexpected translation catalog count");

    const duplicate = createCatalogPaths();
    duplicate[1] = duplicate[0] as string;
    expectCatalogError(duplicate, "duplicate PO paths");

    expectCatalogError(createCatalogPaths(130), "Unexpected translation locale count");
  });
});

/**
 * Expects PO catalog inventory creation to reject a corrupted path set.
 *
 * @param paths - Corrupted raw path fixture.
 * @param message - Required stable error substring.
 * @returns Nothing; assertion validates rejection behavior.
 */
function expectCatalogError(paths: readonly string[], message: string): void {
  expect(
    /**
     * Invokes inventory creation under the expected error assertion.
     *
     * @returns Inventory result that never returns for corrupted input.
     */
    function createInvalidCatalogInventory(): unknown {
      return createTranslationCatalogInventory("translations-commit", paths);
    },
  ).toThrowError(message);
}
