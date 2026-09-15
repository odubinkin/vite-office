/** @fileoverview Verifies complete runtime-module, exported-operation, command, UI, and placeholder classification. */

import { describe, expect, it } from "vitest";

import {
  analyzeRuntimeModuleSemantics,
  extractExportedOperations,
  parseRuntimeInventoryManifest,
  selectRuntimeModulePaths,
  validateRuntimeInventory,
} from "./runtime-inventory";

/**
 * Creates a complete two-module runtime inventory with optional root overrides.
 * @param overrides - Top-level manifest overrides.
 * @returns Serialized runtime inventory source.
 */
function source(overrides: Readonly<Record<string, unknown>> = {}): string {
  return JSON.stringify({
    internalOperations: [
      {
        capabilityId: "CAP-0001",
        classification: "out-of-parity-scope",
        description: "Internal operation.",
        id: "internal.replace-writer-paragraph",
        modulePath: "src/b.tsx",
        symbol: "replaceWriterParagraph",
      },
    ],
    modules: [
      {
        capabilityIds: [],
        classification: "local-infrastructure",
        infrastructureExemption: "Synthetic local bootstrap with no domain capability.",
        path: "src/a.ts",
        semantic: semanticRecord(),
        state: "foundation",
        subsystem: "bootstrap",
        suite: "shared",
      },
      {
        capabilityIds: ["CAP-0001"],
        classification: "upstream-mechanism",
        path: "src/b.tsx",
        semantic: semanticRecord({ upstreamFile: "upstream/b.cxx" }),
        state: "active",
        subsystem: "writer",
        suite: "writer",
      },
    ],
    placeholderSuites: ["base", "calc"],
    schemaVersion: 3,
    uiBehaviors: [
      {
        classification: "browser-adaptation",
        capabilityId: "CAP-0001",
        description: "Browser focus projection.",
        id: "ui.focus",
      },
    ],
    ...overrides,
  });
}

