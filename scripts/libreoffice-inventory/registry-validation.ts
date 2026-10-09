/** @fileoverview Validates global registry identities and app-scoped parity evidence without shared allocation state. */
import {
  parseSourceProvenanceManifest,
  validateSourceProvenanceManifest,
  type SourceProvenanceManifest,
  type SourceProvenanceRuntimeModule,
} from "../check-source-provenance";
import { parseBaselineManifest } from "./manifest";
import {
  parseParityMappingManifest,
  validateParityMappingEvidence,
  type ParityMappingManifest,
} from "./parity-mappings";
import {
  parseRuntimeInventoryManifest,
  validateRuntimeInventory,
  type RuntimeInventoryManifest,
  type RuntimeCommandRecord,
} from "./runtime-inventory";
import {
  projectRegistryViews,
  selectRegistryRecords,
  sourceRegistryOwner,
  type InventoryRegistry,
  type RegistryScope,
} from "./registry-storage";
import {
  validateUpstreamInvariantEvidence,
  type UpstreamInvariantManifest,
} from "./upstream-invariants";
import { isRecord } from "./parity-mapping-support";

/** Strict parsed registry manifests used by evidence checks. */
export interface ParsedRegistry {
  readonly capabilities: ParityMappingManifest;
  readonly runtime: RuntimeInventoryManifest;
  readonly provenance: SourceProvenanceManifest;
  readonly invariants: UpstreamInvariantManifest;
}

/** Rejects repeated identities independently of physical record placement. @param values - Global keys. @param label - Diagnostic name. @returns Nothing after validation. */
function assertUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate registry ${label}.`);
}

/** Parses strict evidence-bearing invariants without a central application catalog. @param value - Raw compatibility view. @returns Strict manifest. */
export function parseRegistryInvariants(value: unknown): UpstreamInvariantManifest {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.entries))
    throw new Error("Invalid registry invariant manifest.");
  for (const entry of value.entries) {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" ||
      entry.id.trim().length === 0 ||
      !["command-url", "default", "enum", "pool-range", "which-id"].includes(
        entry.kind as string,
      ) ||
      !["none", "P"].includes(entry.divergenceClass as string)
    )
      throw new Error("Invalid registry invariant record.");
    for (const side of [entry.local, entry.upstream]) {
      if (
        !isRecord(side) ||
        typeof side.path !== "string" ||
        !/^[A-Za-z0-9_./-]+$/u.test(side.path) ||
        side.path.startsWith("/") ||
        side.path.split("/").includes("..") ||
        typeof side.marker !== "string" ||
        side.marker.trim().length === 0 ||
        (typeof side.value !== "string" && typeof side.value !== "number")
      )
        throw new Error(`Invalid registry invariant reference: ${entry.id}`);
    }
  }
  const result = value as unknown as UpstreamInvariantManifest;
  assertUnique(
    result.entries.map(
      /** Selects immutable invariant identity. @param entry - Invariant. @returns Identity. */ (
        entry,
      ) => entry.id,
    ),
    "invariant IDs",
  );
  return result;
}

/** Proves global uniqueness and structural consistency before selecting application evidence. @param registry - Complete canonical registry. @param baselineText - Pinned baseline JSON. @returns Strict global manifests. */
export function parseInventoryRegistry(
  registry: InventoryRegistry,
  baselineText: string,
): ParsedRegistry {
  const baseline = parseBaselineManifest(baselineText);
  const views = projectRegistryViews(registry);
  const capabilities = parseParityMappingManifest(
    JSON.stringify({
      schemaVersion: 6,
      baselineCommit: registry.metadata.baselineCommit,
      baselineTag: registry.metadata.baselineTag,
      records: selectRegistryRecords(registry, "capabilities"),
    }),
    baseline,
  );
  const runtime = parseRuntimeInventoryManifest(
    JSON.stringify(views["docs/program/parity/runtime-inventory.json"]),
  );
  const provenance = parseSourceProvenanceManifest(
    JSON.stringify(views["docs/program/source-provenance.json"]),
    { commit: baseline.commit, tag: baseline.tag },
  );
  const invariants = parseRegistryInvariants(views["docs/program/parity/upstream-invariants.json"]);
  assertUnique(
    capabilities.records.map(
      /** Keys an atomic operation within its owning contract. @param record - Capability. @returns Normalized contract key. */ (
        record,
      ) =>
        JSON.stringify(
          [record.suite, record.subsystem, record.aspect, record.atomicOperation].map(
            /** Normalizes spelling without folding different application contracts together. @param value - Key part. @returns Normalized key part. */ (
              value,
            ) => value.trim().replace(/\s+/gu, " ").toLowerCase(),
          ),
        ),
    ),
    "operation contracts",
  );
  assertUnique(
    runtime.internalOperations.map(
      /** Keys an exported mutation helper globally. @param record - Operation. @returns Qualified symbol. */ (
        record,
      ) => `${record.modulePath}#${record.symbol}`,
    ),
    "operation symbols",
  );
  const paths = runtime.modules.map(
    /** Selects exact runtime path. @param record - Runtime record. @returns Source path. */ (
      record,
    ) => record.path,
  );
  const provenancePaths = provenance.entries
    .map(
      /** Selects exact source-provenance path. @param record - Provenance record. @returns Source path. */ (
        record,
      ) => record.localPath,
    )
    .sort();
  assertUnique(provenancePaths, "provenance paths");
  if (JSON.stringify(paths) !== JSON.stringify(provenancePaths))
    throw new Error("Registry runtime/provenance coverage mismatch.");
  const known = new Set(
    capabilities.records.map(
      /** Selects stable capability identity. @param record - Capability. @returns Identity. */ (
        record,
      ) => record.capabilityId,
    ),
  );
  const references = [
    ...runtime.modules.flatMap(
      /** Collects module references. @param record - Runtime module. @returns Capability identities. */ (
        record,
      ) => record.capabilityIds,
    ),
    ...runtime.internalOperations.map(
      /** Collects operation identity. @param record - Operation. @returns Capability identity. */ (
        record,
      ) => record.capabilityId,
    ),
    ...runtime.uiBehaviors.map(
      /** Collects UI identity. @param record - Behavior. @returns Capability identity. */ (
        record,
      ) => record.capabilityId,
    ),
  ];
  for (const identity of references)
    if (!known.has(identity)) throw new Error(`Unknown registry capability: ${identity}`);
  for (const app of registry.applications) {
    if (
      !app.active &&
      registry.records.some(
        /** Detects newly authored implementation for an inactive app. @param record - Owned record. @returns Whether owned by this app. */ (
          record,
        ) => record.owner === app.suite,
      )
    )
      throw new Error(`Registry application ${app.suite} must be activated before adding records.`);
  }
  return { capabilities, runtime, provenance, invariants };
}

