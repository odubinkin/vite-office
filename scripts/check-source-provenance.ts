/**
 * @fileoverview Validates responsibility- and symbol-level provenance for the complete authored browser runtime.
 */

import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Strict source-provenance JSON schema version. */
export const SOURCE_PROVENANCE_SCHEMA_VERSION = 2;

/** Runtime ownership classifications shared with the exhaustive runtime inventory. */
export type SourceProvenanceClassification =
  "browser-adaptation" | "local-infrastructure" | "upstream-mechanism";

/** One exact path and stable source marker used as auditable evidence. */
export interface SourceProvenanceEvidenceReference {
  readonly marker: string;
  readonly path: string;
}

/** Explains an intentional browser or local-infrastructure stack substitution. */
export interface SourceProvenanceStackDivergence {
  readonly kind: "browser-adaptation" | "local-infrastructure";
  readonly rationale: string;
}

/** Describes one runtime module implementing a bounded upstream mechanism. */
export interface MappedSourceProvenanceEntry {
  readonly classification: "upstream-mechanism";
  readonly evidence: Readonly<{
    local: readonly SourceProvenanceEvidenceReference[];
    upstream: readonly SourceProvenanceEvidenceReference[];
  }>;
  readonly localPath: string;
  readonly localSymbols: readonly string[];
  readonly omittedResponsibilities: readonly string[];
  readonly preservedResponsibilities: readonly string[];
  readonly stackDivergence?: SourceProvenanceStackDivergence;
  readonly status: "mapped";
  readonly upstreamPath: string;
  readonly upstreamSymbols: readonly string[];
}

/** Describes a browser adapter or local composition layer with no false upstream file mapping. */
export interface LocalSourceProvenanceEntry {
  readonly classification: "browser-adaptation" | "local-infrastructure";
  readonly evidence: Readonly<{ local: readonly SourceProvenanceEvidenceReference[] }>;
  readonly localPath: string;
  readonly rationale: string;
  readonly responsibilities: readonly string[];
  readonly stackDivergence: SourceProvenanceStackDivergence;
  readonly status: "local-only";
}

/** Defines one exhaustive authored runtime source disposition. */
export type SourceProvenanceEntry = MappedSourceProvenanceEntry | LocalSourceProvenanceEntry;

/** Documents one intentional local filename difference from its mapped upstream counterpart. */
export interface FilenameDivergence {
  readonly localPath: string;
  readonly rationale: string;
}

/** Defines the pinned baseline identity and exhaustive runtime provenance set. */
export interface SourceProvenanceManifest {
  readonly baselineCommit: string;
  readonly baselineTag: string;
  readonly entries: readonly SourceProvenanceEntry[];
  readonly filenameDivergences: readonly FilenameDivergence[];
  readonly schemaVersion: typeof SOURCE_PROVENANCE_SCHEMA_VERSION;
}

/** Minimal runtime inventory input needed to prove classification consistency. */
export interface SourceProvenanceRuntimeModule {
  readonly classification: SourceProvenanceClassification;
  readonly path: string;
}

/** Summarizes successful exhaustive responsibility-level validation. */
export interface SourceProvenanceReport {
  readonly browserAdaptationCount: number;
  readonly localInfrastructureCount: number;
  readonly mappedCount: number;
  readonly moduleCount: number;
}

/**
 * Parses a strict source-provenance manifest scoped to one pinned baseline.
 * @param sourceText - Authored JSON manifest text.
 * @param baseline - Pinned LibreOffice identity.
 * @returns Parsed responsibility-level provenance manifest.
 */
export function parseSourceProvenanceManifest(
  sourceText: string,
  baseline: Readonly<{ commit: string; tag: string }>,
): SourceProvenanceManifest {
  const candidate = parseObject(sourceText);
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
  return {
    baselineCommit,
    baselineTag,
    entries: candidate.entries.map(parseSourceProvenanceEntry),
    filenameDivergences: parseFilenameDivergences(candidate.filenameDivergences),
    schemaVersion: SOURCE_PROVENANCE_SCHEMA_VERSION,
  };
}

