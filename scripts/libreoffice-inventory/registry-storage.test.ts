/** @fileoverview Exercises independently keyed registry loading, deterministic views, and strict physical ownership. */
import { mkdir, mkdtemp, writeFile, symlink, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createCapabilityId, isCapabilityId } from "./capability-identity";
import {
  listRegistryFiles,
  loadInventoryRegistry,
  projectRegistryViews,
  readInventoryCompatibilityText,
  registryRecordKey,
  selectRegistryRecords,
  sourceRegistryOwner,
  type InventoryRegistry,
} from "./registry-storage";

/** Builds isolated virtual storage with every record collection represented. @returns Mutable text files. */
function files(): Map<string, string> {
  const result = new Map<string, string>();
  const metadata = {
    schemaVersion: 1,
    baselineCommit: "commit",
    baselineTag: "tag",
    placeholderSuites: ["calc"],
  };
  result.set("registry/manifest.json", JSON.stringify(metadata));
  for (const suite of ["writer", "calc", "shared"])
    result.set(
      `registry/${suite}/application.json`,
      JSON.stringify({ suite, active: true, commands: null }),
    );
  const records = [
    ["writer", "capabilities", "CAP-0001", { capabilityId: "CAP-0001", suite: "writer" }],
    ["writer", "runtime", "sw/a.ts", { path: "apps/office/src/sw/a.ts", suite: "writer" }],
    ["shared", "provenance", "svl/a.ts", { localPath: "apps/office/src/svl/a.ts" }],
    [
      "writer",
      "operations",
      "writer.op",
      { id: "writer.op", modulePath: "apps/office/src/sw/a.ts" },
    ],
    [
      "shared",
      "invariants",
      "svl.default",
      { id: "svl.default", local: { path: "apps/office/src/svl/a.ts" } },
    ],
    ["writer", "ui", "writer.ui", { id: "writer.ui" }],
  ] as const;
  for (const [owner, kind, key, record] of records)
    result.set(
      `registry/${owner}/${kind}/${key}.json`,
      JSON.stringify({ baselineCommit: "commit", baselineTag: "tag", record }),
    );
  result.set("registry/README.md", "Documentation.");
  return result;
}

/** Loads virtual files in reverse directory order to test canonical ordering. @param input - Text files. @returns Parsed registry. */
async function load(input: Map<string, string>): Promise<InventoryRegistry> {
  return loadInventoryRegistry(
    "registry",
    /** Reads owned text. @param path - Virtual path. @returns Text. */ async (path) =>
      input.get(path) as string,
    /** Lists files independently of ordering. @returns Relative entries. */ async () =>
      [...input.keys()]
        .map(
          /** Removes root. @param path - Virtual path. @returns Relative path. */ (path) =>
            path.slice("registry/".length),
        )
        .reverse(),
  );
}

/** Rewrites one virtual JSON value. @param input - Files. @param path - File key. @param value - Replacement value. @returns Nothing. */
function put(input: Map<string, string>, path: string, value: unknown): void {
  input.set(path, JSON.stringify(value));
}

/** Changes one envelope while preserving its otherwise valid metadata. @param input - Files. @param overrides - Replacement fields. @returns Nothing. */
function envelope(input: Map<string, string>, overrides: Record<string, unknown>): void {
  const path = "registry/writer/runtime/sw/a.ts.json";
  put(input, path, { ...JSON.parse(input.get(path) as string), ...overrides });
}