describe("runtime inventory" /** Groups strict parser and complete-coverage checks. @returns Nothing. */, function defineRuntimeInventoryTests(): void {
  it("classifies every module, exported operation, command, and non-only surface" /** Verifies the deterministic success report. @returns A fulfilled assertion promise. */, async function validatesRuntimeSurface(): Promise<void> {
    const manifest = parseRuntimeInventoryManifest(source());
    const report = await validateRuntimeInventory(
      manifest,
      ["src/a.ts", "src/b.tsx"],
      /** Returns synthetic source for an inventoried module. @param path - Module path. @returns Synthetic source text. */
      async function readModule(path: string): Promise<string> {
        return path.endsWith("a.ts")
          ? "export function alpha() {}"
          : "export async function beta() {}\nexport function gamma() {}\nexport function replaceWriterParagraph() {}";
      },
      [{ capabilityId: "CAP-0001", id: ".uno:Test", label: "Test" }],
      new Set(["CAP-0001"]),
    );
    expect(report).toMatchObject({
      commandCount: 1,
      exportedOperationCount: 4,
      internalOperationCount: 1,
      placeholderSuiteCount: 2,
      schemaVersion: 3,
      semanticViolationCount: 0,
      uiBehaviorCount: 1,
    });
    expect(reportedOperations(report.modules)).toEqual([
      "alpha",
      "beta",
      "gamma",
      "replaceWriterParagraph",
    ]);
  });

  it("selects production TypeScript entries and extracts sorted exported functions" /** Verifies discovery excludes tests and setup files. @returns Nothing. */, function selectsRuntimePaths(): void {
    expect(
      selectRuntimeModulePaths("src/", [
        "z.tsx",
        "a.ts",
        "a.test.ts",
        "b.test.tsx",
        "notes.md",
        "test/setup.ts",
      ]),
    ).toEqual(["src/a.ts", "src/z.tsx"]);
    expect(
      extractExportedOperations(
        "export function zebra() {}\nexport async function alpha() {}\nfunction hidden() {}",
      ),
    ).toEqual(["alpha", "zebra"]);
  });

  it("rejects malformed authored inventory fields" /** Exercises every strict schema discriminator. @returns Nothing. */, function rejectsMalformedInventory(): void {
    expectInvalid("{");
    expectInvalid("[]");
    expectInvalid(source({ schemaVersion: 1 }));
    expectInvalid(source({ modules: "bad" }));
    expectInvalid(source({ modules: [null] }));
    expectInvalid(source({ modules: duplicateModules() }));
    expectInvalid(source({ modules: [moduleRecord({ classification: "bad" })] }));
    expectInvalid(source({ modules: [moduleRecord({ state: "bad" })] }));
    expectInvalid(source({ modules: [moduleRecord({ suite: "calc" })] }));
    expectInvalid(source({ modules: [moduleRecord({ subsystem: "" })] }));
    expectInvalid(source({ modules: [moduleRecord({ capabilityIds: [""] })] }));
    expectInvalid(source({ modules: [moduleRecord({ infrastructureExemption: "" })] }));
    expectInvalid(source({ modules: [moduleRecord({ semantic: null })] }));
    expectInvalid(
      source({ modules: [moduleRecord({ semantic: semanticRecord({ divergenceClass: "bad" }) })] }),
    );
    expectInvalid(
      source({ modules: [moduleRecord({ semantic: semanticRecord({ behaviorStatus: "bad" }) })] }),
    );
    expectInvalid(
      source({ modules: [moduleRecord({ semantic: semanticRecord({ justification: "short" }) })] }),
    );
    expectInvalid(
      source({ modules: [moduleRecord({ semantic: semanticRecord({ upstreamFile: 7 }) })] }),
    );
    expectInvalid(
      source({ modules: [moduleRecord({ semantic: semanticRecord({ expectedBaseClass: 7 }) })] }),
    );
    expectInvalid(
      source({ modules: [moduleRecord({ semantic: semanticRecord({ expectedBaseClass: "" }) })] }),
    );
    expectInvalid(
      source({
        modules: [moduleRecord({ semantic: semanticRecord({ sourceResponsibility: "bad" }) })],
      }),
    );
    expectInvalid(
      source({
        modules: [
          moduleRecord({ semantic: semanticRecord({ divergenceClass: "B", evidence: [] }) }),
        ],
      }),
    );
    expectInvalid(source({ modules: [moduleRecord({ classification: "upstream-mechanism" })] }));
    expectInvalid(
      source({
        modules: [moduleRecord({ semantic: semanticRecord({ upstreamFile: "upstream/a.cxx" }) })],
      }),
    );
    expectInvalid(
      source({
        modules: [moduleRecord({ semantic: semanticRecord({ knownViolations: ["defect"] }) })],
      }),
    );
    expect(
      parseRuntimeInventoryManifest(
        source({
          modules: [
            moduleRecord({
              semantic: semanticRecord({
                behaviorStatus: "parity",
                contractStatus: "parity",
                defaultStatus: "parity",
                divergenceClass: "X",
                sourceResponsibility: "aligned",
              }),
            }),
          ],
        }),
      ).modules[0]?.semantic,
    ).toMatchObject({ divergenceClass: "X", sourceResponsibility: "aligned" });
    expectInvalid(source({ internalOperations: [null] }));
    expectInvalid(source({ uiBehaviors: [null] }));
    expectInvalid(source({ internalOperations: [itemRecord({ classification: "bad" })] }));
    expectInvalid(source({ internalOperations: [itemRecord({ capabilityId: "" })] }));
    expectInvalid(source({ uiBehaviors: duplicateItems() }));
    expectInvalid(source({ placeholderSuites: ["calc", "base"] }));
  });

  it("rejects incomplete coverage, duplicate commands, invalid commands, and unknown capabilities" /** Verifies no runtime surface can escape inventory linkage. @returns A fulfilled assertion promise. */, async function rejectsCoverageGaps(): Promise<void> {
    const manifest = parseRuntimeInventoryManifest(source());
    await expectValidationFailure(manifest, ["src/a.ts"], [], new Set(["CAP-0001"]));
    await expectValidationFailure(manifest, ["src/a.ts", "src/a.ts"], [], new Set(["CAP-0001"]));
    await expectValidationFailure(
      manifest,
      ["src/a.ts", "src/b.tsx"],
      [
        { capabilityId: "CAP-0001", id: ".uno:Same", label: "One" },
        { capabilityId: "CAP-0001", id: ".uno:Same", label: "Two" },
      ],
      new Set(["CAP-0001"]),
    );
    await expectValidationFailure(
      manifest,
      ["src/a.ts", "src/b.tsx"],
      [{ capabilityId: "CAP-0001", id: "bad", label: "" }],
      new Set(["CAP-0001"]),
    );
    await expectValidationFailure(
      manifest,
      ["src/a.ts", "src/b.tsx"],
      [{ capabilityId: "CAP-9999", id: ".uno:Bad", label: "Bad" }],
      new Set(["CAP-0001"]),
    );
    const unknownItem = parseRuntimeInventoryManifest(
      source({ internalOperations: [itemRecord({ capabilityId: "CAP-9999" })] }),
    );
    await expectValidationFailure(
      unknownItem,
      ["src/a.ts", "src/b.tsx"],
      [],
      new Set(["CAP-0001"]),
    );
    const unknownModule = parseRuntimeInventoryManifest(
      source({
        modules: [moduleRecord(), moduleRecord({ capabilityIds: ["CAP-9999"], path: "src/b.tsx" })],
      }),
    );
    await expectValidationFailure(
      unknownModule,
      ["src/a.ts", "src/b.tsx"],
      [],
      new Set(["CAP-0001"]),
    );
  });

  it("rejects invalid infrastructure exemptions and incomplete mutation-helper inventories" /**
   * Proves every capability-free module and exported mutation helper has an explicit audited disposition.
   * @returns A promise resolving after all new exhaustive-coverage failures are observed.
   */, async function rejectsUninventoriedOperations(): Promise<void> {
    const runtimePaths = ["src/a.ts", "src/b.tsx"];
    const knownCapabilities = new Set(["CAP-0001"]);
    const missingExemption = parseRuntimeInventoryManifest(
      source({
        modules: [
          moduleRecord({ capabilityIds: [], infrastructureExemption: undefined }),
          moduleRecord({ capabilityIds: ["CAP-0001"], path: "src/b.tsx" }),
        ],
      }),
    );
    await expectValidationFailure(missingExemption, runtimePaths, [], knownCapabilities);
    const invalidExemption = parseRuntimeInventoryManifest(
      source({
        modules: [
          moduleRecord({
            capabilityIds: ["CAP-0001"],
            infrastructureExemption: "Invalid because this module already names a capability.",
          }),
          moduleRecord({ capabilityIds: ["CAP-0001"], path: "src/b.tsx" }),
        ],
      }),
    );
    await expectValidationFailure(invalidExemption, runtimePaths, [], knownCapabilities);
    const unknownModuleOperation = parseRuntimeInventoryManifest(
      source({
        internalOperations: [itemRecord({ modulePath: "src/missing.ts" })],
      }),
    );
    await expectValidationFailure(unknownModuleOperation, runtimePaths, [], knownCapabilities);
    const nonExportedOperation = parseRuntimeInventoryManifest(
      source({ internalOperations: [itemRecord({ symbol: "replaceMissingParagraph" })] }),
    );
    await expectValidationFailure(nonExportedOperation, runtimePaths, [], knownCapabilities);
    const manifest = parseRuntimeInventoryManifest(source());
    await expect(
      validateRuntimeInventory(
        manifest,
        runtimePaths,
        /** Returns one source with an extra mutation helper. @param path - Fixture module path. @returns Synthetic source. */
        async function readModule(path): Promise<string> {
          return path === "src/a.ts"
            ? "export function moveWriterParagraph() {}"
            : "export function replaceWriterParagraph() {}";
        },
        [],
        knownCapabilities,
      ),
    ).rejects.toThrowError(/mutation helper inventory/u);
    const omittedMutation = parseRuntimeInventoryManifest(source({ internalOperations: [] }));
    await expect(
      validateRuntimeInventory(
        omittedMutation,
        runtimePaths,
        /** Returns one unlisted mutation helper. @param path - Fixture module path. @returns Synthetic source. */
        async function readMutationModule(path): Promise<string> {
          return path === "src/a.ts" ? "" : "export function replaceWriterParagraph() {}";
        },
        [],
        knownCapabilities,
      ),
    ).rejects.toThrowError(/received none/u);
    const spuriousMutation = parseRuntimeInventoryManifest(
      source({ internalOperations: [itemRecord()] }),
    );
    await expect(
      validateRuntimeInventory(
        spuriousMutation,
        runtimePaths,
        /** Returns one inventoried but non-mutating export. @param path - Fixture module path. @returns Synthetic source. */
        async function readNonMutationModule(path): Promise<string> {
          return path === "src/a.ts" ? "export function alpha() {}" : "";
        },
        [],
        knownCapabilities,
      ),
    ).rejects.toThrowError(/expected none/u);
  });

  it("detects the five Phase 0 semantic and boundary defects", /** Verifies AST/API and source-boundary findings. @returns Nothing. */ function detectsSemanticDefects(): void {
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          path: "apps/office/src/sw/source/core/doc/doc.ts",
          semantic: semanticRecord({ expectedBaseClass: null, localSymbols: ["SwDoc"] }),
        }) as never,
        "export class SwDoc extends SwModify {}",
      ),
    ).toContain("inheritance:SwDoc:SwModify");
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          classification: "browser-adaptation",
          path: "apps/office/src/sw/source/uibase/uiview/view.tsx",
        }) as never,
        'import React from "react"; export function WriterWorkbench() {}',
      ),
    ).toEqual(["browser-adapter-upstream-path", "browser-api-in-upstream-core"]);
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({ path: "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts" }) as never,
        "export function createTransfer(selection: Selection): void {}",
      ),
    ).toContain("browser-api-in-upstream-core");
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          path: "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
        }) as never,
        'export const command = "writer.format.bold";',
      ),
    ).toContain("custom-command-namespace");
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          classification: "upstream-mechanism",
          path: "apps/office/src/sw/source/uibase/shells/listsh.ts",
        }) as never,
        'export type WriterListAction = "promote" | "demote";',
      ),
    ).toContain("placeholder-upstream-mechanism");
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          path: "apps/office/src/sw/source/core/example.ts",
          semantic: semanticRecord({
            expectedBaseClass: "Base",
            localSymbols: ["Alpha", "Mode", "run", "Shape", "Alias", "value", "method"],
          }),
        }) as never,
        "export class Alpha extends Base { method(): void {} } export enum Mode { One } export function run(): void {} export interface Shape {} export type Alias = string; export const value = 1;",
      ),
    ).toEqual([]);
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          path: "apps/office/src/sw/source/core/base.ts",
          semantic: semanticRecord({ expectedBaseClass: null, localSymbols: ["Alpha"] }),
        }) as never,
        "export class Alpha {}",
      ),
    ).toEqual([]);
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          path: "apps/office/src/sw/source/core/unknown.ts",
          semantic: semanticRecord({ expectedBaseClass: null, localSymbols: [] }),
        }) as never,
        "",
      ),
    ).toEqual(["inheritance:unknown:none"]);
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          path: "apps/office/src/sw/source/core/missing.ts",
          semantic: semanticRecord({ expectedBaseClass: null, localSymbols: ["Missing"] }),
        }) as never,
        "globalThis.document; globalThis.getSelection; globalThis.indexedDB; globalThis.window;",
      ),
    ).toEqual([
      "browser-api-in-upstream-core",
      "inheritance:Missing:none",
      "missing-local-symbol:Missing",
    ]);
    for (const browserGlobal of ["getSelection", "indexedDB", "window"])
      expect(
        analyzeRuntimeModuleSemantics(
          moduleRecord({ path: "apps/office/src/sw/source/core/global.ts" }) as never,
          `globalThis.${browserGlobal};`,
        ),
      ).toContain("browser-api-in-upstream-core");
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          classification: "browser-adaptation",
          path: "apps/office/src/sw/browser/editor/selection.ts",
        }) as never,
        "export const selection = 1;",
      ),
    ).toEqual([]);
    expect(
      analyzeRuntimeModuleSemantics(
        moduleRecord({
          classification: "upstream-mechanism",
          path: "apps/office/src/sw/source/uibase/shells/listsh.ts",
        }) as never,
        "export class SwListShell {}",
      ),
    ).toEqual([]);
  });
});

