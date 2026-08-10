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

/** Identifies one LibreOffice gbuild test-constructor family inventoried from the pinned core checkout. */
export type CoreTestKind = "CppunitTest" | "JunitTest" | "PythonTest" | "UITest";

/** Describes one upstream gbuild test constructor without copying its source or assertion content. */
export interface CoreTestRecord {
  /** Pinned core commit that makes the declaration location reproducible. */
  readonly commit: string;
  /** Always core because all four constructor families are declared in the core repository. */
  readonly corpusId: "core";
  /** Stable identifier derived from constructor kind, declaration path, and line number. */
  readonly id: string;
  /** Explicit handoff state until a later task maps assertions to atomic parity IDs. */
  readonly mappingStatus: "unmapped";
  /** Exact one-based declaration line reported by Git grep. */
  readonly line: number;
  /** Constructor family that declares the test. */
  readonly kind: CoreTestKind;
  /** Exact core-repository-relative makefile path. */
  readonly referencePath: string;
  /** Name passed to the upstream gbuild test constructor. */
  readonly testName: string;
}

/** Defines the canonical generated inventory for all four pinned core gbuild test constructor families. */
export interface CoreTestInventory {
  /** Pinned core commit shared by every record. */
  readonly coreCommit: string;
  /** Always core because auxiliary corpora are not test-constructor inputs here. */
  readonly corpusId: "core";
  /** Stable generator identifier distinguishing the data artifact from authored source. */
  readonly generatedBy: "inventory:tests";
  /** Deterministically ordered upstream constructor records. */
  readonly records: readonly CoreTestRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-family record counts used as a baseline completeness guard. */
  readonly summary: Readonly<Record<CoreTestKind, number>>;
}

/** Identifies whether a CppunitTest source target resolved to a tracked physical C++ file or remains a Make expression. */
export type CoreTestSourceTargetStatus = "expression" | "tracked";

/** Describes one source target declared for an already inventoried pinned CppunitTest constructor. */
export interface CoreTestSourceTargetRecord {
  /** Pinned core commit that makes the declaration and physical path reproducible. */
  readonly commit: string;
  /** Stable identifier of the exact inventoried CppunitTest constructor that owns this target. */
  readonly constructorId: string;
  /** Always core because CppunitTest declarations are owned by the core repository. */
  readonly corpusId: "core";
  /** Exact core-repository-relative makefile path containing the source-target declaration. */
  readonly declarationPath: string;
  /** Raw extensionless gbuild source target, preserving the full Make expression when unresolved. */
  readonly declaredTarget: string;
  /** Stable identifier derived from constructor provenance and the raw source target. */
  readonly id: string;
  /** Explicit handoff state until a later task maps source assertions to atomic parity IDs. */
  readonly mappingStatus: "unmapped";
  /** Exact physical core-repository-relative .cxx path for tracked targets, otherwise null. */
  readonly sourcePath: string | null;
  /** Whether sourcePath is a tracked physical file or declaredTarget remains an unevaluated Make expression. */
  readonly targetStatus: CoreTestSourceTargetStatus;
}

/** Defines the canonical generated inventory of source targets linked to pinned CppunitTest constructor IDs. */
export interface CoreTestSourceTargetInventory {
  /** Pinned core commit shared by every generated record. */
  readonly coreCommit: string;
  /** Always core because auxiliary corpora are outside this extraction. */
  readonly corpusId: "core";
  /** Stable generator identifier distinguishing this provenance inventory from authored source. */
  readonly generatedBy: "inventory:test-source-targets";
  /** Deterministically ordered source-target records linked to CppunitTest constructors. */
  readonly records: readonly CoreTestSourceTargetRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-resolution-status counts used as a pinned completeness guard. */
  readonly summary: Readonly<Record<CoreTestSourceTargetStatus, number>>;
}

/** Identifies whether a JunitTest Java source target is tracked, absent from the pinned tree, or unevaluated. */
export type CoreJunitSourceTargetStatus = "expression" | "missing" | "tracked";

