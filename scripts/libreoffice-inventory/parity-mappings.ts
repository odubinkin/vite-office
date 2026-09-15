/**
 * @fileoverview Parses and validates authored atomic parity mappings that connect the pinned LibreOffice baseline to local implementation, test, and documentation evidence.
 */

import type { BaselineManifest } from "./contracts";

/** Identifies the evidence category whose referenced paths must resolve. */
export type ParityEvidenceKind = "docs" | "implementation" | "source" | "tests";

/** Identifies the browser-runtime reason that makes an upstream behavior non-implementable locally. */
export type ParityExceptionReason = "browser-runtime-inapplicable" | "browser-runtime-supersedes";

/** Identifies the architecture-neutral kind of one bounded capability. */
export type ParityCapabilityType =
  "command" | "filter" | "infrastructure" | "lifecycle" | "model" | "platform";

/** Identifies the independently verifiable layer owned by one atomic capability. */
export type ParityCapabilityAspect =
  | "browser-input"
  | "command-placement"
  | "command-state"
  | "compatibility"
  | "model-operation"
  | "persistence-filter"
  | "undo-redo";

/** Records the delivery lifecycle independently from the five parity attestations. */
export type ParityMaturity =
  "exception-approved" | "implemented" | "mapped" | "planned" | "verified";

/** Records whether and why the browser stack differs from the pinned upstream stack. */
export interface ParityStackDivergence {
  /** Approved divergence classification from the Stage 0 allowlist. */
  readonly kind: "browser-adaptation" | "local-infrastructure" | "none";
  /** Concrete architectural reason for this classification. */
  readonly rationale: string;
}

/** Records executable task and commit evidence for a closed parity claim. */
export interface ParityVerificationEvidence {
  /** Commit containing the verified implementation and evidence. */
  readonly commit: string;
  /** Human-readable verification command or report reference. */
  readonly evidence: string;
  /** Whether the verification proves only the explicitly bounded operation or a full capability contract. */
  readonly scope: "bounded" | "full";
  /** AgentPlane task that owns the closed claim. */
  readonly taskId: string;
}

/** Binds one claimed assertion to exact executable evidence on both implementation sides. */
export interface ParityAssertionEvidence {
  readonly assertion: string;
  readonly local: ParityEvidenceReference;
  readonly upstream: ParityEvidenceReference;
}

/** Defines the auditable basis for an explicitly approved browser-environment exception. */
export interface ParityException {
  /** Task, user decision, or governing record that explicitly approved the exception. */
  readonly approvedBy: string;
  /** Explicit disposition that prevents this exception from counting as equivalent implementation. */
  readonly disposition: "not-implementable";
  /** Browser-runtime classification explaining why the upstream behavior is not locally implemented. */
  readonly reason: ParityExceptionReason;
  /** Concrete reason the upstream behavior is unnecessary or infeasible in the browser architecture. */
  readonly rationale: string;
}

/** Defines one path and a required stable textual marker inside that path. */
export interface ParityEvidenceReference {
  /** Optional exception that prevents this individual upstream test reference from counting as locally mapped. */
  readonly exception?: ParityException;
  /** Repository-relative path beneath the relevant upstream or local root. */
  readonly path: string;
  /** Test case, command, symbol, or heading that proves the reference is sufficiently specific. */
  readonly marker: string;
}

/** Groups the four kinds of evidence required for one parity side. */
export interface ParityEvidence {
  /** User or developer documentation references. */
  readonly docs: readonly ParityEvidenceReference[];
  /** Implementation or source references. */
  readonly implementation: readonly ParityEvidenceReference[];
  /** Executable test references. */
  readonly tests: readonly ParityEvidenceReference[];
}

