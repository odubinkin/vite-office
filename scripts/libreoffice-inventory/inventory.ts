/**
 * @fileoverview Validates live pinned LibreOffice corpora and converts their read-only observations into a deterministic report.
 */

import path from "node:path";

import type {
  BaselineCorpus,
  BaselineManifest,
  CorpusId,
  CorpusObservation,
  InventoryReport,
  ValidationIssue,
} from "./contracts";
import { BaselineValidationError } from "./contracts";
import type { GitExecutor } from "./git";
import { normalizeRepositoryUrl } from "./git";

/** Options that select the read-only local checkout used for validation. */
export interface InventoryValidationOptions {
  /** Git command boundary; injectable to keep unit tests deterministic and complete. */
  readonly git: GitExecutor;
  /** Absolute or project-relative root of the pinned core checkout. */
  readonly referenceRoot: string;
}

/**
 * Validates every required corpus and returns a byte-stable successful report.
 *
 * @param manifest - Parsed, version-two baseline manifest that declares the expected checkout identity.
 * @param options - Git boundary and local checkout root to inspect without mutation.
 * @returns A promise resolving to a deterministic successful report.
 * @throws {BaselineValidationError} When one or more corpora violate the baseline contract.
 */
export async function validateBaseline(
  manifest: BaselineManifest,
  options: InventoryValidationOptions,
): Promise<InventoryReport> {
  const observations = await Promise.all(
    manifest.corpora.map(
      /**
       * Reads and validates one corpus against its pinned manifest declaration.
       *
       * @param corpus - Manifest declaration that controls one local inspection.
       * @returns A promise resolving to the corpus observation and its collected issues.
       */
      async function inspectDeclaredCorpus(corpus: BaselineCorpus): Promise<InspectionResult> {
        return inspectCorpus(manifest, corpus, options);
      },
    ),
  );
  const issues = observations.flatMap(
    /**
     * Extracts validation issues from one completed corpus inspection.
     *
     * @param result - Inspection result containing a live observation and zero or more issues.
     * @returns The result's immutable validation issues.
     */
    function selectIssues(result: InspectionResult): readonly ValidationIssue[] {
      return result.issues;
    },
  );

  if (issues.length > 0) {
    throw new BaselineValidationError(sortIssues(issues));
  }

  return createInventoryReport(
    manifest.tag,
    observations.map(
      /**
       * Extracts a successful corpus observation for report generation.
       *
       * @param result - Completed inspection result with no global validation failure.
       * @returns The read-only corpus observation.
       */
      function selectObservation(result: InspectionResult): CorpusObservation {
        return result.observation;
      },
    ),
  );
}

/**
 * Creates a canonically ordered report without a timestamp or environment-dependent path prefix.
 *
 * @param baselineTag - Immutable release tag shared by all observed corpora.
 * @param observations - Successful corpus observations in any input order.
 * @returns A deterministic inventory report sorted by corpus identifier.
 */
export function createInventoryReport(
  baselineTag: string,
  observations: readonly CorpusObservation[],
): InventoryReport {
  return {
    baselineTag,
    corpora: [...observations].sort(compareCorpusObservations),
    schemaVersion: 1,
    status: "valid",
  };
}

/** Holds the live observation and all non-throwing validation issues from one corpus inspection. */
interface InspectionResult {
  /** Every identity, clean-state, shallow-state, and acquisition-floor mismatch found for the corpus. */
  readonly issues: readonly ValidationIssue[];
  /** Read-only Git and path observations collected from the corpus. */
  readonly observation: CorpusObservation;
}

/**
 * Inspects one corpus through the Git boundary and compares all manifest-backed invariants.
 *
 * @param manifest - Full baseline manifest used to calculate the corpus-relative local path.
 * @param corpus - Expected corpus identity and acquisition floors.
 * @param options - Local checkout selection and Git executor.
 * @returns A promise resolving to the live observation plus all detected issues.
 */
async function inspectCorpus(
  manifest: BaselineManifest,
  corpus: BaselineCorpus,
  options: InventoryValidationOptions,
): Promise<InspectionResult> {
  const referencePath = resolveCorpusPath(
    manifest.referencePath,
    corpus.referencePath,
    options.referenceRoot,
  );
  const git = options.git;
  const [commit, origin, tagObject, shallow, status, filesOutput] = await Promise.all([
    git.run(referencePath, ["rev-parse", "HEAD"]),
    git.run(referencePath, ["remote", "get-url", "origin"]),
    git.run(referencePath, ["rev-parse", `refs/tags/${manifest.tag}^{tag}`]),
    git.run(referencePath, ["rev-parse", "--is-shallow-repository"]),
    git.run(referencePath, ["status", "--short"]),
    git.run(referencePath, ["ls-files", "-z"]),
  ]);
  const files = splitGitPaths(filesOutput);
  const observation = createObservation(
    corpus.id,
    corpus.referencePath,
    commit,
    origin,
    tagObject,
    shallow,
    status,
    files,
  );

  return {
    issues: validateObservation(corpus, observation),
    observation,
  };
}