/** Describes one Java source target declared for an already inventoried pinned JunitTest constructor. */
export interface CoreJunitSourceTargetRecord {
  /** Pinned core commit that makes the declaration and physical path reproducible. */
  readonly commit: string;
  /** Stable identifier of the exact inventoried JunitTest constructor that owns this target. */
  readonly constructorId: string;
  /** Always core because JunitTest declarations are owned by the core repository. */
  readonly corpusId: "core";
  /** Exact core-repository-relative makefile path containing the source-target declaration. */
  readonly declarationPath: string;
  /** Raw extensionless gbuild source target, preserving the full Make expression when unresolved. */
  readonly declaredTarget: string;
  /** Stable identifier derived from constructor provenance and the raw source target. */
  readonly id: string;
  /** Explicit handoff state until a later task maps source assertions to atomic parity IDs. */
  readonly mappingStatus: "unmapped";
  /** Exact physical core-repository-relative .java path for literal targets, otherwise null. */
  readonly sourcePath: string | null;
  /** Whether sourcePath is tracked, absent from the pinned Git tree, or unresolved Make syntax. */
  readonly targetStatus: CoreJunitSourceTargetStatus;
}

/** Defines the canonical generated inventory of Java source targets linked to pinned JunitTest constructor IDs. */
export interface CoreJunitSourceTargetInventory {
  /** Pinned core commit shared by every generated record. */
  readonly coreCommit: string;
  /** Always core because auxiliary corpora are outside this extraction. */
  readonly corpusId: "core";
  /** Stable generator identifier distinguishing this provenance inventory from authored source. */
  readonly generatedBy: "inventory:junit-source-targets";
  /** Deterministically ordered Java source-target records linked to JunitTest constructors. */
  readonly records: readonly CoreJunitSourceTargetRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-resolution-status counts used as a pinned completeness guard. */
  readonly summary: Readonly<Record<CoreJunitSourceTargetStatus, number>>;
}

/** Identifies whether a PythonTest module target is tracked, absent from the pinned tree, or unevaluated Make syntax. */
export type CorePythonTestModuleStatus = "expression" | "missing" | "tracked";

/** Describes one Python module target declared for an already inventoried pinned PythonTest constructor. */
export interface CorePythonTestModuleRecord {
  /** Pinned core commit that makes the declaration and module path reproducible. */
  readonly commit: string;
  /** Stable identifier of the exact inventoried PythonTest constructor that owns this module. */
  readonly constructorId: string;
  /** Always core because PythonTest declarations are owned by the core repository. */
  readonly corpusId: "core";
  /** Exact core-repository-relative makefile path containing the module declaration. */
  readonly declarationPath: string;
  /** Raw Python module token from the Make source list. */
  readonly declaredModule: string;
  /** Stable identifier derived from constructor provenance and the module token. */
  readonly id: string;
  /** Explicit handoff state until a later task maps Python assertions to atomic parity IDs. */
  readonly mappingStatus: "unmapped";
  /** Exact physical core-repository-relative `.py` module path for literal tokens, otherwise null. */
  readonly modulePath: string | null;
  /** Exact core-repository-relative source directory resolved from the gbuild declaration. */
  readonly sourceDirectory: string;
  /** Whether modulePath is tracked, absent, or remains unevaluated Make syntax. */
  readonly targetStatus: CorePythonTestModuleStatus;
}

/** Defines the canonical generated inventory of Python module targets linked to pinned PythonTest constructor IDs. */
export interface CorePythonTestModuleInventory {
  /** Pinned core commit shared by every generated record. */
  readonly coreCommit: string;
  /** Always core because auxiliary corpora are outside this extraction. */
  readonly corpusId: "core";
  /** Stable generator identifier distinguishing this provenance inventory from authored source. */
  readonly generatedBy: "inventory:python-test-modules";
  /** Deterministically ordered Python module records linked to PythonTest constructors. */
  readonly records: readonly CorePythonTestModuleRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-resolution-status counts used as a pinned completeness guard. */
  readonly summary: Readonly<Record<CorePythonTestModuleStatus, number>>;
}

/** Identifies whether a UITest-declared module root resolved to tracked Python files, remained empty, or contains unevaluated Make syntax. */
export type CoreUITestSourceTargetStatus = "expression" | "missing" | "tracked";

