/**
 * @fileoverview Validates complete file-level provenance for the authored browser runtime against the pinned LibreOffice source tree.
 */

import { access, readdir, readFile } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Declares the current strict JSON schema version for local source provenance. */
export const SOURCE_PROVENANCE_SCHEMA_VERSION = 1;

/** Describes one browser module with a concrete LibreOffice counterpart. */
export interface MappedSourceProvenanceEntry {
  /** Repository-relative authored runtime module path. */
  readonly localPath: string;
  /** Identifies a concrete source or configuration module present in the pinned LibreOffice checkout. */
  readonly status: "mapped";
  /** Pinned LibreOffice-relative counterpart path. */
  readonly upstreamPath: string;
}

/** Describes a browser-runtime module that intentionally cannot be a TypeScript reimplementation of one LibreOffice file. */
export interface BrowserOnlySourceProvenanceEntry {
  /** Repository-relative authored runtime module path. */
  readonly localPath: string;
  /** Requires an auditable explanation instead of pretending that a native module has been implemented. */
  readonly status: "browser-only";
  /** Detailed browser-environment reason that rules out a direct source-file counterpart. */
  readonly rationale: string;
}

/** Defines one exhaustive authored runtime source mapping. */
export type SourceProvenanceEntry = MappedSourceProvenanceEntry | BrowserOnlySourceProvenanceEntry;

/** Documents one intentional local filename difference from its concrete upstream mapped counterpart. */
export interface FilenameDivergence {
  /** Local mapped runtime module whose filename intentionally differs from the upstream filename. */
  readonly localPath: string;
  /** Specific architectural reason the local filename cannot or should not equal its upstream counterpart. */
  readonly rationale: string;
}

/** Defines the pinned baseline identity and exhaustive runtime mapping set. */
export interface SourceProvenanceManifest {
  /** Pinned LibreOffice core commit used to resolve mapped upstream paths. */
  readonly baselineCommit: string;
  /** Pinned annotated LibreOffice release tag used to resolve mapped upstream paths. */
  readonly baselineTag: string;
  /** Exactly one mapping or explicit browser-only exception for every authored runtime module. */
  readonly entries: readonly SourceProvenanceEntry[];
  /** Exactly one reviewed explanation for every mapped local/upstream filename divergence. */
  readonly filenameDivergences: readonly FilenameDivergence[];
  /** Strict source-provenance JSON schema version. */
  readonly schemaVersion: typeof SOURCE_PROVENANCE_SCHEMA_VERSION;
}

/** Summarizes a successful exhaustive source-provenance validation. */
export interface SourceProvenanceReport {
  /** Number of explicit browser-only module exceptions. */
  readonly browserOnlyCount: number;
  /** Number of concrete LibreOffice file mappings. */
  readonly mappedCount: number;
  /** Number of authored runtime modules accounted for by the manifest. */
  readonly moduleCount: number;
}

/**
 * Parses a strict source-provenance manifest and checks its declared baseline identity.
 *
 * @param sourceText - UTF-8 JSON text from the authored provenance manifest.
 * @param baseline - Pinned LibreOffice identity read from the project baseline contract.
 * @returns A strict immutable manifest ready for filesystem validation.
 * @throws {Error} When JSON, schema, baseline identity, or an entry is malformed.
 */