/**
 * Validates paths, runtime classifications, exact symbols, evidence markers, and divergences.
 * @param manifest - Parsed provenance manifest.
 * @param runtimeModules - Exhaustive runtime inventory modules.
 * @param readEvidence - Reader for repository and pinned-upstream paths.
 * @returns Counts for the validated exhaustive provenance set.
 */
export async function validateSourceProvenanceManifest(
  manifest: SourceProvenanceManifest,
  runtimeModules: readonly SourceProvenanceRuntimeModule[],
  readEvidence: (path: string) => Promise<string>,
): Promise<SourceProvenanceReport> {
  const manifestPaths = manifest.entries.map(selectEntryPath);
  const runtimePaths = runtimeModules.map(selectRuntimePath);
  assertUnique(manifestPaths, "Source provenance localPath");
  assertUnique(runtimePaths, "Runtime inventory path");
  assertSamePaths(runtimePaths, manifestPaths, "Source provenance runtime coverage");
  const runtimeByPath = new Map(runtimeModules.map(toRuntimePair));
  for (const entry of manifest.entries) {
    const runtimeClassification = runtimeByPath.get(entry.localPath);
    if (runtimeClassification !== entry.classification)
      throw new Error(
        `Source provenance classification mismatch for ${entry.localPath}: ${entry.classification} != ${runtimeClassification}.`,
      );
    const localContents = await readEvidence(entry.localPath);
    await validateEvidence(entry.evidence.local, "local", readEvidence);
    if (entry.status === "mapped") {
      const upstreamContents = await readEvidence(entry.upstreamPath);
      assertSymbolsPresent(entry.localSymbols, localContents, entry.localPath, "local");
      assertSymbolsPresent(entry.upstreamSymbols, upstreamContents, entry.upstreamPath, "upstream");
      if (entry.upstreamSymbols.every(matchesPathBasename(entry.upstreamPath)))
        throw new Error(
          `Source provenance for ${entry.localPath} relies only on upstream basename similarity.`,
        );
      await validateEvidence(entry.evidence.upstream, "upstream", readEvidence);
    }
  }
  validateFilenameDivergences(manifest);
  return {
    browserAdaptationCount: manifest.entries.filter(hasClassification("browser-adaptation")).length,
    localInfrastructureCount: manifest.entries.filter(hasClassification("local-infrastructure"))
      .length,
    mappedCount: manifest.entries.filter(hasClassification("upstream-mechanism")).length,
    moduleCount: runtimeModules.length,
  };
}

/**
 * Collects every current non-test TypeScript runtime module beneath apps/office/src.
 * @param repositoryRoot - Absolute repository root.
 * @returns Sorted repository-relative runtime module paths.
 */
export async function collectRuntimeModulePaths(
  repositoryRoot: string,
): Promise<readonly string[]> {
  const sourceRoot = resolve(repositoryRoot, "apps/office/src");
  const files = await collectRuntimeModuleFiles(sourceRoot);
  return files.map(
    /** Converts one absolute module path to portable repository-relative form. @param filePath - Absolute module path. @returns Repository-relative module path. */
    function makeRepositoryRelative(filePath): string {
      return relative(repositoryRoot, filePath).split("\\").join("/");
    },
  );
}

/**
 * Recursively collects non-test TypeScript runtime files in lexical order.
 * @param directoryPath - Absolute directory to scan.
 * @returns Sorted absolute runtime module paths.
 */
