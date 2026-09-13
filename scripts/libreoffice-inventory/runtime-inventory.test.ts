/** @fileoverview Verifies complete runtime-module, exported-operation, command, UI, and placeholder classification. */

import { describe, expect, it } from "vitest";

import {
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
        id: "internal.operation",
      },
    ],
    modules: [
      {
        capabilityIds: [],
        classification: "local-infrastructure",
        path: "src/a.ts",
        state: "foundation",
        subsystem: "bootstrap",
        suite: "shared",
      },
      {
        capabilityIds: ["CAP-0001"],
        classification: "upstream-mechanism",
        path: "src/b.tsx",
        state: "active",
        subsystem: "writer",
        suite: "writer",
      },
    ],
    placeholderSuites: ["base", "calc"],
    schemaVersion: 1,
    uiBehaviors: [
      {
        classification: "browser-adaptation",
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
          : "export async function beta() {}\nexport function gamma() {}";
      },
      [{ capabilityId: "CAP-0001", id: "writer.test", label: "Test" }],
      new Set(["CAP-0001"]),
    );
    expect(report).toMatchObject({
      commandCount: 1,
      exportedOperationCount: 3,
      internalOperationCount: 1,
      placeholderSuiteCount: 2,
      schemaVersion: 1,
      uiBehaviorCount: 1,
    });
    expect(reportedOperations(report.modules)).toEqual(["alpha", "beta", "gamma"]);
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
    expectInvalid(source({ schemaVersion: 2 }));
    expectInvalid(source({ modules: "bad" }));
    expectInvalid(source({ modules: [null] }));
    expectInvalid(source({ modules: duplicateModules() }));
    expectInvalid(source({ modules: [moduleRecord({ classification: "bad" })] }));
    expectInvalid(source({ modules: [moduleRecord({ state: "bad" })] }));
    expectInvalid(source({ modules: [moduleRecord({ suite: "calc" })] }));
    expectInvalid(source({ modules: [moduleRecord({ subsystem: "" })] }));
    expectInvalid(source({ modules: [moduleRecord({ capabilityIds: [""] })] }));
    expectInvalid(source({ internalOperations: [null] }));
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
        { capabilityId: "CAP-0001", id: "writer.same", label: "One" },
        { capabilityId: "CAP-0001", id: "writer.same", label: "Two" },
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
      [{ capabilityId: "CAP-9999", id: "writer.bad", label: "Bad" }],
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
    state: "internal",
    subsystem: "test",
    suite: "shared",
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
    classification: "local-infrastructure",
    description: "Item.",
    id: "item.one",
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