/** Describes one Python source file discovered beneath an already inventoried pinned UITest module-root declaration. */
export interface CoreUITestSourceTargetRecord {
  /** Pinned core commit that makes the declaration and physical source path reproducible. */
  readonly commit: string;
  /** Stable identifier of the exact inventoried UITest constructor that owns the declared module root. */
  readonly constructorId: string;
  /** Always core because UITest declarations are owned by the core repository. */
  readonly corpusId: "core";
  /** Exact core-repository-relative makefile path containing the module-root declaration. */
  readonly declarationPath: string;
  /** Raw module-root token after trailing-slash normalization, preserving Make syntax when unresolved. */
  readonly declaredModuleRoot: string;
  /** Stable identifier derived from constructor provenance, resolution status, and physical source path when available. */
  readonly id: string;
  /** Explicit handoff state until a later task maps source assertions to atomic parity IDs. */
  readonly mappingStatus: "unmapped";
  /** Exact core-repository-relative directory that scopes discovery below this declaration. */
  readonly moduleRootPath: string | null;
  /** Exact Git-tracked physical .py path, or null for missing/unevaluated declarations. */
  readonly sourcePath: string | null;
  /** Exact core-repository-relative source directory supplied as the macro's second argument. */
  readonly sourceDirectory: string;
  /** Whether sourcePath is tracked, the literal module root contains no Python file, or syntax remains unresolved. */
  readonly targetStatus: CoreUITestSourceTargetStatus;
}

/** Defines the canonical generated inventory of Python source targets discovered below pinned UITest module roots. */
export interface CoreUITestSourceTargetInventory {
  /** Pinned core commit shared by every generated record. */
  readonly coreCommit: string;
  /** Always core because auxiliary corpora are outside this extraction. */
  readonly corpusId: "core";
  /** Stable generator identifier distinguishing this provenance inventory from authored source. */
  readonly generatedBy: "inventory:ui-test-source-targets";
  /** Deterministically ordered physical Python source-target records linked to UITest constructors. */
  readonly records: readonly CoreUITestSourceTargetRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-resolution-status counts used as a pinned completeness guard. */
  readonly summary: Readonly<Record<CoreUITestSourceTargetStatus, number>>;
}

/** Identifies the supported Cppunit macro family that registers one test case. */
export type CoreCppunitRegistrationKind = "CPPUNIT_TEST" | "CPPUNIT_TEST_FIXTURE";

/** Describes one registered Cppunit test case linked to existing physical source-target and constructor provenance. */
export interface CoreCppunitRegistrationRecord {
  /** Pinned core commit that makes registration provenance reproducible. */
  readonly commit: string;
  /** Stable identifier of the exact inventoried CppunitTest constructor that owns the source target. */
  readonly constructorId: string;
  /** Always core because Cppunit registrations are declared in the core repository. */
  readonly corpusId: "core";
  /** Fixture type supplied by CPPUNIT_TEST_FIXTURE, otherwise null. */
  readonly fixtureName: string | null;
  /** Stable identifier derived from physical source-target provenance and source line. */
  readonly id: string;
  /** Exact Cppunit registration macro family. */
  readonly kind: CoreCppunitRegistrationKind;
  /** Exact one-based line at which the registration macro starts. */
  readonly line: number;
  /** Explicit handoff state until a later task maps the registered behavior to atomic parity IDs. */
  readonly mappingStatus: "unmapped";
  /** Exact Git-tracked physical C++ path containing the registration. */
  readonly sourcePath: string;
  /** Stable identifier of the exact existing Cppunit source-target record that owns sourcePath. */
  readonly sourceTargetId: string;
  /** Registered C++ test method identifier. */
  readonly testName: string;
}

/** Defines the canonical generated inventory of Cppunit registration macros in pinned physical C++ source targets. */
export interface CoreCppunitRegistrationInventory {
  /** Pinned core commit shared by every generated record. */
  readonly coreCommit: string;
  /** Always core because auxiliary corpora are outside this extraction. */
  readonly corpusId: "core";
  /** Stable generator identifier distinguishing this provenance inventory from authored source. */
  readonly generatedBy: "inventory:cppunit-registrations";
  /** Deterministically ordered Cppunit registration records linked to physical source targets. */
  readonly records: readonly CoreCppunitRegistrationRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-macro count used as a pinned completeness guard. */
  readonly summary: Readonly<Record<CoreCppunitRegistrationKind, number>>;
}