async function collectRuntimeModuleFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files: string[] = [];
  entries.sort(
    /** Orders directory entries by name. @param left - First entry. @param right - Second entry. @returns Lexical comparison result. */
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

/**
 * Parses one strict provenance entry.
 * @param candidate - Unknown entry candidate.
 * @param index - Entry index used in diagnostics.
 * @returns Parsed mapped or local-only entry.
 */
function parseSourceProvenanceEntry(candidate: unknown, index: number): SourceProvenanceEntry {
  if (!isRecord(candidate))
    throw new Error(`Source provenance entries[${index}] must be an object.`);
  const localPath = requireRuntimeModulePath(candidate, "localPath");
  const classification = parseClassification(candidate.classification, localPath);
  if (candidate.status === "mapped") {
    if (classification !== "upstream-mechanism")
      throw new Error(`Mapped source provenance ${localPath} must be an upstream mechanism.`);
    return {
      classification,
      evidence: parseMappedEvidence(candidate.evidence, localPath),
      localPath,
      localSymbols: requireNonEmptyStringArray(candidate, "localSymbols", localPath),
      omittedResponsibilities: requireNonEmptyStringArray(
        candidate,
        "omittedResponsibilities",
        localPath,
      ),
      preservedResponsibilities: requireNonEmptyStringArray(
        candidate,
        "preservedResponsibilities",
        localPath,
      ),
      ...(candidate.stackDivergence === undefined
        ? {}
        : { stackDivergence: parseStackDivergence(candidate.stackDivergence, localPath) }),
      status: "mapped",
      upstreamPath: requireString(candidate, "upstreamPath"),
      upstreamSymbols: requireNonEmptyStringArray(candidate, "upstreamSymbols", localPath),
    };
  }
  if (candidate.status === "local-only") {
    if (classification === "upstream-mechanism")
      throw new Error(`Local-only source provenance ${localPath} cannot be an upstream mechanism.`);
    const rationale = requireString(candidate, "rationale");
    if (rationale.length < 80)
      throw new Error(`Source provenance local-only rationale for ${localPath} is too short.`);
    const stackDivergence = parseStackDivergence(candidate.stackDivergence, localPath);
    if (stackDivergence.kind !== classification)
      throw new Error(
        `Source provenance divergence kind must match ${classification} for ${localPath}.`,
      );
    return {
      classification,
      evidence: parseLocalEvidence(candidate.evidence, localPath),
      localPath,
      rationale,
      responsibilities: requireNonEmptyStringArray(candidate, "responsibilities", localPath),
      stackDivergence,
      status: "local-only",
    };
  }
  throw new Error(`Source provenance entries[${index}] has an invalid status.`);
}

/**
 * Parses a mapped entry evidence object.
 * @param candidate - Unknown evidence object.
 * @param localPath - Owning runtime path.
 * @returns Local and upstream evidence references.
 */
function parseMappedEvidence(
  candidate: unknown,
  localPath: string,
): MappedSourceProvenanceEntry["evidence"] {
  if (!isRecord(candidate))
    throw new Error(`Source provenance evidence for ${localPath} is absent.`);
  return {
    local: parseEvidenceReferences(candidate.local, `${localPath}.evidence.local`),
    upstream: parseEvidenceReferences(candidate.upstream, `${localPath}.evidence.upstream`),
  };
}

/**
 * Parses a local-only entry evidence object.
 * @param candidate - Unknown evidence object.
 * @param localPath - Owning runtime path.
 * @returns Local evidence references.
 */
function parseLocalEvidence(
  candidate: unknown,
  localPath: string,
): LocalSourceProvenanceEntry["evidence"] {
  if (!isRecord(candidate))
    throw new Error(`Source provenance evidence for ${localPath} is absent.`);
  return { local: parseEvidenceReferences(candidate.local, `${localPath}.evidence.local`) };
}

/**
 * Parses non-empty path-and-marker evidence.
 * @param candidate - Unknown reference array.
 * @param location - Diagnostic field location.
 * @returns Parsed evidence references.
 */
function parseEvidenceReferences(
  candidate: unknown,
  location: string,
): readonly SourceProvenanceEvidenceReference[] {
  if (!Array.isArray(candidate) || candidate.length === 0)
    throw new Error(`${location} must be a non-empty array.`);
  return candidate.map(
    /** Parses one evidence reference. @param reference - Unknown reference. @param index - Reference index. @returns Strict path and marker. */
    function parseReference(reference, index) {
      if (!isRecord(reference)) throw new Error(`${location}[${index}] must be an object.`);
      return {
        marker: requireString(reference, "marker"),
        path: requireString(reference, "path"),
      };
    },
  );
}

/**
 * Parses one explicit stack-divergence record.
 * @param candidate - Unknown divergence object.
 * @param localPath - Owning runtime path.
 * @returns Validated divergence record.
 */
function parseStackDivergence(
  candidate: unknown,
  localPath: string,
): SourceProvenanceStackDivergence {
  if (!isRecord(candidate))
    throw new Error(`Source provenance stackDivergence for ${localPath} must be an object.`);
  const kind = candidate.kind;
  if (kind !== "browser-adaptation" && kind !== "local-infrastructure")
    throw new Error(`Source provenance stackDivergence kind is invalid for ${localPath}.`);
  return { kind, rationale: requireString(candidate, "rationale") };
}

/**
 * Parses the reviewed filename-divergence set.
 * @param candidate - Unknown divergence array.
 * @returns Validated filename divergences.
 */
function parseFilenameDivergences(candidate: unknown): readonly FilenameDivergence[] {
  if (!Array.isArray(candidate))
    throw new Error("Source provenance filenameDivergences must be an array.");
  return candidate.map(
    /** Parses one filename divergence. @param divergence - Unknown record. @param index - Record index. @returns Validated divergence. */
    function parseDivergence(divergence, index) {
      if (!isRecord(divergence))
        throw new Error(`Source provenance filenameDivergences[${index}] must be an object.`);
      const localPath = requireRuntimeModulePath(divergence, "localPath");
      const rationale = requireString(divergence, "rationale");
      if (rationale.length < 80)
        throw new Error(
          `Source provenance filename divergence rationale for ${localPath} is too short.`,
        );
      if (!rationale.includes("Stack constraint:"))
        throw new Error(
          `Source provenance filename divergence for ${localPath} must state its stack constraint.`,
        );
      if (/\b(?:convenience|public naming)\b/iu.test(rationale))
        throw new Error(
          `Source provenance filename divergence for ${localPath} cites a TypeScript convenience instead of a stack necessity.`,
        );
      return { localPath, rationale };
    },
  );
}

/**
 * Resolves every evidence reference and verifies its exact marker.
 * @param references - References to validate.
 * @param side - Local or upstream diagnostic side.
 * @param readEvidence - Evidence text reader.
 * @returns Completion after all markers are found.
 */
async function validateEvidence(
  references: readonly SourceProvenanceEvidenceReference[],
  side: "local" | "upstream",
  readEvidence: (path: string) => Promise<string>,
): Promise<void> {
  for (const reference of references) {
    const contents = await readEvidence(reference.path);
    if (!contents.includes(reference.marker))
      throw new Error(
        `Source provenance ${side} evidence marker is absent: ${reference.path} :: ${reference.marker}.`,
      );
  }
}

/**
 * Proves every declared symbol occurs in its declared source.
 * @param symbols - Exact declared symbols.
 * @param contents - Complete source text.
 * @param path - Evidence path used in diagnostics.
 * @param side - Local or upstream diagnostic side.
 * @returns Nothing; missing symbols throw.
 */
function assertSymbolsPresent(
  symbols: readonly string[],
  contents: string,
  path: string,
  side: "local" | "upstream",
): void {
  const missing = symbols.filter(
    /** Finds a symbol absent from the source. @param symbol - Declared symbol. @returns Whether it is absent. */
    function isMissing(symbol): boolean {
      return !contents.includes(symbol);
    },
  );
  if (missing.length > 0)
    throw new Error(
      `Source provenance ${side} symbols are absent from ${path}: ${missing.join(", ")}.`,
    );
}

/**
 * Validates the exact set of mapped basename divergences.
 * @param manifest - Parsed exhaustive manifest.
 * @returns Nothing; an incomplete or stale set throws.
 */
function validateFilenameDivergences(manifest: SourceProvenanceManifest): void {
  const expected = manifest.entries
    .filter(
      /** Retains mapped entries. @param entry - Provenance entry. @returns Whether it is mapped. */
      function isMapped(entry): entry is MappedSourceProvenanceEntry {
        return entry.status === "mapped";
      },
    )
    .filter(
      /** Finds intentional filename differences. @param entry - Mapped entry. @returns Whether basenames differ. */
      function hasDifferentBasename(entry): boolean {
        return getFilenameStem(entry.localPath) !== getFilenameStem(entry.upstreamPath);
      },
    )
    .map(selectEntryPath);
  const actual = manifest.filenameDivergences.map(
    /** Selects a documented divergence path. @param entry - Divergence record. @returns Local path. */
    function selectDivergencePath(entry): string {
      return entry.localPath;
    },
  );
  assertUnique(actual, "Source provenance filenameDivergence localPath");
  assertSamePaths(expected, actual, "Source provenance filename divergences");
}

/**
 * Creates a basename-only symbol predicate.
 * @param path - Upstream source path.
 * @returns Predicate matching its extensionless basename.
 */
function matchesPathBasename(path: string): (symbol: string) => boolean {
  const stem = getFilenameStem(path);
  return /** Compares a symbol with the source basename. @param symbol - Declared symbol. @returns Whether only the basename matches. */ function matches(
    symbol,
  ): boolean {
    return symbol.toLowerCase() === stem;
  };
}

/**
 * Parses a runtime provenance classification.
 * @param candidate - Unknown classification.
 * @param localPath - Owning path for diagnostics.
 * @returns Supported classification.
 */
function parseClassification(
  candidate: unknown,
  localPath: string,
): SourceProvenanceClassification {
  if (
    candidate !== "upstream-mechanism" &&
    candidate !== "browser-adaptation" &&
    candidate !== "local-infrastructure"
  )
    throw new Error(`Source provenance classification is invalid for ${localPath}.`);
  return candidate;
}

/**
 * Requires a runtime module path.
 * @param record - Parsed object.
 * @param field - Path field name.
 * @returns Validated runtime path.
 */
function requireRuntimeModulePath(record: Record<string, unknown>, field: string): string {
  const value = requireString(record, field);
  if (!value.startsWith("apps/office/src/") || (!value.endsWith(".ts") && !value.endsWith(".tsx")))
    throw new Error(`Source provenance ${field} must name an apps/office/src runtime module.`);
  return value;
}

/**
 * Requires one non-empty string array.
 * @param record - Parsed object.
 * @param field - Array field name.
 * @param localPath - Owning path for diagnostics.
 * @returns Validated strings.
 */
function requireNonEmptyStringArray(
  record: Record<string, unknown>,
  field: string,
  localPath: string,
): readonly string[] {
  const value = record[field];
  if (!Array.isArray(value) || value.length === 0 || value.some(isNotNonBlankString))
    throw new Error(`Source provenance ${field} for ${localPath} must contain non-empty strings.`);
  return value as readonly string[];
}

/**
 * Parses JSON as a root object.
 * @param sourceText - JSON source text.
 * @returns Parsed object.
 */
function parseObject(sourceText: string): Record<string, unknown> {
  try {
    const value = JSON.parse(sourceText) as unknown;
    if (!isRecord(value)) throw new Error("Source provenance manifest must be an object.");
    return value;
  } catch (error) {
    if (error instanceof Error && error.message === "Source provenance manifest must be an object.")
      throw error;
    throw new Error("Source provenance manifest must contain valid JSON.", { cause: error });
  }
}

/**
 * Reads a required non-empty string.
 * @param record - Parsed object.
 * @param field - String field name.
 * @returns Non-empty string.
 */
function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`Source provenance ${field} must be a non-empty string.`);
  return value;
}