/** Describes one bounded capability whose equivalent browser behavior remains incomplete. */
export interface ParityMappingRecord {
  /** One independently testable operation rather than an umbrella feature label. */
  readonly atomicOperation: string;
  /** Exact upstream behavior assertions or fixture expectations mapped by this record. */
  readonly assertions: readonly string[];
  /** Required assertion-by-assertion executable evidence before any parity dimension may be claimed. */
  readonly assertionEvidence?: readonly ParityAssertionEvidence[];
  /** Whether the bounded local behavior matches the pinned upstream assertions. */
  readonly behaviorParity: boolean;
  /** Architectural layer isolated by this atomic capability. */
  readonly aspect: ParityCapabilityAspect;
  /** User-observable bounded capability description. */
  readonly capability: string;
  /** Stable domain-agnostic identity retained even if suite ownership changes. */
  readonly capabilityId: string;
  /** Whether the local public/internal contract matches the pinned upstream contract. */
  readonly contractParity: boolean;
  /** Whether upstream documented defaults match for the bounded operation. */
  readonly defaultParity: boolean;
  /** Explicit browser, fidelity, fixture, or platform differences that prevent a verified claim. */
  readonly gaps: readonly string[];
  /** Explicit boundaries outside this atomic operation that remain unsupported without blocking its verification. */
  readonly scopeLimitations: readonly string[];
  /** Required only for an explicit whole-capability exception. */
  readonly exception?: ParityException;
  /** Immutable Writer parity identifier. */
  readonly id: string;
  /** Whether executable local implementation exists, independent of parity. */
  readonly implemented: boolean;
  /** Browser implementation, test, and documentation evidence. */
  readonly local: ParityEvidence;
  /** Delivery lifecycle label retained independently from semantic parity fields. */
  readonly maturity: ParityMaturity;
  /** Optional formal local contract when no upstream executable assertion applies. */
  readonly manualContract?: string;
  /** Suite that owns the capability independently of its stable capability ID. */
  readonly suite: "base" | "calc" | "chart" | "draw" | "impress" | "math" | "shared" | "writer";
  /** Narrow owning subsystem within the suite. */
  readonly subsystem: string;
  /** Reviewed stack relationship to upstream. */
  readonly stackDivergence: ParityStackDivergence;
  /** Architecture-neutral capability category. */
  readonly type: ParityCapabilityType;
  /** Pinned LibreOffice source, test, and documentation evidence. */
  readonly upstream: ParityEvidence;
  /** Whether the parity claim has closed executable evidence. */
  readonly verified: boolean;
  /** Required task/commit evidence for verified and exception-approved records. */
  readonly verification?: ParityVerificationEvidence;
}

/** Defines the versioned authored mapping document for one bounded Writer slice. */
export interface ParityMappingManifest {
  /** Pinned LibreOffice core commit that scopes all upstream evidence. */
  readonly baselineCommit: string;
  /** Pinned LibreOffice release tag that scopes all upstream evidence. */
  readonly baselineTag: string;
  /** Deterministically ordered atomic Writer mappings. */
  readonly records: readonly ParityMappingRecord[];
  /** Static schema version for strict compatibility validation. */
  readonly schemaVersion: 5;
}

/** Represents one fully resolved evidence marker for a validation report. */
export interface ResolvedParityEvidence {
  /** Evidence category that was resolved. */
  readonly kind: ParityEvidenceKind;
  /** Mapping side that owns the reference. */
  readonly side: "local" | "upstream";
  /** Exact validated repository-relative path. */
  readonly path: string;
}

/** Describes one approved non-implementable capability or upstream test for audit reports. */
export interface ParityExceptionReportEntry {
  /** Immutable Writer parity identifier that owns the approved exception. */
  readonly id: string;
  /** Approved reason, disposition, rationale, and decision reference. */
  readonly exception: ParityException;
  /** Upstream test evidence when this is a test-level exception. */
  readonly reference?: ParityEvidenceReference;
  /** Whether the exception applies to an entire capability or one upstream test. */
  readonly scope: "capability" | "upstream-test";
}

/** Defines the deterministic report produced after all mapping references resolve. */
export interface ParityMappingReport {
  /** Shared baseline commit verified against the parsed baseline manifest. */
  readonly baselineCommit: string;
  /** Number of capabilities with behavior parity. */
  readonly behaviorParityCount: number;
  /** Number of capabilities with contract parity. */
  readonly contractParityCount: number;
  /** Number of capabilities with default parity. */
  readonly defaultParityCount: number;
  /** Explicitly approved non-implementable capabilities and upstream tests, kept separate from mapped evidence. */
  readonly exceptions: readonly ParityExceptionReportEntry[];
  /** Number of explicitly approved non-implementable capability or test records. */
  readonly exceptionCount: number;
  /** Number of visible unsupported differences across all records. */
  readonly gapCount: number;
  /** Number of records whose code exists but semantic parity remains unverified. */
  readonly implementedCount: number;
  /** Whether every implemented capability has contract, behavior, default, and verification parity. */
  readonly parityReady: boolean;
  /** Number of explicit out-of-scope limitations retained by bounded capability records. */
  readonly scopeLimitationCount: number;
  /** Total bounded capability records. */
  readonly recordCount: number;
  /** Successfully resolved evidence paths in stable record and evidence order. */
  readonly resolvedEvidence: readonly ResolvedParityEvidence[];
  /** Static report schema version. */
  readonly schemaVersion: 5;
  /** Number of implemented capabilities still missing at least one parity dimension or verification. */
  readonly unresolvedParityCount: number;
  /** Number of records whose semantic evidence is complete. */
  readonly verifiedCount: number;
}