/** Describes one pinned LibreOffice XHP help-topic path without copying its documentation text. */
export interface HelpTopicRecord {
  /** Help area derived from source/text/<area>/ in the repository-relative topic path. */
  readonly area: string;
  /** Pinned help repository commit that makes the path reproducible. */
  readonly commit: string;
  /** Corpus identity proving the topic belongs to the LibreOffice help repository. */
  readonly corpusId: "helpcontent2";
  /** Stable identifier derived only from the exact repository-relative topic path. */
  readonly id: string;
  /** Explicit handoff state until later tasks map topic content to implemented behavior. */
  readonly mappingStatus: "unmapped";
  /** Exact help-repository-relative XHP topic path. */
  readonly referencePath: string;
}

/** Defines the canonical generated inventory for pinned LibreOffice XHP help-topic paths. */
export interface HelpTopicInventory {
  /** Pinned help commit shared by every generated topic record. */
  readonly helpCommit: string;
  /** Always helpcontent2 because core and auxiliary corpora are outside this extraction. */
  readonly corpusId: "helpcontent2";
  /** Stable generator identifier distinguishing generated topic metadata from authored source. */
  readonly generatedBy: "inventory:help-topics";
  /** Deterministically sorted XHP topic records. */
  readonly records: readonly HelpTopicRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-area topic counts used as a pinned completeness guard. */
  readonly summary: Readonly<Record<string, number>>;
}

/** Describes one pinned LibreOffice PO catalog path without copying translated message content. */
export interface TranslationCatalogRecord {
  /** Pinned translations repository commit that makes the catalog path reproducible. */
  readonly commit: string;
  /** Corpus identity proving the catalog belongs to the LibreOffice translations repository. */
  readonly corpusId: "translations";
  /** Stable identifier derived only from the exact repository-relative PO catalog path. */
  readonly id: string;
  /** Locale derived from source/<locale>/ in the repository-relative catalog path. */
  readonly locale: string;
  /** Explicit handoff state until a later task maps catalog content to implemented localization behavior. */
  readonly mappingStatus: "unmapped";
  /** Exact translations-repository-relative PO catalog path. */
  readonly referencePath: string;
}

/** Defines the canonical generated inventory for pinned LibreOffice PO catalog paths. */
export interface TranslationCatalogInventory {
  /** Always translations because core and other auxiliary corpora are outside this extraction. */
  readonly corpusId: "translations";
  /** Stable generator identifier distinguishing generated catalog metadata from authored source. */
  readonly generatedBy: "inventory:translations";
  /** Deterministically sorted PO catalog records. */
  readonly records: readonly TranslationCatalogRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-locale catalog counts used as a pinned completeness guard. */
  readonly summary: Readonly<Record<string, number>>;
  /** Pinned translations commit shared by every generated catalog record. */
  readonly translationsCommit: string;
}

/** Identifies one lexical-data file type in the pinned dictionaries corpus. */
export type DictionaryFileKind = "aff" | "dic";

/** Describes one pinned dictionary file path without copying lexical data. */
export interface DictionaryFileRecord {
  /** Pinned dictionaries commit that makes the path reproducible. */
  readonly commit: string;
  /** Corpus identity proving the record came from the dictionaries repository. */
  readonly corpusId: "dictionaries";
  /** Stable identifier derived only from the exact repository-relative file path. */
  readonly id: string;
  /** AFF or DIC file kind derived from the filename extension. */
  readonly kind: DictionaryFileKind;
  /** Explicit handoff state until a later task maps lexical behavior. */
  readonly mappingStatus: "unmapped";
  /** First path segment identifying the dictionary package. */
  readonly packageName: string;
  /** Exact dictionaries-repository-relative file path. */
  readonly referencePath: string;
}

/** Defines the canonical generated inventory for pinned LibreOffice dictionary files. */
export interface DictionaryFileInventory {
  /** Always dictionaries because no other corpus is an input to this extraction. */
  readonly corpusId: "dictionaries";
  /** Pinned dictionaries commit shared by every generated record. */
  readonly dictionariesCommit: string;
  /** Stable generator identifier distinguishing generated metadata from authored source. */
  readonly generatedBy: "inventory:dictionaries";
  /** Deterministically sorted AFF and DIC file records. */
  readonly records: readonly DictionaryFileRecord[];
  /** Static generated-file schema version. */
  readonly schemaVersion: 1;
  /** Exact per-kind counts used as pinned completeness guards. */
  readonly summary: Readonly<Record<DictionaryFileKind, number>>;
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
