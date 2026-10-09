/** @fileoverview Loads independently authored application records and projects deterministic compatibility manifests. */
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

/** Owners that can author records independently. */
export const registryOwners = ["writer", "calc", "shared"] as const;
/** One independently editable storage owner. */
export type RegistryOwner = (typeof registryOwners)[number];
/** Scope selectable by developer checks. */
export type RegistryScope = RegistryOwner | "all";
/** Independently keyed kinds stored as one JSON file per record. */
export const registryKinds = [
  "capabilities",
  "runtime",
  "provenance",
  "invariants",
  "operations",
  "ui",
] as const;
/** Record collection identity. */
export type RegistryKind = (typeof registryKinds)[number];
/** Raw record passed to the existing strict semantic parsers. */
export type RegistryRecord = Record<string, unknown>;
/** Shared baseline and compatibility schema metadata. */
export interface RegistryMetadata {
  readonly schemaVersion: 1;
  readonly baselineCommit: string;
  readonly baselineTag: string;
  readonly placeholderSuites: readonly string[];
}
/** Application-local activation and command registry configuration. */
export interface RegistryApplication {
  readonly suite: RegistryOwner;
  readonly active: boolean;
  readonly commands: null | Readonly<{ module: string; export: string }>;
}
/** One record's storage ownership, independent of historical delivery-slice metadata. */
export interface OwnedRegistryRecord {
  readonly legacyOrder: number;
  readonly filenameOrder: number;
  readonly owner: RegistryOwner;
  readonly kind: RegistryKind;
  readonly record: RegistryRecord;
}
/** Complete deterministic canonical registry. */
export interface InventoryRegistry {
  readonly metadata: RegistryMetadata;
  readonly applications: readonly RegistryApplication[];
  readonly records: readonly OwnedRegistryRecord[];
}
/** Injectable UTF-8 storage boundary. */
export type RegistryReader = (path: string) => Promise<string>;

/** Reads repository-local UTF-8 text. @param path - Record path. @returns File contents. */
export async function readRegistryText(path: string): Promise<string> {
  return readFile(path, "utf8");
}

/** Lists files recursively while rejecting symlinked registry entries. @param root - Registry directory. @returns Relative regular-file paths. */
export async function listRegistryFiles(root: string): Promise<readonly string[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error("Registry symlinks are not supported.");
    if (entry.isFile()) {
      const absolute = join(entry.parentPath, entry.name);
      files.push(relative(root, absolute));
    }
  }
  return files.sort();
}

/** Selects physical source ownership without reclassifying historical semantic records. @param path - Runtime source path. @returns Storage owner. */
export function sourceRegistryOwner(path: string): RegistryOwner {
  if (
    path.startsWith("apps/office/src/sw/") ||
    path === "apps/office/src/test/wrtsh-test-helpers.ts"
  )
    return "writer";
  if (path.startsWith("apps/office/src/sc/")) return "calc";
  return "shared";
}

/** Determines the stable filename key for a record kind. @param kind - Collection. @param record - Record body. @returns Canonical relative filename. */
export function registryRecordKey(kind: RegistryKind, record: RegistryRecord): string {
  const field =
    kind === "capabilities"
      ? "capabilityId"
      : kind === "runtime"
        ? "path"
        : kind === "provenance"
          ? "localPath"
          : "id";
  const key = record[field];
  if (typeof key !== "string" || key.length === 0)
    throw new Error(`Registry ${kind} requires ${field}.`);
  if (
    key.includes("\\") ||
    key
      .split("/")
      .some(
        /** Rejects traversal segments. @param segment - Filename segment. @returns Whether invalid. */ (
          segment,
        ) => segment === ".." || segment === "." || segment === "",
      )
  )
    throw new Error(`Invalid registry record key: ${key}`);
  if (kind === "runtime" || kind === "provenance") {
    if (!key.startsWith("apps/office/src/"))
      throw new Error(`Invalid registry source path: ${key}`);
    return `${key.slice("apps/office/src/".length)}.json`;
  }
  if (!/^[A-Za-z0-9._-]+$/u.test(key)) throw new Error(`Invalid registry identity key: ${key}`);
  return `${key}.json`;
}