/** Defines the asynchronous text boundary used to validate paths and required evidence markers. */
export type ParityEvidenceReader = (path: string) => Promise<string>;

/**
 * Parses a strict authored mapping document and verifies that it is scoped to the supplied pinned baseline.
 *
 * @param sourceText - UTF-8 JSON mapping source.
 * @param baseline - Validated pinned LibreOffice baseline manifest.
 * @returns Strictly validated mapping records in their authored deterministic order.
 * @throws {Error} When JSON, schema, baseline identity, record order, or required evidence is invalid.
 */
export function parseParityMappingManifest(
  sourceText: string,
  baseline: BaselineManifest,
): ParityMappingManifest {
  const root = parseObject(sourceText, "root");
  if (root.schemaVersion !== 5) throw new Error("Parity mapping schemaVersion must equal 5.");
  const baselineCommit = requireString(root, "baselineCommit");
  const baselineTag = requireString(root, "baselineTag");
  if (baselineCommit !== baseline.commit)
    throw new Error("Parity mapping baseline commit does not match.");
  if (baselineTag !== baseline.tag) throw new Error("Parity mapping baseline tag does not match.");
  if (!Array.isArray(root.records) || root.records.length === 0)
    throw new Error("Parity mapping records must be a non-empty array.");
  const records = root.records.map(parseRecord);
  assertOrderedUniqueIds(records);
  assertOrderedUniqueCapabilityIds(records);
  return { baselineCommit, baselineTag, records, schemaVersion: 5 };
}

/**
 * Resolves every upstream and local path and requires its declared marker to exist in the referenced text.
 *
 * @param manifest - Parsed mapping manifest scoped to a validated baseline.
 * @param readEvidence - Reader receiving an already-rooted absolute or project-relative evidence path.
 * @param roots - Immutable local and upstream root prefixes used to resolve mapping-relative paths.
 * @returns Deterministic successful-resolution report with visible gap count.
 * @throws {Error} When an evidence path cannot be read or its required marker is absent.
 */
export async function validateParityMappingEvidence(
  manifest: ParityMappingManifest,
  readEvidence: ParityEvidenceReader,
  roots: Readonly<{ local: string; upstream: string }>,
): Promise<ParityMappingReport> {
  const resolvedEvidence: ResolvedParityEvidence[] = [];
  const exceptions: ParityExceptionReportEntry[] = [];
  for (const record of manifest.records) {
    await validateSide(record.local, "local", roots.local, readEvidence, resolvedEvidence);
    await validateSide(record.upstream, "upstream", roots.upstream, readEvidence, resolvedEvidence);
    if (record.assertionEvidence !== undefined)
      await validateAssertionEvidence(
        record.assertionEvidence,
        roots,
        readEvidence,
        resolvedEvidence,
      );
    collectExceptions(record, exceptions);
  }
  return {
    baselineCommit: manifest.baselineCommit,
    behaviorParityCount: manifest.records.filter(hasBehaviorParity).length,
    contractParityCount: manifest.records.filter(hasContractParity).length,
    defaultParityCount: manifest.records.filter(hasDefaultParity).length,
    exceptionCount: exceptions.length,
    exceptions,
    gapCount: manifest.records.flatMap(selectGaps).length,
    implementedCount: manifest.records.filter(isImplemented).length,
    parityReady: manifest.records.every(isParityReady),
    recordCount: manifest.records.length,
    resolvedEvidence,
    schemaVersion: 5,
    scopeLimitationCount: manifest.records.flatMap(selectScopeLimitations).length,
    unresolvedParityCount: manifest.records.filter(isUnresolvedParity).length,
    verifiedCount: manifest.records.filter(isVerified).length,
  };
}

/**
 * Resolves the exact local and upstream test marker attached to every verified assertion.
 * @param evidence - Assertion-level evidence pairs.
 * @param roots - Local and upstream roots.
 * @param readEvidence - Evidence text reader.
 * @param resolvedEvidence - Mutable resolved-evidence report.
 * @returns Completion after all assertion markers resolve.
 */
async function validateAssertionEvidence(
  evidence: readonly ParityAssertionEvidence[],
  roots: Readonly<{ local: string; upstream: string }>,
  readEvidence: ParityEvidenceReader,
  resolvedEvidence: ResolvedParityEvidence[],
): Promise<void> {
  for (const item of evidence) {
    await validateSide(
      { docs: [], implementation: [], tests: [item.local] },
      "local",
      roots.local,
      readEvidence,
      resolvedEvidence,
    );
    await validateSide(
      { docs: [], implementation: [], tests: [item.upstream] },
      "upstream",
      roots.upstream,
      readEvidence,
      resolvedEvidence,
    );
  }
}