/**
 * Creates one valid module record with targeted overrides.
 * @param overrides - Record fields replacing valid defaults.
 * @returns Valid authored module record.
 */
function moduleRecord(overrides: Readonly<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    capabilityIds: [],
    classification: "local-infrastructure",
    path: "src/a.ts",
    semantic: semanticRecord(),
    state: "internal",
    subsystem: "test",
    suite: "shared",
    ...overrides,
  };
}

/** Creates valid semantic provenance with targeted overrides. @param overrides - Semantic overrides. @returns Valid semantic record. */
function semanticRecord(
  overrides: Readonly<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    behaviorStatus: "unverified",
    contractStatus: "unverified",
    defaultStatus: "unverified",
    divergenceClass: "none",
    evidence: ["synthetic evidence"],
    justification: "Synthetic semantic provenance used by the strict runtime inventory tests.",
    knownViolations: [],
    localSymbols: [],
    sourceResponsibility: "unverified",
    upstreamFile: null,
    upstreamSymbols: [],
    ...overrides,
  };
}

/** Creates two duplicate-path records. @returns Invalid duplicate module records. */
function duplicateModules(): readonly Record<string, unknown>[] {
  return [moduleRecord(), moduleRecord()];
}

/**
 * Creates one valid non-module inventory item with targeted overrides.
 * @param overrides - Record fields replacing valid defaults.
 * @returns Valid authored item record.
 */