/** Loads all owned records, rejecting misplaced files and inconsistent baseline envelopes. @param root - Registry directory. @param readText - Text boundary. @param listFiles - Directory boundary. @returns Complete raw registry. */
export async function loadInventoryRegistry(
  root = "docs/program/registry",
  readText: RegistryReader = readRegistryText,
  listFiles: (root: string) => Promise<readonly string[]> = listRegistryFiles,
): Promise<InventoryRegistry> {
  const metadata = JSON.parse(await readText(join(root, "manifest.json"))) as RegistryMetadata;
  if (
    metadata.schemaVersion !== 1 ||
    typeof metadata.baselineCommit !== "string" ||
    typeof metadata.baselineTag !== "string" ||
    !Array.isArray(metadata.placeholderSuites)
  )
    throw new Error("Invalid inventory registry metadata.");
  const applications: RegistryApplication[] = [];
  for (const owner of registryOwners) {
    const application = JSON.parse(
      await readText(join(root, owner, "application.json")),
    ) as RegistryApplication;
    if (
      application.suite !== owner ||
      typeof application.active !== "boolean" ||
      (application.commands !== null &&
        (typeof application.commands?.module !== "string" ||
          typeof application.commands?.export !== "string"))
    )
      throw new Error(`Invalid registry application: ${owner}`);
    applications.push(application);
  }
  const records: OwnedRegistryRecord[] = [];
  const paths = [...(await listFiles(root))].sort();
  const documents = new Map(
    await Promise.all(
      paths
        .filter(
          /** Reads only JSON records. @param file - Relative path. @returns Whether JSON. */ (
            file,
          ) => file.endsWith(".json"),
        )
        .map(
          /** Reads independent envelopes concurrently. @param file - Relative path. @returns Path and text pair. */ async (
            file,
          ) => [file, await readText(join(root, file))] as const,
        ),
    ),
  );
  for (const file of paths) {
    if (
      !file.endsWith(".json") ||
      file === "manifest.json" ||
      registryOwners.some(
        /** Recognizes owner configuration. @param owner - Candidate owner. @returns Whether metadata. */ (
          owner,
        ) => file === `${owner}/application.json`,
      )
    )
      continue;
    const [owner, kind, ...segments] = file.split("/");
    if (
      !registryOwners.includes(owner as RegistryOwner) ||
      !registryKinds.includes(kind as RegistryKind)
    )
      throw new Error(`Unknown inventory registry file: ${file}`);
    const envelope = JSON.parse(documents.get(file) as string) as {
      baselineCommit: string;
      baselineTag: string;
      record: RegistryRecord;
      legacyOrder?: number;
      filenameOrder?: number;
    };
    if (
      envelope.baselineCommit !== metadata.baselineCommit ||
      envelope.baselineTag !== metadata.baselineTag
    )
      throw new Error(`Registry baseline mismatch: ${file}`);
    for (const order of [envelope.legacyOrder, envelope.filenameOrder]) {
      if (
        order !== undefined &&
        (!Number.isSafeInteger(order) || order < 0 || kind !== "provenance")
      )
        throw new Error(`Invalid registry compatibility order: ${file}`);
    }
    if (!envelope.record || typeof envelope.record !== "object" || Array.isArray(envelope.record))
      throw new Error(`Invalid inventory registry record: ${file}`);
    if (segments.join("/") !== registryRecordKey(kind as RegistryKind, envelope.record))
      throw new Error(`Registry record filename mismatch: ${file}`);
    const path =
      kind === "runtime"
        ? envelope.record.path
        : kind === "provenance"
          ? envelope.record.localPath
          : kind === "operations"
            ? envelope.record.modulePath
            : kind === "invariants"
              ? (envelope.record.local as { path?: string } | undefined)?.path
              : undefined;
    if (typeof path === "string" && sourceRegistryOwner(path) !== owner)
      throw new Error(`Registry source owner mismatch: ${file}`);
    if (kind === "runtime" && owner !== "shared" && envelope.record.suite !== owner)
      throw new Error(`Registry runtime suite mismatch: ${file}`);
    if (kind === "capabilities" && envelope.record.suite !== owner)
      throw new Error(`Registry capability owner mismatch: ${file}`);
    records.push({
      legacyOrder: envelope.legacyOrder ?? Number.MAX_SAFE_INTEGER,
      filenameOrder: envelope.filenameOrder ?? Number.MAX_SAFE_INTEGER,
      owner: owner as RegistryOwner,
      kind: kind as RegistryKind,
      record: envelope.record,
    });
  }
  return { metadata, applications, records };
}