/**
 * Parses one mapping record at its source-array index.
 *
 * @param candidate - Unknown parsed JSON value expected to be one parity mapping record.
 * @param index - Zero-based source index used in validation errors.
 * @returns A strict immutable mapping record.
 * @throws {Error} When required record evidence is absent or malformed.
 */
function parseRecord(candidate: unknown, index: number): ParityMappingRecord {
  if (!isRecord(candidate)) throw new Error(`Parity mapping records[${index}] must be an object.`);
  const id = requireString(candidate, "id");
  if (!/^LO-(?:BASE|CALC|CHART|DRAW|IMPRESS|MATH|SHARED|WRITER)-\d{4}$/.test(id))
    throw new Error(`Invalid parity ID: ${id}`);
  const capabilityId = requireString(candidate, "capabilityId");
  if (!/^CAP-\d{4}$/.test(capabilityId))
    throw new Error(`Invalid domain-agnostic capability ID: ${capabilityId}`);
  const implemented = requireBoolean(candidate, "implemented");
  const contractParity = requireBoolean(candidate, "contractParity");
  const behaviorParity = requireBoolean(candidate, "behaviorParity");
  const defaultParity = requireBoolean(candidate, "defaultParity");
  const verified = requireBoolean(candidate, "verified");
  const gaps = requireStringArray(candidate, "gaps");
  const scopeLimitations = requireStringArray(candidate, "scopeLimitations");
  const assertions = requireStringArray(candidate, "assertions");
  const assertionEvidence = parseAssertionEvidence(candidate.assertionEvidence, id, assertions);
  const maturity = parseMaturity(candidate.maturity, id);
  const manualContract = optionalString(candidate, "manualContract");
  if (assertions.length === 0 && manualContract === undefined)
    throw new Error(`Parity record ${id} requires an upstream assertion or manual contract.`);
  if ((contractParity || behaviorParity || defaultParity || verified) && !implemented)
    throw new Error(`Parity record ${id} cannot claim parity without implementation.`);
  if (verified && (!contractParity || !behaviorParity || !defaultParity))
    throw new Error(
      `Verified parity record ${id} requires contract, behavior, and default parity.`,
    );
  if ((maturity === "verified") !== verified)
    throw new Error(`Parity record ${id} must keep verified maturity and attestation aligned.`);
  if (verified && gaps.length > 0)
    throw new Error(`Verified parity record ${id} must not retain unresolved gaps.`);
  if (
    (contractParity || behaviorParity || defaultParity || verified) &&
    assertionEvidence === undefined
  )
    throw new Error(`Parity claims for ${id} require assertion-level differential evidence.`);
  const exception =
    candidate.exception === undefined
      ? undefined
      : parseException(candidate.exception, `${id}.exception`);
  if (maturity === "exception-approved") {
    if (exception === undefined)
      throw new Error(`Exception-approved parity record ${id} requires an exception.`);
    if (gaps.length === 0)
      throw new Error(`Exception-approved parity record ${id} requires a visible gap.`);
  } else if (exception !== undefined) {
    throw new Error(`Parity exception for ${id} requires exception-approved maturity.`);
  }
  const verification =
    candidate.verification === undefined
      ? undefined
      : parseVerification(candidate.verification, `${id}.verification`);
  if ((verified || maturity === "exception-approved") && verification === undefined)
    throw new Error(`Closed parity record ${id} requires task and commit verification evidence.`);
  if (!verified && maturity !== "exception-approved" && verification !== undefined)
    throw new Error(`Open parity record ${id} may not declare closed verification evidence.`);
  const suite = parseSuite(candidate.suite, id);
  return {
    atomicOperation: requireString(candidate, "atomicOperation"),
    assertions,
    ...(assertionEvidence === undefined ? {} : { assertionEvidence }),
    aspect: parseAspect(candidate.aspect, id),
    behaviorParity,
    capability: requireString(candidate, "capability"),
    capabilityId,
    contractParity,
    defaultParity,
    ...(exception === undefined ? {} : { exception }),
    gaps,
    id,
    implemented,
    local: parseEvidence(candidate.local, `${id}.local`, exception !== undefined),
    ...(manualContract === undefined ? {} : { manualContract }),
    maturity,
    scopeLimitations,
    stackDivergence: parseStackDivergence(candidate.stackDivergence, id),
    subsystem: requireString(candidate, "subsystem"),
    suite,
    type: parseCapabilityType(candidate.type, id),
    upstream: parseEvidence(candidate.upstream, `${id}.upstream`, false, true),
    verified,
    ...(verification === undefined ? {} : { verification }),
  };
}

