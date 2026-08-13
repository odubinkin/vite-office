/**
 * @fileoverview Verifies the stable, honest suite inventory consumed by the foundation navigation.
 */

import { describe, expect, it } from "vitest";

import { suiteDefinitions } from "./suites";

describe("suiteDefinitions" /**
 * Groups invariants for the initial suite inventory.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineSuiteInventoryTests(): void {
  it("contains every planned suite exactly once with foundation-only status" /**
   * Verifies stable identifiers, ordering, uniqueness, and non-capability status.
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
    expect(
      suiteDefinitions.every(
        /**
         * Checks that one suite retains the explicit non-capability status.
         *
         * @param suite - Immutable suite definition under test.
         * @returns True only when the suite remains a foundation placeholder.
         */
        function hasFoundationStatus(suite) {
          return suite.status === "Foundation only";
        },
      ),
    ).toBe(true);
  });
});