function itemRecord(overrides: Readonly<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    capabilityId: "CAP-0001",
    classification: "local-infrastructure",
    description: "Item.",
    id: "item.one",
    modulePath: "src/a.ts",
    symbol: "alpha",
    ...overrides,
  };
}

/** Creates duplicate item IDs for ordering validation. @returns Invalid duplicate items. */
function duplicateItems(): readonly Record<string, unknown>[] {
  return [itemRecord(), itemRecord()];
}

/**
 * Expects strict parsing to reject one source.
 * @param candidate - Malformed runtime inventory source.
 * @returns Nothing after the rejection assertion.
 */
function expectInvalid(candidate: string): void {
  expect(
    /**
     * Parses malformed inventory inside an assertion.
     * @returns A result that should never be returned.
     */
    function parseInvalid(): unknown {
      return parseRuntimeInventoryManifest(candidate);
    },
  ).toThrowError();
}

/**
 * Executes validation expecting any deterministic failure.
 * @param manifest - Parsed runtime manifest.
 * @param paths - Discovered module paths.
 * @param commands - Visible runtime commands.
 * @param capabilityIds - Known parity capability IDs.
 * @returns A promise resolving after validation rejects.
 */
async function expectValidationFailure(
  manifest: ReturnType<typeof parseRuntimeInventoryManifest>,
  paths: readonly string[],
  commands: readonly {
    readonly capabilityId: string;
    readonly id: string;
    readonly label: string;
  }[],
  capabilityIds: ReadonlySet<string>,
): Promise<void> {
  await expect(
    validateRuntimeInventory(
      manifest,
      paths,
      /** Returns empty module source. @returns A promise resolving to empty source. */
      async function readModule(): Promise<string> {
        return "";
      },
      commands,
      capabilityIds,
    ),
  ).rejects.toThrowError();
}

/**
 * Flattens exported operations from a runtime report.
 * @param modules - Runtime module report entries.
 * @returns Exported operations in module order.
 */
function reportedOperations(
  modules: readonly { readonly exportedOperations: readonly string[] }[],
): readonly string[] {
  return modules.flatMap(
    /** Selects one module's operations. @param module - Runtime module entry. @returns Its exported operations. */
    function selectOperations(module): readonly string[] {
      return module.exportedOperations;
    },
  );
}