/** Parses the delivery lifecycle label without deriving any parity attestation. @param candidate - Unknown maturity. @param id - Record ID. @returns Valid maturity. */
function parseMaturity(candidate: unknown, id: string): ParityMaturity {
  if (
    candidate !== "planned" &&
    candidate !== "mapped" &&
    candidate !== "implemented" &&
    candidate !== "verified" &&
    candidate !== "exception-approved"
  )
    throw new Error(`Invalid parity maturity for ${id}.`);
  return candidate;
}

/** Selects explicit out-of-scope limitations for deterministic report counting. @param record - Parsed capability. @returns Capability limitations. */
function selectScopeLimitations(record: ParityMappingRecord): readonly string[] {
  return record.scopeLimitations;
}

/**
 * Parses the architectural layer of one atomic capability.
 * @param candidate - Unknown aspect value.
 * @param id - Owning parity record ID.
 * @returns Validated capability aspect.
 */
function parseAspect(candidate: unknown, id: string): ParityCapabilityAspect {
  if (
    candidate !== "model-operation" &&
    candidate !== "undo-redo" &&
    candidate !== "command-state" &&
    candidate !== "command-placement" &&
    candidate !== "browser-input" &&
    candidate !== "persistence-filter" &&
    candidate !== "compatibility"
  )
    throw new Error(`Invalid parity capability aspect for ${id}.`);
  return candidate;
}

/**
 * Parses exact local/upstream assertion evidence for explicit parity claims.
 * @param candidate - Unknown assertion-evidence array.
 * @param id - Owning parity record ID.
 * @param assertions - Exact claimed assertions.
 * @returns Parsed evidence or undefined when absent.
 */
function parseAssertionEvidence(
  candidate: unknown,
  id: string,
  assertions: readonly string[],
): readonly ParityAssertionEvidence[] | undefined {
  if (candidate === undefined) return undefined;
  if (!Array.isArray(candidate) || candidate.length !== assertions.length)
    throw new Error(`Parity assertion evidence for ${id} must cover every assertion exactly once.`);
  const parsed = candidate.map(
    /** Parses one assertion evidence pair. @param value - Unknown pair. @param index - Assertion index. @returns Validated pair. */
    function parseAssertionReference(value, index): ParityAssertionEvidence {
      if (!isRecord(value)) throw new Error(`${id}.assertionEvidence[${index}] must be an object.`);
      const assertion = requireString(value, "assertion");
      if (assertion !== assertions[index])
        throw new Error(`${id}.assertionEvidence[${index}] must repeat its exact assertion.`);
      return {
        assertion,
        local: parseSingleReference(value.local, `${id}.assertionEvidence[${index}].local`),
        upstream: parseSingleReference(
          value.upstream,
          `${id}.assertionEvidence[${index}].upstream`,
        ),
      };
    },
  );
  return parsed;
}

/**
 * Parses one path-and-marker reference without exception metadata.
 * @param candidate - Unknown evidence reference.
 * @param location - Diagnostic field location.
 * @returns Validated evidence reference.
 */
function parseSingleReference(candidate: unknown, location: string): ParityEvidenceReference {
  if (!isRecord(candidate)) throw new Error(`${location} must be an object.`);
  if (candidate.exception !== undefined)
    throw new Error(`${location} may not replace executable assertion evidence with an exception.`);
  return { marker: requireString(candidate, "marker"), path: requireString(candidate, "path") };
}

/**
 * Parses one architecture-neutral capability type.
 * @param candidate - Unknown authored type.
 * @param id - Owning parity record ID.
 * @returns Validated capability type.
 */
function parseCapabilityType(candidate: unknown, id: string): ParityCapabilityType {
  if (
    candidate !== "command" &&
    candidate !== "model" &&
    candidate !== "filter" &&
    candidate !== "platform" &&
    candidate !== "lifecycle" &&
    candidate !== "infrastructure"
  )
    throw new Error(`Invalid parity capability type for ${id}.`);
  return candidate;
}

/**
 * Parses one supported suite or shared ownership value.
 * @param candidate - Unknown authored suite.
 * @param id - Owning parity record ID.
 * @returns Validated suite ownership.
 */