/**
 * Resolves one corpus path below the caller-selected core checkout and rejects manifest traversal outside it.
 *
 * @param baselineReferencePath - Core reference path declared in the baseline manifest.
 * @param corpusReferencePath - Corpus reference path declared in the baseline manifest.
 * @param referenceRoot - Actual local root supplied by the CLI or caller.
 * @returns Absolute or relative path to the selected corpus checkout.
 * @throws {BaselineValidationError} When a corpus path is not below the declared baseline root.
 */
function resolveCorpusPath(
  baselineReferencePath: string,
  corpusReferencePath: string,
  referenceRoot: string,
): string {
  const relativeCorpusPath = path.relative(baselineReferencePath, corpusReferencePath);
  if (relativeCorpusPath === ".." || relativeCorpusPath.startsWith(`..${path.sep}`)) {
    const issue: ValidationIssue = {
      actual: corpusReferencePath,
      corpusId: "manifest",
      expected: `path below ${baselineReferencePath}`,
      field: "referencePath",
    };
    throw new BaselineValidationError([issue]);
  }

  return path.join(referenceRoot, relativeCorpusPath);
}

/**
 * Converts raw Git outputs and tracked paths into a single typed corpus observation.
 *
 * @param id - Stable corpus identifier.
 * @param referencePath - Manifest-relative corpus path retained for report traceability.
 * @param commit - Raw Git HEAD output.
 * @param origin - Raw Git origin output.
 * @param tagObject - Raw annotated tag-object output.
 * @param shallow - Raw Git shallow-repository output.
 * @param status - Raw Git worktree status output.
 * @param files - NUL-delimited paths returned by Git and split into strings.
 * @returns A normalized, fully counted corpus observation.
 */
function createObservation(
  id: CorpusId,
  referencePath: string,
  commit: string,
  origin: string,
  tagObject: string,
  shallow: string,
  status: string,
  files: readonly string[],
): CorpusObservation {
  return {
    affFiles: countFilesWithSuffix(files, ".aff"),
    commit: commit.trim(),
    dictionaryFiles: countFilesWithSuffix(files, ".dic"),
    id,
    isClean: status.trim().length === 0,
    isShallow: shallow.trim() === "true",
    localeDirectories: countLocaleDirectories(files),
    origin: normalizeRepositoryUrl(origin),
    poCatalogs: countFilesWithSuffix(files, ".po"),
    referencePath,
    tagObject: tagObject.trim(),
    trackedFiles: files.length,
    xhpTopics: countFilesWithSuffix(files, ".xhp"),
  };
}

/**
 * Compares one observation with its expected identity and optional category-level acquisition floors.
 *
 * @param corpus - Manifest declaration containing expected fields and minimum counts.
 * @param observation - Live normalized corpus observation.
 * @returns All failures in stable field-creation order.
 */
function validateObservation(
  corpus: BaselineCorpus,
  observation: CorpusObservation,
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  appendExactIssue(issues, corpus.id, "commit", corpus.commit, observation.commit);
  appendExactIssue(
    issues,
    corpus.id,
    "origin",
    normalizeRepositoryUrl(corpus.repository),
    observation.origin,
  );
  appendExactIssue(issues, corpus.id, "tagObject", corpus.tagObject, observation.tagObject);
  appendExactIssue(issues, corpus.id, "isShallow", "true", String(observation.isShallow));
  appendExactIssue(issues, corpus.id, "isClean", "true", String(observation.isClean));
  appendMinimumIssue(
    issues,
    corpus.id,
    "trackedFiles",
    corpus.trackedFiles,
    observation.trackedFiles,
  );

  if (corpus.corpusShape !== undefined) {
    appendOptionalShapeIssues(issues, corpus.id, corpus.corpusShape, observation);
  }

  return issues;
}

/**
 * Adds a mismatch only when observed and expected scalar values differ.
 *
 * @param issues - Mutable validation collection for the current corpus.
 * @param corpusId - Stable corpus identity for the possible issue.
 * @param field - Compared scalar field.
 * @param expected - Required scalar string.
 * @param actual - Observed scalar string.
 * @returns Nothing; mismatch details are appended only when needed.
 */
function appendExactIssue(
  issues: ValidationIssue[],
  corpusId: CorpusId,
  field: string,
  expected: string,
  actual: string,
): void {
  if (expected !== actual) {
    issues.push({ actual, corpusId, expected, field });
  }
}

/**
 * Adds an acquisition-floor violation only when the observed count is below the expected count.
 *
 * @param issues - Mutable validation collection for the current corpus.
 * @param corpusId - Stable corpus identity for the possible issue.
 * @param field - Count field being validated.
 * @param expected - Minimum allowed count.
 * @param actual - Observed count.
 * @returns Nothing; a below-floor issue is appended only when necessary.
 */
