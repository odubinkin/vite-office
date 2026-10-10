/** @fileoverview Verifies global collision rejection and independent app evidence with owned upstream marker fixtures. */
import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createMarkerEvidenceFixture } from "../test-fixtures/inventory-reference";
import { writerUserCommands } from "../../apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands";
import {
  loadInventoryRegistry,
  projectRegistryViews,
  type InventoryRegistry,
  type OwnedRegistryRecord,
  type RegistryScope,
} from "./registry-storage";
import {
  includesRegistryOwner,
  loadRegistryCommands,
  parseInventoryRegistry,
  parseRegistryInvariants,
  validateRegistryEvidence,
} from "./registry-validation";
import {
  parseRegistryCliOptions,
  runRegistryCli,
  type RegistryCliDependencies,
} from "./registry-cli";
import {
  parseRuntimeInventoryManifest,
  selectRuntimeModulePaths,
  validateRuntimeInventory,
} from "./runtime-inventory";

/** Loads the complete canonical registry and its pinned identity. @returns Mutable test registry and baseline JSON. */
async function fixture(): Promise<{ registry: InventoryRegistry; baseline: string }> {
  const [registry, baseline] = await canonicalFixture;
  return { registry: structuredClone(registry), baseline };
}
/** Loads the canonical fixture once so collision cases share no mutable state or repeated IO. */
const canonicalFixture = Promise.all([
  loadInventoryRegistry(),
  readFile("docs/program/libreoffice-baseline.json", "utf8"),
]);