export function parseSourceProvenanceManifest(
  sourceText: string,
  baseline: Readonly<{ commit: string; tag: string }>,
): SourceProvenanceManifest {
  let candidate: unknown;
  try {
    candidate = JSON.parse(sourceText) as unknown;
  } catch {
    throw new Error("Source provenance manifest must contain valid JSON.");
  }
  if (!isRecord(candidate)) throw new Error("Source provenance manifest must be an object.");
  if (candidate.schemaVersion !== SOURCE_PROVENANCE_SCHEMA_VERSION)
    throw new Error(`Source provenance schemaVersion must be ${SOURCE_PROVENANCE_SCHEMA_VERSION}.`);
  const baselineCommit = requireString(candidate, "baselineCommit");
  const baselineTag = requireString(candidate, "baselineTag");
  if (baselineCommit !== baseline.commit)
    throw new Error("Source provenance baselineCommit does not match the pinned baseline.");
  if (baselineTag !== baseline.tag)
    throw new Error("Source provenance baselineTag does not match the pinned baseline.");
  if (!Array.isArray(candidate.entries) || candidate.entries.length === 0)
    throw new Error("Source provenance entries must be a non-empty array.");
  const entries = candidate.entries.map(
    /** Parses one entry while retaining deterministic malformed-entry diagnostics. @param entry - Unknown JSON entry. @param index - Zero-based entry index. @returns Strict provenance entry. */
    function parseEntryAtIndex(entry: unknown, index: number): SourceProvenanceEntry {
      return parseSourceProvenanceEntry(entry, index);
    },
  );
  const filenameDivergences = parseFilenameDivergences(candidate.filenameDivergences);
  return {
    baselineCommit,
    baselineTag,
    entries,
    filenameDivergences,
    schemaVersion: SOURCE_PROVENANCE_SCHEMA_VERSION,
  };
}

/**
 * Validates a manifest against the actual runtime tree and a concrete upstream-path resolver.
 *
 * @param manifest - Strict source-provenance manifest to validate without mutation.
 * @param runtimeModulePaths - Deterministically collected repository-relative runtime module paths.
 * @param upstreamPathExists - Async resolver for paths beneath the pinned LibreOffice checkout.
 * @returns Counts for the fully accounted current browser runtime.
 * @throws {Error} When a runtime module is omitted, duplicated, stale, or mapped to a missing upstream file.
 */
export async function validateSourceProvenanceManifest(
  manifest: SourceProvenanceManifest,
  runtimeModulePaths: readonly string[],
  upstreamPathExists: (upstreamPath: string) => Promise<boolean>,
): Promise<SourceProvenanceReport> {
  const manifestPaths = manifest.entries.map(
    /** Extracts one local provenance path for duplicate and exhaustiveness validation. @param entry - Strict provenance entry. @returns Its repository-relative local path. */
    function selectLocalPath(entry): string {
      return entry.localPath;
    },
  );
  assertUnique(manifestPaths, "Source provenance localPath");
  assertUnique(runtimeModulePaths, "Collected runtime module path");
  const expected = new Set(runtimeModulePaths);
  const actual = new Set(manifestPaths);
  const missing = runtimeModulePaths.filter(
    /** Identifies an authored module omitted by the manifest. @param path - Collected runtime path. @returns True only when absent from the manifest. */
    function isMissing(path): boolean {
      return !actual.has(path);
    },
  );
  const stale = manifestPaths.filter(
    /** Identifies an entry that no longer corresponds to an authored runtime module. @param path - Manifest path. @returns True only when absent from the collected runtime tree. */
    function isStale(path): boolean {
      return !expected.has(path);
    },
  );
  if (missing.length > 0)
    throw new Error(`Source provenance omits runtime modules: ${missing.join(", ")}.`);
  if (stale.length > 0)
    throw new Error(`Source provenance contains stale modules: ${stale.join(", ")}.`);
  for (const entry of manifest.entries) {
    if (entry.status === "mapped" && !(await upstreamPathExists(entry.upstreamPath)))
      throw new Error(`Source provenance upstream path does not exist: ${entry.upstreamPath}.`);
  }
  const expectedDivergences = manifest.entries
    .filter(
      /** Retains mapped modules whose portable basename differs from the pinned upstream source basename. @param entry - Provenance entry to compare. @returns True only for an intentional filename divergence candidate. */
      function hasFilenameDivergence(entry): entry is MappedSourceProvenanceEntry {
        return (
          entry.status === "mapped" &&
          getFilenameStem(entry.localPath) !== getFilenameStem(entry.upstreamPath)
        );
      },
    )
    .map(
      /** Selects one local path that requires exactly one filename-divergence record. @param entry - Mapped divergent module. @returns Its local module path. */
      function selectDivergentLocalPath(entry): string {
        return entry.localPath;
      },
    );
  const documentedDivergences = manifest.filenameDivergences.map(
    /** Selects one documented divergent local path. @param divergence - Reviewed divergence entry. @returns Its local module path. */
    function selectDocumentedDivergencePath(divergence): string {
      return divergence.localPath;
    },
  );
  assertUnique(documentedDivergences, "Source provenance filenameDivergence localPath");
  assertSamePaths(
    expectedDivergences,
    documentedDivergences,
    "Source provenance filename divergences",
  );
  return {
    browserOnlyCount: manifest.entries.filter(
      /** Identifies explicit browser-only exceptions for reporting. @param entry - Strict provenance entry. @returns True only for browser-only entries. */
      function isBrowserOnly(entry): boolean {
        return entry.status === "browser-only";
      },
    ).length,
    mappedCount: manifest.entries.filter(
      /** Identifies concrete upstream mappings for reporting. @param entry - Strict provenance entry. @returns True only for mapped entries. */
      function isMapped(entry): boolean {
        return entry.status === "mapped";
      },
    ).length,
    moduleCount: runtimeModulePaths.length,
  };
}

