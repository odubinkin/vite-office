/**
 * @fileoverview Declares the versioned baseline manifest, observed corpus data, and deterministic inventory report contracts.
 */

/** Describes the immutable Git identity and local location of one LibreOffice corpus. */
export interface BaselineCorpus {
  /** Immutable commit checked out locally. */
  readonly commit: string;
  /** Stable corpus identifier used by reports and later parity records. */
  readonly id: CorpusId;
  /** Optional, corpus-specific acquisition floors recorded during reference acquisition. */
  readonly corpusShape?: CorpusShape;
  /** Official upstream repository URL. */
  readonly repository: string;
  /** Local path relative to the repository root. */
  readonly referencePath: string;
  /** Annotated release-tag object identity. */
  readonly tagObject: string;
  /** Minimum number of Git-tracked files expected in the corpus. */
  readonly trackedFiles: number;
}

/** Identifies one pinned LibreOffice corpus that must be present before inventory begins. */
export type CorpusId = "core" | "dictionaries" | "helpcontent2" | "translations";

/** Records optional category-level acquisition floors for a corpus. */
export interface CorpusShape {
  /** Minimum number of Hunspell AFF files in the dictionaries corpus. */
  readonly affFiles?: number;
  /** Minimum number of Hunspell dictionary files in the dictionaries corpus. */
  readonly dictionaryFiles?: number;
  /** Minimum number of XHP help topics in the help corpus. */
  readonly xhpTopics?: number;
  /** Minimum number of PO translation catalogs in the translations corpus. */
  readonly poCatalogs?: number;
  /** Minimum number of translation locale directories in the translations corpus. */
  readonly localeDirectories?: number;
}

/** Represents the validated subset of the version-two project baseline manifest used by inventory tooling. */
export interface BaselineManifest {
  /** All pinned corpora, including core and the initialized Git submodules. */
  readonly corpora: readonly BaselineCorpus[];
  /** Global baseline commit for the core repository. */
  readonly commit: string;
  /** Global baseline repository URL for the core repository. */
  readonly repository: string;
  /** Parent local path shared by corpus reference paths. */
  readonly referencePath: string;
  /** Supported manifest schema version. */
  readonly schemaVersion: 2;
  /** Human-readable LibreOffice release tag. */
  readonly tag: string;
  /** Annotated tag object for the core release. */
  readonly tagObject: string;
}

/** Captures live Git and file-category counts observed for a locally materialized corpus. */
export interface CorpusObservation {
  /** Normalized upstream remote URL reported by Git. */
  readonly origin: string;
  /** Corpus identifier carried through to deterministic output. */
  readonly id: CorpusId;
  /** Checked-out Git commit reported by HEAD. */
  readonly commit: string;
  /** Whether Git reports the repository as shallow. */
  readonly isShallow: boolean;
  /** Whether the repository worktree has no uncommitted changes. */
  readonly isClean: boolean;
  /** Number of locale directories derived from PO catalog paths. */
  readonly localeDirectories: number;
  /** Corpus path inspected relative to the project root. */
  readonly referencePath: string;
  /** Annotated tag object reported by Git. */
  readonly tagObject: string;
  /** Number of Git-tracked files in the local corpus. */
  readonly trackedFiles: number;
  /** Number of Hunspell AFF files. */
  readonly affFiles: number;
  /** Number of Hunspell dictionary files. */
  readonly dictionaryFiles: number;
  /** Number of PO translation catalogs. */
  readonly poCatalogs: number;
  /** Number of XHP help topics. */
  readonly xhpTopics: number;
}

/** Defines one machine-readable reason why a pinned baseline cannot be trusted for inventory. */
export interface ValidationIssue {
  /** Corpus that produced the issue, or manifest when parsing failed before corpus discovery. */
  readonly corpusId: CorpusId | "manifest";
  /** Stable validation field or invariant name. */
  readonly field: string;
  /** Expected value or constraint expressed for human diagnosis. */
  readonly expected: string;
  /** Actual observed value expressed for human diagnosis. */
  readonly actual: string;
}

/** Describes the stable, serializable output of a successful baseline validation. */
export interface InventoryReport {
  /** Validated release tag that scopes every observation. */
  readonly baselineTag: string;
  /** Canonically ordered successful observations. */
  readonly corpora: readonly CorpusObservation[];
  /** Static report schema version; no timestamp is emitted so unchanged input remains byte-stable. */
  readonly schemaVersion: 1;
  /** Literal validation status consumed by later inventory stages. */
  readonly status: "valid";
}

/** Describes one unmapped pinned core build-module declaration without copying its upstream file content. */
export interface CoreModuleRecord {
  /** Pinned corpus that owns the declaration. */
  readonly corpusId: "core";
  /** Pinned core commit that makes the path reproducible. */
  readonly commit: string;
  /** Stable identifier derived only from the exact reference-relative declaration path. */
  readonly id: string;
  /** Explicit handoff state; later tasks must map the module to atomic capabilities. */
  readonly mappingStatus: "unmapped";
  /** Module name derived from the Module_<name>.mk filename. */
  readonly moduleName: string;
  /** Exact core-repository-relative path to the module declaration. */
  readonly referencePath: string;
}

/** Defines the canonical generated inventory document for pinned core Module_*.mk declarations. */
export interface CoreModuleInventory {
  /** Immutable core commit shared by every generated module record. */
  readonly coreCommit: string;
  /** Corpus identity proving the records came from LibreOffice core rather than an auxiliary corpus. */
  readonly corpusId: "core";
  /** Stable generator identifier that visibly distinguishes this data artifact from authored source. */
  readonly generatedBy: "inventory:modules";
  /** Deterministically lexicographically ordered module records. */
  readonly records: readonly CoreModuleRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
}

/** Holds an error collection produced when a manifest or local checkout violates the inventory contract. */
export class BaselineValidationError extends Error {
  /** Machine-readable validation failures collected before execution stopped. */
  readonly issues: readonly ValidationIssue[];

  /**
   * Creates a validation error with every detected contract violation.
   *
   * @param issues - Immutable validation failures explaining why the baseline cannot be inventoried.
   * @returns The constructed validation error instance.
   */
  constructor(issues: readonly ValidationIssue[]) {
    super(formatValidationIssues(issues));
    this.name = "BaselineValidationError";
    this.issues = issues;
  }
}

/**
 * Formats validation issues into a stable error message without exposing environment-specific stack details.
 *
 * @param issues - Validation failures to present in deterministic order.
 * @returns A concise, deterministic error message.
 */
function formatValidationIssues(issues: readonly ValidationIssue[]): string {
  const messages = issues.map(
    /**
     * Converts one structured issue into a stable human-readable fragment.
     *
     * @param issue - Validation failure to format.
     * @returns A formatted issue fragment.
     */
    function formatIssue(issue: ValidationIssue): string {
      return `${issue.corpusId}.${issue.field}: expected ${issue.expected}; received ${issue.actual}`;
    },
  );

  return `LibreOffice baseline validation failed: ${messages.join(" | ")}`;
}