/** Selects a sorted collection across owners or for one application. @param registry - Loaded registry. @param kind - Collection. @param scope - Requested owner. @returns Raw records sorted by immutable key. */
export function selectRegistryRecords(
  registry: InventoryRegistry,
  kind: RegistryKind,
  scope: RegistryScope = "all",
): RegistryRecord[] {
  return registry.records
    .filter(
      /** Selects a collection and optional owner. @param item - Owned record. @returns Whether selected. */ (
        item,
      ) => item.kind === kind && (scope === "all" || item.owner === scope),
    )
    .sort(
      /** Preserves published order and orders new additions by immutable key. @param left - First record. @param right - Second record. @returns Order comparison. */ (
        left,
        right,
      ) =>
        left.legacyOrder - right.legacyOrder ||
        compareRegistryKeys(kind, left.record, right.record),
    )
    .map(
      /** Extracts the unmodified record. @param item - Owned record. @returns Original body. */ (
        item,
      ) => item.record,
    );
}

/** Compares immutable keys with portable code-point ordering. @param kind - Collection. @param left - First record. @param right - Second record. @returns Lexical comparison. */
function compareRegistryKeys(
  kind: RegistryKind,
  left: RegistryRecord,
  right: RegistryRecord,
): number {
  const first = registryRecordKey(kind, left);
  const second = registryRecordKey(kind, right);
  return first < second ? -1 : first > second ? 1 : 0;
}

/** Projects original manifest shapes without modifying any record field. @param registry - Canonical registry. @returns Compatibility data keyed by historical path. */
export function projectRegistryViews(registry: InventoryRegistry): Record<string, unknown> {
  const { baselineCommit, baselineTag } = registry.metadata;
  const baseline = { baselineCommit, baselineTag };
  const inactive = registry.metadata.placeholderSuites.filter(
    /** Retains applications still explicitly inactive. @param suite - Legacy placeholder. @returns Whether inactive. */ (
      suite,
    ) =>
      !registry.applications.some(
        /** Finds an active application. @param app - Application metadata. @returns Whether activated. */ (
          app,
        ) => app.suite === suite && app.active,
      ),
  );
  return {
    "docs/program/parity/writer-command-slice.json": {
      schemaVersion: 6,
      ...baseline,
      records: selectRegistryRecords(registry, "capabilities", "writer"),
    },
    "docs/program/parity/runtime-inventory.json": {
      schemaVersion: 3,
      modules: selectRegistryRecords(registry, "runtime"),
      internalOperations: selectRegistryRecords(registry, "operations"),
      uiBehaviors: selectRegistryRecords(registry, "ui"),
      placeholderSuites: inactive,
    },
    "docs/program/source-provenance.json": {
      schemaVersion: 3,
      ...baseline,
      filenameDivergences: registry.records
        .filter(
          /** Finds independently keyed filename explanations. @param item - Owned record. @returns Whether present. */ (
            item,
          ) => item.kind === "provenance" && item.record.filenameDivergence !== undefined,
        )
        .sort(
          /** Preserves legacy order and sorts new explanations by immutable module path. @param left - First record. @param right - Second record. @returns Order comparison. */ (
            left,
            right,
          ) =>
            left.filenameOrder - right.filenameOrder ||
            compareRegistryKeys("provenance", left.record, right.record),
        )
        .map(
          /** Extracts the retained explanation. @param item - Owned record. @returns Explanation. */ (
            item,
          ) => item.record.filenameDivergence,
        ),
      entries: selectRegistryRecords(registry, "provenance").map(
        /** Removes storage-only filename metadata from the original entry shape. @param entry - Stored entry. @returns Original source entry. */ (
          entry,
        ) => {
          const result = { ...entry };
          delete result.filenameDivergence;
          return result;
        },
      ),
    },
    "docs/program/parity/upstream-invariants.json": {
      ...baseline,
      entries: selectRegistryRecords(registry, "invariants"),
      schemaVersion: 1,
    },
  };
}

/** Reads a generated historical view directly from canonical records. @param path - Historical manifest path. @returns Canonical JSON or ordinary text. */
export async function readInventoryCompatibilityText(path: string): Promise<string> {
  if (
    [
      "docs/program/parity/writer-command-slice.json",
      "docs/program/parity/runtime-inventory.json",
      "docs/program/source-provenance.json",
      "docs/program/parity/upstream-invariants.json",
    ].includes(path)
  ) {
    const views = projectRegistryViews(await loadInventoryRegistry());
    return `${JSON.stringify(views[path], null, 2)}\n`;
  }
  return readRegistryText(path);
}