/**
 * Checks for a plain object-like value.
 * @param value - Unknown candidate.
 * @returns Whether the candidate is an object record.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Selects one entry path. @param entry - Provenance entry. @returns Local module path. */
function selectEntryPath(entry: SourceProvenanceEntry): string {
  return entry.localPath;
}

/** Selects one runtime module path. @param module - Runtime module. @returns Module path. */
function selectRuntimePath(module: SourceProvenanceRuntimeModule): string {
  return module.path;
}

/**
 * Converts one runtime module to a classification map pair.
 * @param module - Runtime module.
 * @returns Path and classification tuple.
 */
function toRuntimePair(
  module: SourceProvenanceRuntimeModule,
): readonly [string, SourceProvenanceClassification] {
  return [module.path, module.classification];
}

/**
 * Creates a classification predicate.
 * @param classification - Classification to match.
 * @returns Predicate for provenance entries.
 */
function hasClassification(classification: SourceProvenanceClassification) {
  return /** Compares one entry classification. @param entry - Provenance entry. @returns Whether it matches. */ function matches(
    entry: SourceProvenanceEntry,
  ): boolean {
    return entry.classification === classification;
  };
}

/**
 * Rejects duplicate stable values.
 * @param values - Stable values.
 * @param description - Diagnostic label.
 * @returns Nothing; duplicates throw.
 */
