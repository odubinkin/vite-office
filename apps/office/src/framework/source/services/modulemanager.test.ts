/**
 * @fileoverview Verifies the stable, honest browser module-manager suite inventory consumed by the foundation navigation.
 */

import { describe, expect, it } from "vitest";

import { createOfficeModuleDescriptors, suiteDefinitions } from "./modulemanager";

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

  it("binds suite factories without importing their implementations into framework core" /** Verifies mapped and foundation descriptors plus duplicate and unknown registration guards. @returns Nothing; assertions cover the complete factory-registration contract. */, function bindsFactories(): void {
    const createWorkspace =
      /** Creates a neutral test workspace value. @returns Null test view. */
      function createWorkspace(): null {
        return null;
      };
    const closeWorkspace =
      /** Closes a neutral persistent workspace fixture. @returns Nothing. */
      function closeWorkspace(): void {};
    const modules = createOfficeModuleDescriptors([
      { closeWorkspace, createWorkspace, suiteId: "writer" },
    ]);
    expect(modules).not.toBe(suiteDefinitions);
    expect(modules[0]).toMatchObject({ closeWorkspace, createWorkspace, id: "writer" });
    expect(modules[1]).not.toHaveProperty("createWorkspace");
    expect(
      /** Registers the same suite factory twice. @returns No descriptors because registration throws. */
      () =>
        createOfficeModuleDescriptors([
          { createWorkspace, suiteId: "writer" },
          { createWorkspace, suiteId: "writer" },
        ]),
    ).toThrow("Duplicate office module factory: writer");
    expect(
      /** Registers a runtime-invalid suite identity. @returns No descriptors because registration throws. */
      () => createOfficeModuleDescriptors([{ createWorkspace, suiteId: "unknown" as "writer" }]),
    ).toThrow("Unknown office module factory: unknown");
    expect(
      createOfficeModuleDescriptors([{ createWorkspace, suiteId: "writer" }])[0],
    ).not.toHaveProperty("closeWorkspace");
  });
});