function parseSuite(candidate: unknown, id: string): ParityMappingRecord["suite"] {
  if (
    candidate !== "shared" &&
    candidate !== "writer" &&
    candidate !== "calc" &&
    candidate !== "impress" &&
    candidate !== "draw" &&
    candidate !== "base" &&
    candidate !== "math" &&
    candidate !== "chart"
  )
    throw new Error(`Invalid parity suite for ${id}.`);
  return candidate;
}

/**
 * Parses the approved Stage 0 stack-divergence classification.
 * @param candidate - Unknown authored divergence object.
 * @param id - Owning parity record ID.
 * @returns Validated divergence classification and rationale.
 */
function parseStackDivergence(candidate: unknown, id: string): ParityStackDivergence {
  if (!isRecord(candidate)) throw new Error(`Stack divergence for ${id} must be an object.`);
  const kind = candidate.kind;
  if (kind !== "none" && kind !== "browser-adaptation" && kind !== "local-infrastructure")
    throw new Error(`Unapproved stack divergence for ${id}.`);
  return { kind, rationale: requireString(candidate, "rationale") };
}

/**
 * Parses task, commit, and verification evidence for a closed parity record.
 * @param candidate - Unknown authored verification object.
 * @param location - Human-readable field location for deterministic errors.
 * @returns Validated task, commit, and executable evidence.
 */
function parseVerification(candidate: unknown, location: string): ParityVerificationEvidence {
  if (!isRecord(candidate)) throw new Error(`${location} must be an object.`);
  const commit = requireString(candidate, "commit");
  if (!/^[0-9a-f]{7,40}$/.test(commit)) throw new Error(`${location}.commit must be a Git hash.`);
  return {
    commit,
    evidence: requireString(candidate, "evidence"),
    scope: parseVerificationScope(candidate.scope, location),
    taskId: requireString(candidate, "taskId"),
  };
}

/** Parses explicit verification breadth. @param candidate - Unknown scope. @param location - Diagnostic location. @returns Bounded or full scope. */
function parseVerificationScope(candidate: unknown, location: string): "bounded" | "full" {
  if (candidate !== "bounded" && candidate !== "full")
    throw new Error(`${location}.scope must equal bounded or full.`);
  return candidate;
}

/**
 * Parses the source, test, and documentation evidence group for one mapping side.
 *
 * @param candidate - Unknown JSON evidence object.
 * @param location - Human-readable record side used in errors.
 * @param allowMissingImplementationAndTests - Whether a whole-capability exception may omit local implementation and test evidence.
 * @param allowTestExceptions - Whether exception metadata is valid on these test references.
 * @returns Strict evidence groups with non-empty references.
 * @throws {Error} When any evidence category is absent or malformed.
 */
function parseEvidence(
  candidate: unknown,
  location: string,
  allowMissingImplementationAndTests: boolean,
  allowTestExceptions = false,
): ParityEvidence {
  if (!isRecord(candidate)) throw new Error(`${location} must be an object.`);
  return {
    docs: parseReferences(candidate.docs, `${location}.docs`, false),
    implementation: parseReferences(
      candidate.implementation,
      `${location}.implementation`,
      allowMissingImplementationAndTests,
    ),
    tests: parseReferences(
      candidate.tests,
      `${location}.tests`,
      allowMissingImplementationAndTests,
      allowTestExceptions,
    ),
  };
}

/**
 * Parses a non-empty evidence-reference array.
 *
 * @param candidate - Unknown JSON candidate expected to be an array of references.
 * @param location - Human-readable field location used in errors.
 * @param allowEmpty - Whether this evidence category may be empty for a whole-capability exception.
 * @param allowExceptions - Whether evidence references in this category may carry test exceptions.
 * @returns Strict path-and-marker references in authored order.
 * @throws {Error} When a reference omits a non-empty path or marker.
 */
function parseReferences(
  candidate: unknown,
  location: string,
  allowEmpty: boolean,
  allowExceptions = false,
): readonly ParityEvidenceReference[] {
  if (!Array.isArray(candidate) || (!allowEmpty && candidate.length === 0))
    throw new Error(`${location} must be a non-empty array.`);
  return candidate.map(
    /**
     * Parses one evidence reference at a deterministic input index.
     *
     * @param reference - Unknown JSON reference.
     * @param index - Zero-based array index used in validation errors.
     * @returns A strict evidence path and marker pair.
     */
    function parseReference(reference: unknown, index: number): ParityEvidenceReference {
      if (!isRecord(reference)) throw new Error(`${location}[${index}] must be an object.`);
      const exception =
        reference.exception === undefined
          ? undefined
          : parseException(reference.exception, `${location}[${index}].exception`);
      if (exception !== undefined && !allowExceptions)
        throw new Error(`${location}[${index}] may not declare a parity exception.`);
      return {
        ...(exception === undefined ? {} : { exception }),
        marker: requireString(reference, "marker"),
        path: requireString(reference, "path"),
      };
    },
  );
}

