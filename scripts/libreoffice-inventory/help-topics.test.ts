/**
 * @fileoverview Verifies deterministic XHP help-topic inventory creation, count guards, duplicate rejection, and area summaries.
 */

import { describe, expect, it } from "vitest";

import { createHelpTopicInventory, expectedHelpTopicCount } from "./help-topics";

/**
 * Creates an exact-count XHP path fixture across two help areas without containing upstream topic content.
 *
 * @returns Synthetic repository-relative XHP topic paths.
 */
function createTopicPaths(): string[] {
  return Array.from(
    { length: expectedHelpTopicCount },
    /**
     * Creates one path-only synthetic XHP fixture at the required index.
     *
     * @param unusedValue - Array slot value, intentionally unused.
     * @param index - Zero-based synthetic topic index.
     * @returns Repository-relative XHP path.
     */
    function createTopicPath(unusedValue: undefined, index: number): string {
      void unusedValue;
      const area = index % 2 === 0 ? "shared" : "swriter";
      return `source/text/${area}/topic-${String(index).padStart(4, "0")}.xhp`;
    },
  );
}

describe("createHelpTopicInventory" /**
 * Groups success and corruption-rejection cases for path-only XHP metadata.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineHelpTopicInventoryTests(): void {
  it("creates ordered core-free provenance records and deterministic area counts" /**
   * Verifies generated output contains only help path metadata and stable ordering.
   *
   * @returns Nothing; assertions validate canonical XHP inventory fields.
   */, function createsInventory(): void {
    const inventory = createHelpTopicInventory("help-commit", [...createTopicPaths()].reverse());
    expect(inventory).toMatchObject({
      corpusId: "helpcontent2",
      generatedBy: "inventory:help-topics",
      helpCommit: "help-commit",
      schemaVersion: 1,
    });
    expect(inventory.records).toHaveLength(expectedHelpTopicCount);
    expect(inventory.records[0]).toMatchObject({ area: "shared", mappingStatus: "unmapped" });
    expect(inventory.summary).toEqual({ shared: 1373, swriter: 1373 });
  });

  it("rejects wrong total counts and duplicate topic paths" /**
   * Verifies malformed path sets cannot claim complete documentation inventory coverage.
   *
   * @returns Nothing; assertions validate guard failures.
   */, function rejectsInvalidPathSets(): void {
    const incomplete = createTopicPaths();
    incomplete.pop();
    expectTopicError(incomplete, "Unexpected XHP topic count");

    const duplicate = createTopicPaths();
    duplicate[1] = duplicate[0] as string;
    expectTopicError(duplicate, "duplicate XHP paths");
  });
});

/**
 * Expects help topic inventory creation to reject a corrupted path set.
 *
 * @param paths - Corrupted raw path fixture.
 * @param message - Required stable error substring.
 * @returns Nothing; assertion validates rejection behavior.
 */
function expectTopicError(paths: readonly string[], message: string): void {
  expect(
    /**
     * Invokes inventory creation under the expected error assertion.
     *
     * @returns Inventory result that never returns for corrupted input.
     */
    function createInvalidTopicInventory(): unknown {
      return createHelpTopicInventory("help-commit", paths);
    },
  ).toThrowError(message);
}
