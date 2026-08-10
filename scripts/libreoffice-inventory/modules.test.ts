/**
 * @fileoverview Verifies canonical, provenance-carrying core Module_*.mk record generation without reading upstream file content.
 */

import { describe, expect, it } from "vitest";

import { createCoreModuleInventory } from "./modules";

describe("createCoreModuleInventory" /**
 * Groups deterministic selection, naming, ordering, and duplicate-rejection tests.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineModuleInventoryTests(): void {
  it("filters non-module paths and creates sorted unmapped records with core provenance" /**
   * Verifies only declaration path metadata is emitted in canonical lexical order.
   *
   * @returns Nothing; assertions validate generated records.
   */, function createsCanonicalRecords(): void {
    const inventory = createCoreModuleInventory("pinned-commit", [
      "sw/Module_sw.mk",
      "README.md",
      "external/boost/Module_boost.mk",
      "Module_root.mk",
      "nested/NotModule_sw.mk",
    ]);

    expect(inventory).toEqual({
      coreCommit: "pinned-commit",
      corpusId: "core",
      generatedBy: "inventory:modules",
      records: [
        {
          commit: "pinned-commit",
          corpusId: "core",
          id: "LO-CORE-MODULE:Module_root.mk",
          mappingStatus: "unmapped",
          moduleName: "root",
          referencePath: "Module_root.mk",
        },
        {
          commit: "pinned-commit",
          corpusId: "core",
          id: "LO-CORE-MODULE:external/boost/Module_boost.mk",
          mappingStatus: "unmapped",
          moduleName: "boost",
          referencePath: "external/boost/Module_boost.mk",
        },
        {
          commit: "pinned-commit",
          corpusId: "core",
          id: "LO-CORE-MODULE:sw/Module_sw.mk",
          mappingStatus: "unmapped",
          moduleName: "sw",
          referencePath: "sw/Module_sw.mk",
        },
      ],
      schemaVersion: 1,
    });
  });

  it("rejects duplicate declaration paths rather than silently collapsing source evidence" /**
   * Verifies a malformed duplicate Git input cannot make the generated inventory look complete.
   *
   * @returns Nothing; assertion validates explicit duplicate rejection.
   */, function rejectsDuplicates(): void {
    expect(
      /**
       * Creates duplicate module input for the expected error assertion.
       *
       * @returns Inventory creation result that never returns for duplicate input.
       */
      function createDuplicateInventory(): unknown {
        return createCoreModuleInventory("pinned-commit", ["sw/Module_sw.mk", "sw/Module_sw.mk"]);
      },
    ).toThrowError("duplicate");
  });

  it("keeps already ascending paths in the same code-unit lexical order" /**
   * Verifies the non-swapping comparator branch does not depend on host locale collation.
   *
   * @returns Nothing; assertion validates path ordering.
   */, function preservesAscendingCodeUnitOrder(): void {
    const paths = createCoreModuleInventory("pinned-commit", [
      "a/Module_a.mk",
      "z/Module_z.mk",
    ]).records.map(
      /**
       * Extracts one declaration path from a generated module record.
       *
       * @param record - Canonical generated module record.
       * @returns The record's exact reference-relative path.
       */
      function selectReferencePath(record): string {
        return record.referencePath;
      },
    );

    expect(paths).toEqual(["a/Module_a.mk", "z/Module_z.mk"]);
  });
});