/** Finds a test-owned mutable raw record. @param registry - Mutable registry copy. @param kind - Record kind. @returns First matching record. */
function first(
  registry: InventoryRegistry,
  kind: OwnedRegistryRecord["kind"],
): OwnedRegistryRecord {
  return required(
    registry.records.find(
      /** Selects requested collection. @param record - Owned record. @returns Whether matching. */ (
        record,
      ) => record.kind === kind,
    ),
  );
}
/** Adds one independently identified capability to a registry copy. @param registry - Test registry. @param suite - Owner. @param identity - New stable ID. @returns New owned record. */
function capability(
  registry: InventoryRegistry,
  suite: "writer" | "calc" | "shared",
  identity = "CAP-12345678-1234-4234-8234-123456789abc",
): OwnedRegistryRecord {
  const source = required(
    registry.records.find(
      /** Selects an explicit Writer template independently of app directory order. @param record - Owned record. @returns Whether Writer capability. */
      (record) => record.kind === "capabilities" && record.owner === "writer",
    ),
  );
  const result = {
    ...source,
    owner: suite,
    record: { ...structuredClone(source.record), capabilityId: identity, id: identity, suite },
  };
  (registry.records as OwnedRegistryRecord[]).push(result);
  return result;
}
/** Activates Calc without editing central metadata. @param registry - Mutable copy. @returns Nothing. */
function activateCalc(registry: InventoryRegistry): void {
  Object.assign(
    required(
      registry.applications.find(
        /** Finds app config. @param app - App. @returns Whether Calc. */ (app) =>
          app.suite === "calc",
      ),
    ),
    { active: true },
  );
}
/** Creates injected CLI boundaries using local source and synthetic upstream declarations. @param registry - Canonical registry. @param baseline - Baseline JSON. @returns Test-owned CLI boundaries. */
function dependencies(registry: InventoryRegistry, baseline: string): RegistryCliDependencies {
  const markers = new Map<string, string>();
  for (const [path, text] of createMarkerEvidenceFixture([
    projectRegistryViews(registry),
    registry.records,
  ])) {
    const normalized = path.replace(/^vendor\/libreoffice-reference\//u, "");
    markers.set(normalized, `${markers.get(normalized) ?? ""}\n${text}`);
  }
  for (const item of registry.records) {
    if (item.kind === "provenance" && typeof item.record.upstreamPath === "string") {
      const path = item.record.upstreamPath;
      markers.set(
        path,
        `${markers.get(path) ?? ""}\n${(item.record.upstreamSymbols as string[]).join("\n")}`,
      );
    }
  }
  return {
    /** Loads the owned registry. @returns Registry. */ load: async () => registry,
    /** Reads local source or marker-only upstream fixture. @param path - Requested path. @returns UTF-8 text. */ read: async (
      path,
    ) => {
      if (path === "docs/program/libreoffice-baseline.json") return baseline;
      if (path.startsWith("vendor/libreoffice-reference/"))
        return required(markers.get(path.slice("vendor/libreoffice-reference/".length)));
      if (path.startsWith("vendor/mdds-reference/")) return required(markers.get(path));
      return readFile(path, "utf8");
    },
    /** Lists local runtime files. @returns Relative entries. */ listRuntime: async () =>
      readdir("apps/office/src", { recursive: true }),
    /** Supplies the app command export. @returns Module shape. */ loadModule: async () => ({
      writerUserCommands,
    }),
    /** Rejects unexpected writes in check commands. @returns Never. */ write: async () => {
      throw new Error("Unexpected write.");
    },
    /** Emits a deterministic UUID. @returns UUID. */ generateUuid: () =>
      "12345678-1234-4234-8234-123456789abc",
  };
}

describe("global and scoped registry gates", /** Registers inventory concurrency checks. @returns Nothing. */ () => {
  it("accepts UUID capabilities with independently ordered legacy aliases across apps", /** Proves allocation and alias order are independent. @returns Completion after assertions. */ async () => {
    const { registry, baseline } = await fixture();
    activateCalc(registry);
    capability(registry, "calc");
    capability(registry, "shared", "CAP-22345678-1234-4234-8234-123456789abc");
    const writer = capability(registry, "writer", "CAP-32345678-1234-4234-8234-123456789abc");
    writer.record.atomicOperation = "Independent Writer atomic contract.";
    const parsed = parseInventoryRegistry(registry, baseline);
    expect(parsed.capabilities.records).toHaveLength(
      registry.records.filter(
        /** Counts explicit capability records. @param record - Owned record. @returns Whether capability. */
        (record) => record.kind === "capabilities",
      ).length,
    );
    expect(parsed.runtime.placeholderSuites).not.toContain("calc");
    const reverse = { ...registry, records: [...registry.records].reverse() };
    expect(parseInventoryRegistry(reverse, baseline)).toEqual(parsed);
    expect(includesRegistryOwner("writer", "writer")).toBe(true);
    expect(includesRegistryOwner("writer", "calc")).toBe(false);
  });
  it("rejects global duplicate IDs, aliases, operation contracts, paths and orphan references", /** Exercises merge collision guards. @returns Completion after assertions. */ async () => {
    for (const failure of [
      "capability",
      "alias",
      "contract",
      "symbol",
      "provenance",
      "coverage",
      "orphan",
      "inactive",
    ]) {
      const { registry, baseline } = await fixture();
      if (failure === "capability")
        (registry.records as OwnedRegistryRecord[]).push(
          structuredClone(first(registry, "capabilities")),
        );
      if (failure === "alias") {
        const next = capability(registry, "writer");
        next.record.id = first(registry, "capabilities").record.id;
      }
      if (failure === "contract") capability(registry, "writer");
      if (failure === "symbol") {
        const next = structuredClone(first(registry, "operations"));
        next.record.id = "writer.another.operation";
        (registry.records as OwnedRegistryRecord[]).push(next);
      }
      if (failure === "provenance")
        (registry.records as OwnedRegistryRecord[]).push(
          structuredClone(first(registry, "provenance")),
        );
      if (failure === "coverage")
        (registry.records as OwnedRegistryRecord[]).splice(
          registry.records.indexOf(first(registry, "provenance")),
          1,
        );
      if (failure === "orphan") first(registry, "runtime").record.capabilityIds = ["CAP-9999"];
      if (failure === "inactive") {
        capability(registry, "calc");
        Object.assign(
          required(
            registry.applications.find(
              /** Explicitly deactivates the test-owned app. @param app - App config. @returns Whether Calc. */
              (app) => app.suite === "calc",
            ),
          ),
          { active: false },
        );
      }
      expect(
        /** Parses the merged invalid registry. @returns Parsed manifests or error. */ () =>
          parseInventoryRegistry(registry, baseline),
      ).toThrow();
    }
  });
  it("strictly parses independent invariant entries", /** Rejects malformed paths and contract data. @returns Completion after assertions. */ async () => {
    const { registry } = await fixture();
    const valid = projectRegistryViews(registry)[
      "docs/program/parity/upstream-invariants.json"
    ] as { entries: Record<string, unknown>[] };
    for (const value of [
      null,
      { schemaVersion: 2, entries: [] },
      { schemaVersion: 1, entries: null },
      { schemaVersion: 1, entries: [null] },
      { schemaVersion: 1, entries: [{ id: 1 }] },
      { schemaVersion: 1, entries: [{ id: "" }] },
      { schemaVersion: 1, entries: [{ ...valid.entries[0], kind: "invalid" }] },
      { schemaVersion: 1, entries: [{ ...valid.entries[0], divergenceClass: "invalid" }] },
    ])
      expect(
        /** Parses invalid invariants. @returns Manifest or error. */ () =>
          parseRegistryInvariants(value),
      ).toThrow();
    const template = required(valid.entries[0]);
    for (const local of [
      null,
      { path: 1 },
      { path: "bad path" },
      { path: "/absolute" },
      { path: "../escape" },
      { path: "file", marker: null },
      { path: "file", marker: "" },
      { path: "file", marker: "marker", value: null },
    ])
      expect(
        /** Rejects malformed invariant evidence. @returns Manifest or error. */ () =>
          parseRegistryInvariants({
            ...valid,
            schemaVersion: 1,
            entries: [{ ...template, local }],
          }),
      ).toThrow("reference");
    expect(
      /** Rejects duplicate invariant identity. @returns Manifest or error. */ () =>
        parseRegistryInvariants({ ...valid, schemaVersion: 1, entries: [template, template] }),
    ).toThrow("Duplicate");
  });
  it("loads command URLs in app namespaces and rejects unsafe module declarations", /** Proves shared UNO URLs can coexist across Writer and Calc. @returns Completion after assertions. */ async () => {
    const { registry } = await fixture();
    activateCalc(registry);
    const calc = required(
      registry.applications.find(
        /** Selects Calc. @param app - Config. @returns Whether Calc. */ (app) =>
          app.suite === "calc",
      ),
    );
    Object.assign(calc, {
      commands: { module: "apps/office/src/sc/commands.ts", export: "calcCommands" },
    });
    const commands = await loadRegistryCommands(
      registry,
      "all",
      /** Supplies one command in both apps. @returns Exports. */ async () => ({
        writerUserCommands: [{ id: ".uno:Save", label: "Save", capabilityId: "CAP-0101" }],
        calcCommands: [{ id: ".uno:Save", label: "Save", capabilityId: "CAP-0101" }],
      }),
    );
    expect(
      commands.map(
        /** Selects command namespace. @param command - Command. @returns Owner. */ (command) =>
          command.suite,
      ),
    ).toEqual(["writer", "calc"]);
    const runtime = parseRuntimeInventoryManifest(
      JSON.stringify({
        schemaVersion: 3,
        modules: [],
        internalOperations: [],
        uiBehaviors: [],
        placeholderSuites: [],
      }),
    );
    await expect(
      validateRuntimeInventory(
        runtime,
        [],
        /** Unused source reader. @returns Empty source. */ async () => "",
        commands,
        new Set(["CAP-0101"]),
      ),
    ).resolves.toMatchObject({ commandCount: 2 });
    await expect(
      validateRuntimeInventory(
        runtime,
        [],
        /** Unused source reader. @returns Empty source. */ async () => "",
        [required(commands[0]), required(commands[0])],
        new Set(["CAP-0101"]),
      ),
    ).rejects.toThrow("command IDs");
    for (const module of [
      "outside.ts",
      "apps/office/src/sc/../secret.ts",
      "apps/office/src/sc/./commands.ts",
      "apps/office/src/sc//commands.ts",
      "apps/office/src/sc/bad\\file.ts",
      "apps/office/src/sw/commands.ts",
    ]) {
      Object.assign(calc, { commands: { module, export: "calcCommands" } });
      await expect(
        loadRegistryCommands(
          registry,
          "calc",
          /** Unused import. @returns Empty export object. */ async () => ({}),
        ),
      ).rejects.toThrow("module");
    }
    Object.assign(calc, {
      commands: { module: "apps/office/src/sc/commands.ts", export: "calcCommands" },
    });
    for (const exported of [
      null,
      [null],
      [{ id: 1 }],
      [{ id: ".uno:Save", label: 1 }],
      [{ id: ".uno:Save", label: "Save", capabilityId: 1 }],
    ])
      await expect(
        loadRegistryCommands(
          registry,
          "calc",
          /** Supplies malformed command export. @returns Exports. */ async () => ({
            calcCommands: exported,
          }),
        ),
      ).rejects.toThrow("export");
  });
  it("checks all and app scopes with complete global discovery and shared references", /** Uses owned upstream markers, not real-source parity claims. @returns Completion after all scoped gates. */ async () => {
    const { registry, baseline } = await fixture();
    const deps = dependencies(registry, baseline);
    for (const scope of ["all", "writer", "calc", "shared"] as RegistryScope[]) {
      let output = "";
      await runRegistryCli(
        ["check", "--scope", scope],
        deps,
        /** Captures report. @param value - JSON. @returns Nothing. */ (value) => {
          output = value;
        },
      );
      const report = JSON.parse(output);
      expect(report.scope).toBe(scope);
      expect(report.moduleCount).toBeGreaterThan(0);
      const expectedCapabilities = registry.records.filter(
        /** Derives independent scope expectations from owned inputs, including shared records. @param record - Owned record. @returns Whether expected in this scope. */
        (record) =>
          record.kind === "capabilities" &&
          (scope === "all" || record.owner === scope || record.owner === "shared"),
      );
      expect(report.capabilityCount).toBe(expectedCapabilities.length);
    }
    const parsed = parseInventoryRegistry(registry, baseline);
    await expect(
      validateRegistryEvidence(
        registry,
        parsed,
        "calc",
        [],
        deps.read,
        [],
        "vendor/libreoffice-reference",
      ),
    ).rejects.toThrow("discovered");
    const paths = selectRuntimeModulePaths("apps/office/src", await deps.listRuntime());
    await expect(
      validateRegistryEvidence(
        registry,
        parsed,
        "all",
        [...paths, required(paths[0])],
        deps.read,
        writerUserCommands,
        "vendor/libreoffice-reference",
      ),
    ).rejects.toThrow("discovered");
  }, 60_000);
  it("parses strict CLI options, emits UUIDs and writes four explicit compatibility views", /** Covers CLI modes without implicit writes. @returns Completion after assertions. */ async () => {
    for (const args of [
      [],
      ["invalid"],
      ["check", "--scope"],
      ["check", "--wrong", "calc"],
      ["check", "--scope", "unknown"],
      ["id", "--scope", "writer"],
      ["build", "--scope", "calc"],
      ["check", "--scope", "calc", "extra"],
    ])
      expect(
        /** Parses invalid CLI arguments. @returns Options or error. */ () =>
          parseRegistryCliOptions(args),
      ).toThrow("Usage");
    expect(parseRegistryCliOptions(["check"])).toEqual({ mode: "check", scope: "all" });
    const { registry, baseline } = await fixture();
    const deps = dependencies(registry, baseline);
    let output = "";
    const writes = new Map<string, string>();
    await runRegistryCli(
      ["id"],
      deps,
      /** Captures allocated ID. @param value - Identity. @returns Nothing. */ (value) => {
        output = value;
      },
    );
    expect(output).toBe("CAP-12345678-1234-4234-8234-123456789abc\n");
    await expect(deps.write("unexpected", "text")).rejects.toThrow("Unexpected");
    await runRegistryCli(
      ["build"],
      {
        ...deps,
        /** Captures generated compatibility files. @param path - Destination. @param value - JSON. @returns Completion. */ write:
          async (path, value) => {
            writes.set(path, value);
          },
      },
      /** Captures generator report. @param value - JSON. @returns Nothing. */ (value) => {
        output = value;
      },
    );
    expect(writes.size).toBe(4);
    expect(JSON.parse(output)).toEqual({ status: "generated", viewCount: 4 });
  });
});

/** Narrows a fixture value after asserting its presence. @param value - Fixture lookup result. @returns Present fixture value. */
function required<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}