function assertUnique(values: readonly string[], description: string): void {
  if (new Set(values).size !== values.length)
    throw new Error(`${description} values must be unique.`);
}

/**
 * Compares two path sets.
 * @param expectedPaths - Required paths.
 * @param actualPaths - Authored paths.
 * @param description - Diagnostic label.
 * @returns Nothing; mismatches throw.
 */
function assertSamePaths(
  expectedPaths: readonly string[],
  actualPaths: readonly string[],
  description: string,
): void {
  const expected = new Set(expectedPaths);
  const actual = new Set(actualPaths);
  const missing = expectedPaths.filter(
    /** Finds an absent required path. @param path - Required path. @returns Whether it is missing. */
    function isMissing(path): boolean {
      return !actual.has(path);
    },
  );
  const stale = actualPaths.filter(
    /** Finds an unexpected authored path. @param path - Authored path. @returns Whether it is stale. */
    function isStale(path): boolean {
      return !expected.has(path);
    },
  );
  if (missing.length > 0 || stale.length > 0)
    throw new Error(
      `${description} mismatch; missing: ${missing.join(", ") || "none"}; stale: ${stale.join(", ") || "none"}.`,
    );
}

/**
 * Converts a path to a lowercase extensionless basename.
 * @param filePath - Source path.
 * @returns Comparable basename.
 */