/**
 * Parses one explicit exception whose approval and browser rationale must remain reviewable.
 *
 * @param candidate - Unknown JSON exception object.
 * @param location - Human-readable field location used in errors.
 * @returns Strict approved-by and rationale evidence.
 * @throws {Error} When either required exception field is absent or blank.
 */
function parseException(candidate: unknown, location: string): ParityException {
  if (!isRecord(candidate)) throw new Error(`${location} must be an object.`);
  if (candidate.disposition !== "not-implementable")
    throw new Error(`${location}.disposition must equal not-implementable.`);
  const reason = candidate.reason;
  if (reason !== "browser-runtime-inapplicable" && reason !== "browser-runtime-supersedes")
    throw new Error(`${location}.reason must name a browser-runtime exception reason.`);
  return {
    approvedBy: requireString(candidate, "approvedBy"),
    disposition: "not-implementable",
    reason,
    rationale: requireString(candidate, "rationale"),
  };
}

/**
 * Collects visible whole-capability and upstream-test exceptions in deterministic evidence order.
 *
 * @param record - Parsed atomic parity record that may own exception metadata.
 * @param exceptions - Mutable report collection owned by the caller.
 * @returns Nothing; exception report entries are appended in stable order.
 */
function collectExceptions(
  record: ParityMappingRecord,
  exceptions: ParityExceptionReportEntry[],
): void {
  if (record.exception !== undefined)
    exceptions.push({ exception: record.exception, id: record.id, scope: "capability" });
  for (const reference of record.upstream.tests) {
    if (reference.exception !== undefined)
      exceptions.push({
        exception: reference.exception,
        id: record.id,
        reference,
        scope: "upstream-test",
      });
  }
}

/**
 * Resolves one side's references in fixed evidence-kind order.
 *
 * @param evidence - Parsed source, test, and documentation evidence.
 * @param side - Local or upstream side whose root must be used.
 * @param root - Prefix prepended to each relative evidence path.
 * @param readEvidence - Injected UTF-8 evidence reader.
 * @param resolvedEvidence - Mutable report collection owned by the caller.
 * @returns A promise resolving after every reference has been checked.
 * @throws {Error} When a marker is absent from a readable referenced file.
 */
async function validateSide(
  evidence: ParityEvidence,
  side: "local" | "upstream",
  root: string,
  readEvidence: ParityEvidenceReader,
  resolvedEvidence: ResolvedParityEvidence[],
): Promise<void> {
  for (const kind of ["implementation", "tests", "docs"] as const) {
    for (const reference of evidence[kind]) {
      const path = `${root}/${reference.path}`;
      const contents = await readEvidence(path);
      if (!contents.includes(reference.marker))
        throw new Error(
          `Parity ${side} ${kind} marker is absent: ${reference.path} :: ${reference.marker}`,
        );
      resolvedEvidence.push({ kind, path: reference.path, side });
    }
  }
}

/**
 * Rejects duplicate or non-lexicographically ordered immutable parity identifiers.
 *
 * @param records - Parsed mapping records in authored order.
 * @returns Nothing; invalid ordering throws an error.
 * @throws {Error} When a parity ID repeats or records are not ordered by ID.
 */
function assertOrderedUniqueIds(records: readonly ParityMappingRecord[]): void {
  for (let index = 1; index < records.length; index += 1) {
    const previous = records[index - 1];
    const current = records[index];
    /* v8 ignore next 3 -- loop bounds prove both indexed records exist; this guard satisfies noUncheckedIndexedAccess. */
    if (previous === undefined || current === undefined)
      throw new Error("Parity mapping record ordering could not be determined.");
    if (previous.id >= current.id)
      throw new Error("Parity mapping records must have unique lexicographically ordered IDs.");
  }
}

/**
 * Rejects duplicate or non-ordered domain-agnostic capability identifiers.
 * @param records - Parsed records in authored order.
 * @returns Nothing after order and uniqueness are proven.
 */
function assertOrderedUniqueCapabilityIds(records: readonly ParityMappingRecord[]): void {
  for (let index = 1; index < records.length; index += 1) {
    const previous = records[index - 1];
    const current = records[index];
    /* v8 ignore next 3 -- loop bounds prove both indexed records exist; this guard satisfies noUncheckedIndexedAccess. */
    if (previous === undefined || current === undefined)
      throw new Error("Capability record ordering could not be determined.");
    if (previous.capabilityId >= current.capabilityId)
      throw new Error("Parity records must have unique ordered capability IDs.");
  }
}