function appendMinimumIssue(
  issues: ValidationIssue[],
  corpusId: CorpusId,
  field: string,
  expected: number,
  actual: number,
): void {
  if (actual < expected) {
    issues.push({ actual: String(actual), corpusId, expected: `>= ${expected}`, field });
  }
}

/**
 * Adds all supplied optional corpus-shape acquisition-floor violations.
 *
 * @param issues - Mutable validation collection for the current corpus.
 * @param corpusId - Stable corpus identity for possible issues.
 * @param shape - Optional manifest-defined shape floors.
 * @param observation - Live count observation to compare.
 * @returns Nothing; below-floor issues are appended only when necessary.
 */
function appendOptionalShapeIssues(
  issues: ValidationIssue[],
  corpusId: CorpusId,
  shape: BaselineCorpus["corpusShape"] & object,
  observation: CorpusObservation,
): void {
  appendShapeIssue(issues, corpusId, "affFiles", shape.affFiles, observation.affFiles);
  appendShapeIssue(
    issues,
    corpusId,
    "dictionaryFiles",
    shape.dictionaryFiles,
    observation.dictionaryFiles,
  );
  appendShapeIssue(
    issues,
    corpusId,
    "localeDirectories",
    shape.localeDirectories,
    observation.localeDirectories,
  );
  appendShapeIssue(issues, corpusId, "poCatalogs", shape.poCatalogs, observation.poCatalogs);
  appendShapeIssue(issues, corpusId, "xhpTopics", shape.xhpTopics, observation.xhpTopics);
}

/**
 * Adds one optional acquisition-floor violation when the manifest declares the field.
 *
 * @param issues - Mutable validation collection for the current corpus.
 * @param corpusId - Stable corpus identity for the possible issue.
 * @param field - Optional count field being validated.
 * @param expected - Undefined when the manifest does not set a floor, otherwise its minimum.
 * @param actual - Observed count.
 * @returns Nothing; a below-floor issue is appended only for declared floors.
 */
function appendShapeIssue(
  issues: ValidationIssue[],
  corpusId: CorpusId,
  field: string,
  expected: number | undefined,
  actual: number,
): void {
  if (expected !== undefined) {
    appendMinimumIssue(issues, corpusId, field, expected, actual);
  }
}

/**
 * Splits NUL-delimited Git paths while discarding only the terminal delimiter's empty field.
 *
 * @param output - Raw standard output from git ls-files -z.
 * @returns Individual repository-relative tracked paths.
 */
function splitGitPaths(output: string): readonly string[] {
  const paths = output.split("\0");
  if (paths[paths.length - 1] === "") {
    paths.pop();
  }

  return paths;
}

/**
 * Counts tracked paths with one exact case-sensitive suffix.
 *
 * @param files - Repository-relative tracked paths.
 * @param suffix - Required filename suffix.
 * @returns Number of paths ending with the requested suffix.
 */
function countFilesWithSuffix(files: readonly string[], suffix: string): number {
  return files.filter(
    /**
     * Checks whether one tracked path ends with the required suffix.
     *
     * @param file - Repository-relative tracked path.
     * @returns True when the path belongs to the requested file category.
     */
    function hasSuffix(file: string): boolean {
      return file.endsWith(suffix);
    },
  ).length;
}

/**
 * Counts translation locale directories from the standard source/<locale>/... PO layout.
 *
 * @param files - Repository-relative tracked paths.
 * @returns Number of unique locale directory names that contain a PO catalog.
 */
function countLocaleDirectories(files: readonly string[]): number {
  const locales = new Set<string>();

  for (const file of files) {
    if (!file.endsWith(".po")) {
      continue;
    }

    const segments = file.split("/");
    const locale = segments[0] === "source" ? segments[1] : undefined;
    if (locale !== undefined && locale.length > 0) {
      locales.add(locale);
    }
  }

  return locales.size;
}

/**
 * Orders successful corpus observations lexically by stable corpus identifier.
 *
 * @param left - First corpus observation to compare.
 * @param right - Second corpus observation to compare.
 * @returns Negative, zero, or positive lexical comparison result.
 */
function compareCorpusObservations(left: CorpusObservation, right: CorpusObservation): number {
  return left.id.localeCompare(right.id);
}

/**
 * Orders issues by corpus, field, expected, then actual to keep failure output deterministic despite concurrent inspection.
 *
 * @param issues - Unordered validation issues gathered from concurrent corpus inspections.
 * @returns A sorted immutable issue list.
 */
function sortIssues(issues: readonly ValidationIssue[]): readonly ValidationIssue[] {
  return [...issues].sort(compareValidationIssues);
}

/**
 * Compares two validation issues in their deterministic report order.
 *
 * @param left - First validation issue.
 * @param right - Second validation issue.
 * @returns Negative, zero, or positive comparison result.
 */
function compareValidationIssues(left: ValidationIssue, right: ValidationIssue): number {
  return `${left.corpusId}\0${left.field}\0${left.expected}\0${left.actual}`.localeCompare(
    `${right.corpusId}\0${right.field}\0${right.expected}\0${right.actual}`,
  );
}