describe("canonical registry storage", /** Registers migration and ownership regressions. @returns Nothing. */ () => {
  it("allocates UUID v4 IDs without application counters and keeps legacy IDs valid", /** Checks canonical identity rules. @returns Nothing. */ () => {
    expect(isCapabilityId("CAP-0001")).toBe(true);
    expect(isCapabilityId(createCapabilityId())).toBe(true);
    expect(
      createCapabilityId(
        /** Supplies a deterministic UUID. @returns UUID. */ () =>
          "12345678-1234-4234-8234-123456789abc",
      ),
    ).toBe("CAP-12345678-1234-4234-8234-123456789abc");
    for (const value of [
      "CAP-1",
      "CAP-10000",
      "LO-WRITER-0001",
      "CAP-12345678-1234-1234-8234-123456789abc",
      "CAP-12345678-1234-4234-7234-123456789abc",
      "CAP-12345678-1234-4234-8234-123456789ABC",
    ])
      expect(isCapabilityId(value)).toBe(false);
    expect(
      /** Requests an invalid generator output. @returns Identity or error. */ () =>
        createCapabilityId(/** Emits a legacy counter. @returns Invalid UUID. */ () => "0001"),
    ).toThrow("UUID v4");
  });
  it("maps physical source ownership and validates stable keys", /** Covers owners and unsafe filenames. @returns Nothing. */ () => {
    expect(sourceRegistryOwner("apps/office/src/sw/a.ts")).toBe("writer");
    expect(sourceRegistryOwner("apps/office/src/test/wrtsh-test-helpers.ts")).toBe("writer");
    expect(sourceRegistryOwner("apps/office/src/sc/a.ts")).toBe("calc");
    expect(sourceRegistryOwner("apps/office/src/svl/a.ts")).toBe("shared");
    for (const key of [undefined, "", 1, "bad\\key", "bad/../key", "./key", "bad//key", "bad key"])
      expect(
        /** Evaluates an invalid key. @returns Filename or error. */ () =>
          registryRecordKey("capabilities", { capabilityId: key }),
      ).toThrow();
    expect(
      /** Rejects source outside the runtime root. @returns Filename or error. */ () =>
        registryRecordKey("runtime", { path: "src/a.ts" }),
    ).toThrow("source path");
  });
  it("loads every collection and independent additions deterministically", /** Simulates branch-local additions without a shared index. @returns Completion after assertions. */ async () => {
    const input = files();
    const initial = await load(input);
    expect(initial.records).toHaveLength(6);
    for (const [suite, suffix] of [
      ["writer", "1"],
      ["calc", "2"],
      ["shared", "3"],
    ]) {
      const id = `CAP-${suffix}2345678-1234-4234-8234-123456789abc`;
      put(input, `registry/${suite}/capabilities/${id}.json`, {
        baselineCommit: "commit",
        baselineTag: "tag",
        record: { capabilityId: id, suite },
      });
    }
    const merged = await load(input);
    expect(selectRegistryRecords(merged, "capabilities")).toHaveLength(4);
    expect(selectRegistryRecords(merged, "capabilities", "calc")).toHaveLength(1);
    for (const localPath of ["apps/office/src/svl/a.ts", "apps/office/src/svl/b.ts"]) {
      const record = {
        localPath,
        filenameDivergence: { localPath, rationale: "Test filename explanation." },
      };
      put(input, `registry/shared/provenance/${localPath.slice("apps/office/src/".length)}.json`, {
        baselineCommit: "commit",
        baselineTag: "tag",
        record,
      });
    }
    const withExplanations = await load(input);
    expect(
      projectRegistryViews({
        ...withExplanations,
        records: [...withExplanations.records].reverse(),
      }),
    ).toEqual(projectRegistryViews(withExplanations));
    const repeated = { ...merged, records: [...merged.records].reverse() };
    expect(projectRegistryViews(repeated)).toEqual(projectRegistryViews(merged));
    const duplicate = {
      ...merged,
      records: [
        ...merged.records,
        required(
          merged.records.find(
            /** Finds an equal key for ordering regression. @param item - Owned record. @returns Whether capability. */ (
              item,
            ) => item.kind === "capabilities",
          ),
        ),
      ],
    };
    expect(selectRegistryRecords(duplicate, "capabilities")).toHaveLength(5);
    expect(
      projectRegistryViews(merged)["docs/program/parity/runtime-inventory.json"],
    ).toMatchObject({ placeholderSuites: [] });
  });
  it("rejects metadata, envelopes, filenames, and ownership drift", /** Checks invalid virtual storage declarations. @returns Completion after rejections. */ async () => {
    for (const change of [
      { schemaVersion: 2 },
      { baselineCommit: 1 },
      { baselineTag: null },
      { placeholderSuites: null },
    ]) {
      const input = files();
      put(input, "registry/manifest.json", {
        schemaVersion: 1,
        baselineCommit: "commit",
        baselineTag: "tag",
        placeholderSuites: [],
        ...change,
      });
      await expect(load(input)).rejects.toThrow("metadata");
    }
    for (const change of [
      { suite: "calc" },
      { active: null },
      { commands: {} },
      { commands: { module: "file", export: null } },
    ]) {
      const input = files();
      put(input, "registry/writer/application.json", {
        suite: "writer",
        active: true,
        commands: null,
        ...change,
      });
      await expect(load(input)).rejects.toThrow("application");
    }
    for (const change of [
      { legacyOrder: -1 },
      { legacyOrder: 0 },
      { filenameOrder: "invalid" },
      { baselineCommit: "wrong" },
      { baselineTag: "wrong" },
      { record: null },
      { record: 1 },
      { record: [] },
      { record: { path: "apps/office/src/sw/a.ts", suite: "calc" } },
      { record: { path: "apps/office/src/sw/b.ts" } },
      { record: { path: "apps/office/src/sc/a.ts" } },
    ]) {
      const input = files();
      envelope(input, change);
      await expect(load(input)).rejects.toThrow();
    }
    const moved = files();
    moved.set(
      "registry/shared/runtime/sw/a.ts.json",
      required(moved.get("registry/writer/runtime/sw/a.ts.json")),
    );
    moved.delete("registry/writer/runtime/sw/a.ts.json");
    await expect(load(moved)).rejects.toThrow("source owner");
    const cap = files();
    put(cap, "registry/writer/capabilities/CAP-0001.json", {
      baselineCommit: "commit",
      baselineTag: "tag",
      record: { capabilityId: "CAP-0001", suite: "shared" },
    });
    await expect(load(cap)).rejects.toThrow("capability owner");
    for (const path of ["alien/runtime/a.json", "writer/alien/a.json"]) {
      const input = files();
      input.set(`registry/${path}`, "{}");
      await expect(load(input)).rejects.toThrow("Unknown");
    }
    const absent = files();
    put(absent, "registry/shared/invariants/svl.default.json", {
      baselineCommit: "commit",
      baselineTag: "tag",
      record: { id: "svl.default" },
    });
    expect((await load(absent)).records).toHaveLength(6);
  });
  it("rejects symlinks and lists relative paths for absolute and relative roots", /** Exercises the real filesystem boundary inside the repository. @returns Completion after cleanup. */ async () => {
    await mkdir("test-results", { recursive: true });
    const root = await mkdtemp("test-results/registry-");
    try {
      await mkdir(`${root}/nested`);
      await writeFile(`${root}/nested/a.json`, "{}");
      expect(await listRegistryFiles(root)).toEqual(["nested/a.json"]);
      expect(await listRegistryFiles(resolve(root))).toEqual(["nested/a.json"]);
      await symlink("a.json", `${root}/nested/link.json`);
      await expect(listRegistryFiles(root)).rejects.toThrow("symlinks");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  it("retains the exact historical projections and reads them without generated files", /** Checks original byte digests and virtual compatibility reads. @returns Completion after all digests match. */ async () => {
    const registry = await loadInventoryRegistry();
    expect(selectRegistryRecords(registry, "capabilities", "writer")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ capabilityId: "CAP-0101", id: "LO-WRITER-0101" }),
      ]),
    );
    for (const [path, data] of Object.entries(projectRegistryViews(registry))) {
      const text = `${JSON.stringify(data, null, 2)}\n`;
      expect(await readInventoryCompatibilityText(path)).toBe(text);
    }
    expect(await readInventoryCompatibilityText("package.json")).toContain('"vite-office"');
  });
});

/** Narrows a fixture value after asserting its presence. @param value - Fixture lookup result. @returns Present fixture value. */
function required<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}