/** Determines whether evidence belongs to this app or its shared dependencies. @param owner - Physical record owner. @param scope - Requested scope. @returns Whether evidence is included. */
export function includesRegistryOwner(owner: string, scope: RegistryScope): boolean {
  return scope === "all" || owner === scope || owner === "shared";
}

/** Resolves validated application-local command registry metadata through an injectable module loader. @param registry - Canonical registry. @param scope - App scope. @param loadModule - Repository module boundary. @returns Command records with application namespaces. */
export async function loadRegistryCommands(
  registry: InventoryRegistry,
  scope: RegistryScope,
  loadModule: (path: string) => Promise<Record<string, unknown>>,
): Promise<RuntimeCommandRecord[]> {
  const commands: RuntimeCommandRecord[] = [];
  for (const app of registry.applications) {
    if (!app.active || app.commands === null || !includesRegistryOwner(app.suite, scope)) continue;
    const { module, export: symbol } = app.commands;
    if (
      !module.startsWith("apps/office/src/") ||
      module
        .split("/")
        .some(
          /** Rejects path traversal. @param part - Path segment. @returns Whether unsafe. */ (
            part,
          ) => part === ".." || part === "." || part === "",
        ) ||
      module.includes("\\") ||
      sourceRegistryOwner(module) !== app.suite
    )
      throw new Error(`Invalid registry command module: ${module}`);
    const exported = (await loadModule(module))[symbol];
    if (!Array.isArray(exported))
      throw new Error(`Registry command export is not an array: ${symbol}`);
    for (const command of exported) {
      if (
        !isRecord(command) ||
        typeof command.id !== "string" ||
        typeof command.label !== "string" ||
        typeof command.capabilityId !== "string"
      )
        throw new Error(`Invalid registry command export: ${symbol}`);
      commands.push({
        id: command.id,
        label: command.label,
        capabilityId: command.capabilityId,
        suite: app.suite,
      });
    }
  }
  return commands;
}