/**
 * Collects every current non-test TypeScript runtime module beneath the browser application source root.
 *
 * @param repositoryRoot - Absolute repository root containing the application source tree.
 * @returns Deterministically sorted repository-relative authored runtime module paths.
 */
export async function collectRuntimeModulePaths(
  repositoryRoot: string,
): Promise<readonly string[]> {
  const sourceRoot = resolve(repositoryRoot, "apps/office/src");
  const files = await collectRuntimeModuleFiles(sourceRoot);
  return files.map(
    /** Converts one absolute source path to portable repository-relative slash form. @param filePath - Absolute authored source path. @returns Repository-relative portable module path. */
    function makeRepositoryRelative(filePath): string {
      return relative(repositoryRoot, filePath).split("\\").join("/");
    },
  );
}

/**
 * Recursively collects non-test TypeScript runtime files in lexical order.
 *
 * @param directoryPath - Absolute source directory to inspect without mutation.
 * @returns Deterministically sorted absolute runtime module paths.
 */
async function collectRuntimeModuleFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files: string[] = [];
  entries.sort(
    /** Orders source entries by lexical basename. @param left - First directory entry. @param right - Second directory entry. @returns Locale comparison result. */
    function compareEntries(left, right): number {
      return left.name.localeCompare(right.name);
    },
  );
  for (const entry of entries) {
    const entryPath = resolve(directoryPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "test") files.push(...(await collectRuntimeModuleFiles(entryPath)));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.includes(".test.")
    ) {
      files.push(entryPath);
    }
  }
  return files;
}

/** Parses one strict source-provenance entry. @param candidate - Unknown JSON entry. @param index - Zero-based entry index. @returns Strict mapping or browser-only exception. */
function parseSourceProvenanceEntry(candidate: unknown, index: number): SourceProvenanceEntry {
  if (!isRecord(candidate))
    throw new Error(`Source provenance entries[${index}] must be an object.`);
  const localPath = requireRuntimeModulePath(candidate, "localPath");
  if (candidate.status === "mapped")
    return { localPath, status: "mapped", upstreamPath: requireString(candidate, "upstreamPath") };
  if (candidate.status === "browser-only") {
    const rationale = requireString(candidate, "rationale");
    if (rationale.length < 80)
      throw new Error(
        `Source provenance browser-only rationale for ${localPath} must be at least 80 characters.`,
      );
    return { localPath, rationale, status: "browser-only" };
  }
  throw new Error(`Source provenance entries[${index}] has an invalid status.`);
}

/** Parses the complete reviewed filename-divergence set from one strict manifest candidate. @param candidate - Unknown manifest field. @returns Strict filename-divergence records. @throws {Error} When records are absent or malformed. */
function parseFilenameDivergences(candidate: unknown): readonly FilenameDivergence[] {
  if (!Array.isArray(candidate))
    throw new Error("Source provenance filenameDivergences must be an array.");
  return candidate.map(
    /** Parses one reviewed divergence with deterministic index diagnostics. @param divergence - Unknown divergence record. @param index - Zero-based record index. @returns Strict reviewed divergence. */
    function parseDivergenceAtIndex(divergence: unknown, index: number): FilenameDivergence {
      if (!isRecord(divergence))
        throw new Error(`Source provenance filenameDivergences[${index}] must be an object.`);
      const localPath = requireRuntimeModulePath(divergence, "localPath");
      const rationale = requireString(divergence, "rationale");
      if (rationale.length < 80)
        throw new Error(
          `Source provenance filename divergence rationale for ${localPath} must be at least 80 characters.`,
        );
      return { localPath, rationale };
    },
  );
}

