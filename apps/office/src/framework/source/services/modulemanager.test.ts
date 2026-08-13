/**
 * @fileoverview Verifies the stable, honest browser module-manager suite inventory consumed by the foundation navigation.
 */

import { describe, expect, it } from "vitest";

import { suiteDefinitions } from "./modulemanager";

describe("suiteDefinitions" /**
 * Groups invariants for the initial suite inventory.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineSuiteInventoryTests(): void {
  it("contains every planned suite exactly once and reserves foundation-only status for unavailable suites" /**
   * Verifies stable identifiers, ordering, uniqueness, and that Writer no longer claims the obsolete foundation-only state.
   *
   * @returns Nothing; assertions protect the inventory contract.
   */, function verifySuiteInventory(): void {
    const ids = suiteDefinitions.map(
      /**
       * Reads one stable suite identifier without mutating the definition.
       *
       * @param suite - Immutable suite definition from the exported inventory.
       * @returns The stable identifier used for uniqueness assertions.
       */
      function selectSuiteId(suite) {
        return suite.id;
      },
    );

    expect(ids).toEqual(["writer", "calc", "impress", "draw", "base", "math", "chart"]);
    expect(new Set(ids).size).toBe(ids.length);
    expect("status" in (suiteDefinitions[0] as object)).toBe(false);
    expect(
      suiteDefinitions
        .filter(
          /** Excludes Writer because its implemented workbench has no unavailable-suite status. @param suite - Immutable suite definition inspected by stable identity. @returns True only for a suite other than Writer. */
          function isUnavailableSuite(suite): boolean {
            return suite.id !== "writer";
          },
        )
        .every(
          /**
           * Checks that one suite retains the explicit non-capability status.
           *
           * @param suite - Immutable suite definition under test.
           * @returns True only when the suite remains a foundation placeholder.
           */
          function hasFoundationStatus(suite) {
            return "status" in suite && suite.status === "Foundation only";
          },
        ),
    ).toBe(true);
  });
});