function getFilenameStem(filePath: string): string {
  return basename(filePath)
    .replace(/\.[^.]+$/u, "")
    .toLowerCase();
}

/**
 * Rejects blank array members.
 * @param value - Unknown member.
 * @returns Whether it is not a non-blank string.
 */
function isNotNonBlankString(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

/** Runs the repository-local provenance check. @returns Completion after validation and reporting. */
async function main(): Promise<void> {
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const baseline = JSON.parse(
    await readFile(resolve(repositoryRoot, "docs/program/libreoffice-baseline.json"), "utf8"),
  ) as { commit: string; tag: string };
  const runtime = JSON.parse(
    await readFile(resolve(repositoryRoot, "docs/program/parity/runtime-inventory.json"), "utf8"),
  ) as { modules: SourceProvenanceRuntimeModule[] };
  const manifest = parseSourceProvenanceManifest(
    await readFile(resolve(repositoryRoot, "docs/program/source-provenance.json"), "utf8"),
    baseline,
  );
  const report = await validateSourceProvenanceManifest(
    manifest,
    runtime.modules,
    /** Reads a local path or resolves an upstream-relative path beneath the pinned checkout. @param path - Declared evidence path. @returns UTF-8 source text. */
    function readPath(path): Promise<string> {
      const repositoryPath =
        path.startsWith("apps/") || path.startsWith("vendor/")
          ? path
          : `vendor/libreoffice-reference/${path}`;
      return readFile(resolve(repositoryRoot, repositoryPath), "utf8");
    },
  );
  console.log(
    `Source provenance check passed for ${report.moduleCount} runtime modules (${report.mappedCount} mapped, ${report.browserAdaptationCount} browser adaptations, ${report.localInfrastructureCount} local infrastructure).`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