/**
 * Extracts unresolved-gap strings for aggregate counting.
 *
 * @param record - One parsed parity record.
 * @returns The record's visible unresolved gaps.
 */
function selectGaps(record: ParityMappingRecord): readonly string[] {
  return record.gaps;
}

/**
 * Selects implemented-but-unverified records for report counts.
 * @param record - Parsed parity record.
 * @returns Whether implementation exists without verified maturity.
 */
function isImplemented(record: ParityMappingRecord): boolean {
  return record.implemented;
}

/**
 * Selects semantically verified records for report counts.
 * @param record - Parsed parity record.
 * @returns Whether semantic evidence is verified.
 */
function isVerified(record: ParityMappingRecord): boolean {
  return record.verified;
}

/** Selects records with contract parity. @param record - Parsed record. @returns Contract parity state. */
function hasContractParity(record: ParityMappingRecord): boolean {
  return record.contractParity;
}

/** Selects records with behavior parity. @param record - Parsed record. @returns Behavior parity state. */
function hasBehaviorParity(record: ParityMappingRecord): boolean {
  return record.behaviorParity;
}

/** Selects records with default parity. @param record - Parsed record. @returns Default parity state. */
function hasDefaultParity(record: ParityMappingRecord): boolean {
  return record.defaultParity;
}

/** Reports whether one implemented record is fully attested. @param record - Parsed record. @returns Complete parity state. */
function isParityReady(record: ParityMappingRecord): boolean {
  return (
    !record.implemented ||
    (record.contractParity && record.behaviorParity && record.defaultParity && record.verified)
  );
}

/** Selects implemented records with any open parity dimension. @param record - Parsed record. @returns Whether parity remains unresolved. */
function isUnresolvedParity(record: ParityMappingRecord): boolean {
  return record.implemented && !isParityReady(record);
}

/**
 * Parses source text as a JSON object.
 *
 * @param sourceText - UTF-8 JSON source.
 * @param location - Human-readable location used in errors.
 * @returns Parsed JSON object.
 * @throws {Error} When JSON is invalid or the parsed root is not an object.
 */
function parseObject(sourceText: string, location: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(sourceText) as unknown;
    if (!isRecord(parsed)) throw new Error(`${location} must be an object.`);
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("must be an object.")) throw error;
    throw new Error(`${location} must be valid JSON.`, { cause: error });
  }
}

/**
 * Requires a non-empty string value from a parsed object.
 *
 * @param record - Parsed object carrying the required field.
 * @param field - Required field name.
 * @returns Trim-preserving non-empty string.
 * @throws {Error} When the field is missing, non-string, or blank.
 */
function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`Parity mapping ${field} must be a non-empty string.`);
  return value;
}

/** Requires one explicit boolean without truthy coercion. @param record - Parsed object. @param field - Required field. @returns Boolean value. */
function requireBoolean(record: Record<string, unknown>, field: string): boolean {
  const value = record[field];
  if (typeof value !== "boolean")
    throw new Error(`Parity mapping ${field} must be an explicit boolean.`);
  return value;
}

/**
 * Reads an optional non-blank string while rejecting explicit blank values.
 * @param record - Parsed object carrying the optional field.
 * @param field - Optional field name.
 * @returns The authored string or undefined when absent.
 */
function optionalString(record: Record<string, unknown>, field: string): string | undefined {
  const value = record[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`Parity mapping ${field} must be a non-empty string when supplied.`);
  return value;
}

/**
 * Requires an array of non-empty strings from a parsed object.
 *
 * @param record - Parsed object carrying the required field.
 * @param field - Required field name.
 * @returns Strict non-empty strings in authored order.
 * @throws {Error} When the field is not an array of non-empty strings.
 */
function requireStringArray(record: Record<string, unknown>, field: string): readonly string[] {
  const value = record[field];
  if (!Array.isArray(value) || value.some(isNotNonEmptyString))
    throw new Error(`Parity mapping ${field} must be an array of non-empty strings.`);
  return value;
}

/**
 * Determines whether an unknown value is not a non-empty string.
 *
 * @param value - Unknown array member to inspect.
 * @returns True when the value cannot be accepted as a parity gap string.
 */
function isNotNonEmptyString(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

/**
 * Determines whether an unknown JSON value is a non-null object rather than an array.
 *
 * @param value - Unknown parsed JSON value.
 * @returns True only for plain object-shaped values usable as field records.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