/** Validates a repository-relative authored runtime module path. @param record - Parsed entry object. @param field - Required path field name. @returns Strict source path. */
function requireRuntimeModulePath(record: Record<string, unknown>, field: string): string {
  const value = requireString(record, field);
  if (!value.startsWith("apps/office/src/") || (!value.endsWith(".ts") && !value.endsWith(".tsx")))
    throw new Error(
      `Source provenance ${field} must name an apps/office/src TypeScript runtime module.`,
    );
  return value;
}

/** Reads a required non-empty string field. @param record - Parsed object. @param field - Required string field. @returns Trimmed non-empty string. */
function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`Source provenance ${field} must be a non-empty string.`);
  return value;
}

/** Checks whether an unknown value is a non-null object. @param value - Unknown candidate. @returns True only for plain object-like values. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Ensures each supplied path appears once. @param paths - Paths requiring uniqueness. @param description - Diagnostic label. @returns Nothing; duplicates throw. */
function assertUnique(paths: readonly string[], description: string): void {
  if (new Set(paths).size !== paths.length)
    throw new Error(`${description} values must be unique.`);
}

/** Compares two path sets and rejects missing or stale records with an explicit diagnostic. @param expectedPaths - Determined paths that must be documented. @param actualPaths - Declared paths to validate. @param description - Human-readable diagnostic prefix. @returns Nothing; a mismatch throws. */
function assertSamePaths(
  expectedPaths: readonly string[],
  actualPaths: readonly string[],
  description: string,
): void {
  const expected = new Set(expectedPaths);
  const actual = new Set(actualPaths);
  const missing = expectedPaths.filter(
    /** Identifies a computed divergence omitted from documentation. @param path - Computed local path. @returns True only when absent from declarations. */
    function isMissing(path): boolean {
      return !actual.has(path);
    },
  );
  const stale = actualPaths.filter(
    /** Identifies a declared divergence no longer computed from a mapped entry. @param path - Declared local path. @returns True only when no longer divergent. */
    function isStale(path): boolean {
      return !expected.has(path);
    },
  );
  if (missing.length > 0 || stale.length > 0)
    throw new Error(
      `${description} must exactly match mapped basename differences; missing: ${missing.join(", ") || "none"}; stale: ${stale.join(", ") || "none"}.`,
    );
}

/** Converts a source or configuration path to its case-normalized extensionless basename. @param filePath - Local or upstream source path. @returns Comparable lowercase filename stem. */
function getFilenameStem(filePath: string): string {
  return basename(filePath)
    .replace(/\.[^.]+$/u, "")
    .toLowerCase();
}

/** Executes the repository-local provenance check only when this module is the TypeScript CLI entrypoint. @returns A promise resolved after a successful check. */
async function main(): Promise<void> {
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const baseline = JSON.parse(
    await readFile(resolve(repositoryRoot, "docs/program/libreoffice-baseline.json"), "utf8"),
  ) as { commit: string; tag: string };
  const manifest = parseSourceProvenanceManifest(
    await readFile(resolve(repositoryRoot, "docs/program/source-provenance.json"), "utf8"),
    baseline,
  );
  const report = await validateSourceProvenanceManifest(
    manifest,
    await collectRuntimeModulePaths(repositoryRoot),
    /** Resolves one declared upstream file only within the pinned local LibreOffice checkout. @param upstreamPath - LibreOffice-relative source/configuration path. @returns True only when the pinned file exists. */
    async function upstreamPathExists(upstreamPath: string): Promise<boolean> {
      try {
        await access(resolve(repositoryRoot, "vendor/libreoffice-reference", upstreamPath));
        return true;
      } catch {
        return false;
      }
    },
  );
  console.log(
    `Source provenance check passed for ${report.moduleCount} runtime modules (${report.mappedCount} mapped, ${report.browserOnlyCount} browser-only).`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