/** Checks exact discovery globally, then validates evidence for the requested app and shared dependencies. @param registry - Complete canonical registry. @param parsed - Globally parsed manifests. @param scope - Selected app or full suite. @param discovered - Exact runtime source discovery. @param readText - Repository evidence reader. @param commands - Scoped command registries. @param upstreamRoot - Pinned checkout root. @returns Counts and scoped evidence reports. */
export async function validateRegistryEvidence(
  registry: InventoryRegistry,
  parsed: ParsedRegistry,
  scope: RegistryScope,
  discovered: readonly string[],
  readText: (path: string) => Promise<string>,
  commands: readonly RuntimeCommandRecord[],
  upstreamRoot: string,
): Promise<Record<string, unknown>> {
  const authored = parsed.runtime.modules.map(
    /** Selects authored discovery key. @param record - Module. @returns Source path. */ (record) =>
      record.path,
  );
  if (JSON.stringify(authored) !== JSON.stringify([...discovered].sort()))
    throw new Error("Registry does not exactly cover discovered production modules.");
  const selected = registry.records.filter(
    /** Selects scoped owned records. @param record - Owned record. @returns Whether included. */ (
      record,
    ) => includesRegistryOwner(record.owner, scope),
  );
  const selectedRegistry = { ...registry, records: selected };
  const views = projectRegistryViews(selectedRegistry);
  const runtime = parseRuntimeInventoryManifest(
    JSON.stringify(views["docs/program/parity/runtime-inventory.json"]),
  );
  const capabilityIds = new Set(
    parsed.capabilities.records.map(
      /** Selects globally known capabilities, including legacy shared references. @param record - Capability. @returns Identity. */ (
        record,
      ) => record.capabilityId,
    ),
  );
  const mappings = {
    ...parsed.capabilities,
    records: parsed.capabilities.records.filter(
      /** Selects app and shared capability contracts. @param record - Capability. @returns Whether included. */ (
        record,
      ) => includesRegistryOwner(record.suite, scope),
    ),
  };
  const parity = await validateParityMappingEvidence(mappings, readText, {
    local: ".",
    upstream: upstreamRoot,
  });
  const runtimeReport = await validateRuntimeInventory(
    runtime,
    runtime.modules.map(
      /** Selects scoped production paths after global discovery validation. @param record - Module. @returns Source path. */ (
        record,
      ) => record.path,
    ),
    readText,
    commands,
    capabilityIds,
  );
  const provenance = parseSourceProvenanceManifest(
    JSON.stringify(views["docs/program/source-provenance.json"]),
    { commit: registry.metadata.baselineCommit, tag: registry.metadata.baselineTag },
  );
  const provenanceReport = await validateSourceProvenanceManifest(
    provenance,
    runtime.modules as readonly SourceProvenanceRuntimeModule[],
    /** Resolves an upstream reference beneath the pinned checkout. @param path - Evidence path. @returns UTF-8 text. */ (
      path,
    ) =>
      readText(
        path.startsWith("apps/") || path.startsWith("vendor/") ? path : `${upstreamRoot}/${path}`,
      ),
  );
  const invariants = parseRegistryInvariants(views["docs/program/parity/upstream-invariants.json"]);
  await validateUpstreamInvariantEvidence(
    invariants,
    readText,
    /** Reads only pinned upstream evidence. @param path - Upstream-relative path. @returns UTF-8 text. */ (
      path,
    ) => readText(`${upstreamRoot}/${path}`),
  );
  return {
    scope,
    applications: registry.applications,
    capabilityCount: mappings.records.length,
    moduleCount: runtime.modules.length,
    invariantCount: invariants.entries.length,
    globalRecordCount: registry.records.length,
    parity,
    provenance: provenanceReport,
    runtime: runtimeReport,
  };
}
