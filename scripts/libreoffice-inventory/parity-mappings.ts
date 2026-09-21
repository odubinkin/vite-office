/**
 * @fileoverview Parses and validates authored atomic parity mappings that connect the pinned LibreOffice baseline to local implementation, test, and documentation evidence.
 */

import type { BaselineManifest } from "./contracts";
import {
  assertOrderedUniqueRecords,
  isRecord,
  optionalString,
  parseEvidence,
  parseException,
  parseObject,
  parseSingleReference,
  requireBoolean,
  requireString,
  requireStringArray,
  validateSide,
} from "./parity-mapping-support";

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

/** Names each independently evidenced parity closure parity dimension. */
export type ParityClosureDimension =
  | "behavior"
  | "contract"
  | "defaults"
  | "differential"
  | "operationCycle"
  | "ownership"
  | "serialization";

/** Records executable evidence, or an explicit non-applicable disposition, for one dimension. */
export interface ParityDimensionEvidence {
  readonly local?: ParityEvidenceReference;
  readonly method:
    | "api-invariant"
    | "browser-test"
    | "not-applicable"
    | "pinned-fixture"
    | "source-derived-golden"
    | "unit-test";
  readonly rationale: string;
  readonly status: "not-applicable" | "pass";
  readonly upstream?: ParityEvidenceReference;
}

/** Classifies one remaining browser adaptation or excluded desktop-only boundary. */
export interface ParityDivergenceEvidence {
  readonly classification: "B" | "X";
  readonly description: string;
  readonly local: ParityEvidenceReference;
  readonly upstream: ParityEvidenceReference;
}

/** Provides complete parity closure evidence for one bounded capability. */
export interface ParityClosureEvidence {
  readonly behavior: ParityDimensionEvidence;
  readonly contract: ParityDimensionEvidence;
  readonly defaults: ParityDimensionEvidence;
  readonly differential: ParityDimensionEvidence;
  readonly divergences: readonly ParityDivergenceEvidence[];
  readonly operationCycle: ParityDimensionEvidence;
  readonly ownership: ParityDimensionEvidence;
  readonly serialization: ParityDimensionEvidence;
}

/** One resolved parity closure reference included in the inventory report. */
export interface ResolvedParityClosureEvidence {
  readonly dimension: ParityClosureDimension | "divergence";
  readonly path: string;
  readonly side: "local" | "upstream";
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
  /** Executable contract, ownership, behavior, default, serialization, lifecycle, differential, and divergence evidence. */
  readonly closure?: ParityClosureEvidence;
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
  readonly schemaVersion: 6;
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
  /** Number of classified B and X differences retained after closure. */
  readonly classifiedDivergenceCount: number;
  /** Number of verified records with executable differential evidence. */
  readonly differentialParityCount: number;
  /** Number of verified records with explicit ownership evidence. */
  readonly ownershipParityCount: number;
  /** Exact resolved parity dimension and divergence references. */
  readonly closureEvidence: readonly ResolvedParityClosureEvidence[];
  /** Number of explicit out-of-scope limitations retained by bounded capability records. */
  readonly scopeLimitationCount: number;
  /** Total bounded capability records. */
  readonly recordCount: number;
  /** Successfully resolved evidence paths in stable record and evidence order. */
  readonly resolvedEvidence: readonly ResolvedParityEvidence[];
  /** Static report schema version. */
  readonly schemaVersion: 6;
  /** Number of verified records whose relevant serialization dimension passed or was explicitly inapplicable. */
  readonly serializationParityCount: number;
  /** Remaining differences without a B or X disposition; always zero for a valid schema-six manifest. */
  readonly unclassifiedDivergenceCount: number;
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
  if (root.schemaVersion !== 6) throw new Error("Parity mapping schemaVersion must equal 6.");
  const baselineCommit = requireString(root, "baselineCommit");
  const baselineTag = requireString(root, "baselineTag");
  if (baselineCommit !== baseline.commit)
    throw new Error("Parity mapping baseline commit does not match.");
  if (baselineTag !== baseline.tag) throw new Error("Parity mapping baseline tag does not match.");
  if (!Array.isArray(root.records) || root.records.length === 0)
    throw new Error("Parity mapping records must be a non-empty array.");
  const records = root.records.map(parseRecord);
  assertOrderedUniqueRecords(records);
  return { baselineCommit, baselineTag, records, schemaVersion: 6 };
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
  const closureEvidence: ResolvedParityClosureEvidence[] = [];
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
    if (record.closure !== undefined)
      closureEvidence.push(
        ...(await validateParityClosureEvidence(record.closure, roots, readEvidence)),
      );
    collectExceptions(record, exceptions);
  }
  return {
    baselineCommit: manifest.baselineCommit,
    behaviorParityCount: manifest.records.filter(hasBehaviorParity).length,
    classifiedDivergenceCount: manifest.records.flatMap(selectClassifiedDivergences).length,
    contractParityCount: manifest.records.filter(hasContractParity).length,
    defaultParityCount: manifest.records.filter(hasDefaultParity).length,
    differentialParityCount: manifest.records.filter(hasDifferentialParity).length,
    exceptionCount: exceptions.length,
    exceptions,
    gapCount: manifest.records.flatMap(selectGaps).length,
    implementedCount: manifest.records.filter(isImplemented).length,
    parityReady: manifest.records.every(isParityReady),
    ownershipParityCount: manifest.records.filter(hasOwnershipParity).length,
    closureEvidence,
    recordCount: manifest.records.length,
    resolvedEvidence,
    schemaVersion: 6,
    serializationParityCount: manifest.records.filter(hasSerializationParity).length,
    scopeLimitationCount: manifest.records.flatMap(selectScopeLimitations).length,
    unresolvedParityCount: manifest.records.filter(isUnresolvedParity).length,
    unclassifiedDivergenceCount: 0,
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

const closureDimensions = [
  "contract",
  "ownership",
  "behavior",
  "defaults",
  "serialization",
  "operationCycle",
  "differential",
] as const satisfies readonly ParityClosureDimension[];

/** Parses complete closure evidence. @param candidate - Candidate closure. @param id - Record ID. @param scopeLimitations - X boundaries. @param stackKind - Stack classification. @returns Parsed closure. */
export function parseParityClosure(
  candidate: unknown,
  id: string,
  scopeLimitations: readonly string[],
  stackKind: ParityStackDivergence["kind"],
): ParityClosureEvidence {
  if (!isRecord(candidate)) throw new Error(`parity closure for ${id} must be an object.`);
  const parsed = Object.fromEntries(
    closureDimensions.map(
      /** Parses one named dimension entry. @param dimension - Dimension name. @returns Dimension and evidence pair. */
      function parseDimensionEntry(dimension) {
        return [dimension, parseParityClosureDimension(candidate[dimension], id, dimension)];
      },
    ),
  ) as unknown as Omit<ParityClosureEvidence, "divergences">;
  const divergences = parseParityDivergences(candidate.divergences, id);
  for (const dimension of [
    "contract",
    "ownership",
    "behavior",
    "defaults",
    "differential",
  ] as const) {
    if (parsed[dimension].status !== "pass")
      throw new Error(`Verified parity record ${id} requires passing ${dimension} evidence.`);
  }
  if (
    parsed.differential.method !== "pinned-fixture" &&
    parsed.differential.method !== "source-derived-golden"
  ) {
    throw new Error(
      `Verified parity record ${id} requires differential fixture or golden evidence.`,
    );
  }
  validateParityDivergences(divergences, scopeLimitations, stackKind, id);
  return { ...parsed, divergences };
}

/** Parses one parity dimension. @param candidate - Candidate evidence. @param id - Record ID. @param dimension - Dimension name. @returns Parsed evidence. */
function parseParityClosureDimension(
  candidate: unknown,
  id: string,
  dimension: ParityClosureDimension,
): ParityDimensionEvidence {
  const location = `${id}.closure.${dimension}`;
  if (!isRecord(candidate)) throw new Error(`${location} must be an object.`);
  const status = candidate.status;
  const method = candidate.method;
  if (
    method !== "api-invariant" &&
    method !== "browser-test" &&
    method !== "unit-test" &&
    method !== "pinned-fixture" &&
    method !== "source-derived-golden" &&
    method !== "not-applicable"
  ) {
    throw new Error(`${location}.method is invalid.`);
  }
  const rationale = requireString(candidate, "rationale");
  if (status === "not-applicable") {
    if (
      method !== "not-applicable" ||
      candidate.local !== undefined ||
      candidate.upstream !== undefined
    )
      throw new Error(`${location} must be evidence-free and use the not-applicable method.`);
    return { method, rationale, status };
  }
  if (status !== "pass" || method === "not-applicable")
    throw new Error(`${location} pass evidence needs an executable method.`);
  return {
    local: parseSingleReference(candidate.local, `${location}.local`),
    method,
    rationale,
    status,
    upstream: parseSingleReference(candidate.upstream, `${location}.upstream`),
  };
}

/** Parses B/X divergence evidence. @param candidate - Candidate list. @param id - Record ID. @returns Parsed divergences. */
function parseParityDivergences(
  candidate: unknown,
  id: string,
): readonly ParityDivergenceEvidence[] {
  if (!Array.isArray(candidate)) throw new Error(`${id}.closure.divergences must be an array.`);
  return candidate.map(
    /** Parses one divergence. @param value - Candidate divergence. @param index - Array index. @returns Parsed divergence. */
    function parseDivergence(value, index): ParityDivergenceEvidence {
      const location = `${id}.closure.divergences[${index}]`;
      if (!isRecord(value)) throw new Error(`${location} must be an object.`);
      if (value.classification !== "B" && value.classification !== "X")
        throw new Error(`${location}.classification must equal B or X.`);
      return {
        classification: value.classification,
        description: requireString(value, "description"),
        local: parseSingleReference(value.local, `${location}.local`),
        upstream: parseSingleReference(value.upstream, `${location}.upstream`),
      };
    },
  );
}

/** Validates divergence coverage. @param divergences - Classified differences. @param scopeLimitations - X boundaries. @param stackKind - Stack classification. @param id - Record ID. @returns Nothing after validation. */
function validateParityDivergences(
  divergences: readonly ParityDivergenceEvidence[],
  scopeLimitations: readonly string[],
  stackKind: ParityStackDivergence["kind"],
  id: string,
): void {
  const browserCount = divergences.filter(
    /** Selects browser adaptations. @param item - Divergence evidence. @returns Whether it is class B. */
    function isBrowser(item): boolean {
      return item.classification === "B";
    },
  ).length;
  if (stackKind === "browser-adaptation" && browserCount === 0)
    throw new Error(`parity record ${id} must classify its browser adaptation as B.`);
  if (stackKind === "none" && browserCount > 0)
    throw new Error(`parity record ${id} may not claim B without a browser adaptation.`);
  if (stackKind === "local-infrastructure")
    throw new Error(`parity record ${id} must remove class A local infrastructure before closure.`);
  const excluded = divergences
    .filter(
      /** Selects exclusions. @param item - Divergence evidence. @returns Whether it is class X. */
      function isExcluded(item): boolean {
        return item.classification === "X";
      },
    )
    .map(
      /** Selects the classified description. @param item - Divergence evidence. @returns Description. */
      function selectDescription(item): string {
        return item.description;
      },
    );
  if (
    excluded.length !== scopeLimitations.length ||
    excluded.some(
      /** Compares one classified limitation. @param value - Classified text. @param index - Source index. @returns Whether it differs. */
      function differs(value, index): boolean {
        return value !== scopeLimitations[index];
      },
    )
  )
    throw new Error(`parity record ${id} must classify every scope limitation as X in order.`);
}

/** Resolves closure markers. @param closure - Parsed closure. @param roots - Evidence roots. @param readEvidence - Text reader. @returns Resolved evidence. */
export async function validateParityClosureEvidence(
  closure: ParityClosureEvidence,
  roots: Readonly<{ local: string; upstream: string }>,
  readEvidence: ParityEvidenceReader,
): Promise<readonly ResolvedParityClosureEvidence[]> {
  const resolved: ResolvedParityClosureEvidence[] = [];
  for (const dimension of closureDimensions) {
    const evidence = closure[dimension];
    if (evidence.status === "pass") {
      await resolveParityClosureReference(
        evidence.local,
        dimension,
        "local",
        roots.local,
        readEvidence,
        resolved,
      );
      await resolveParityClosureReference(
        evidence.upstream,
        dimension,
        "upstream",
        roots.upstream,
        readEvidence,
        resolved,
      );
    }
  }
  for (const divergence of closure.divergences) {
    await resolveParityClosureReference(
      divergence.local,
      "divergence",
      "local",
      roots.local,
      readEvidence,
      resolved,
    );
    await resolveParityClosureReference(
      divergence.upstream,
      "divergence",
      "upstream",
      roots.upstream,
      readEvidence,
      resolved,
    );
  }
  return resolved;
}

/** Resolves one closure marker. @param reference - Marker reference. @param dimension - Dimension name. @param side - Evidence side. @param root - Evidence root. @param readEvidence - Text reader. @param resolved - Result accumulator. @returns Completion after resolution. */
async function resolveParityClosureReference(
  reference: ParityEvidenceReference | undefined,
  dimension: ParityClosureDimension | "divergence",
  side: "local" | "upstream",
  root: string,
  readEvidence: ParityEvidenceReader,
  resolved: ResolvedParityClosureEvidence[],
): Promise<void> {
  if (reference === undefined)
    throw new Error(`Missing ${dimension} ${side} parity closure evidence.`);
  const contents = await readEvidence(`${root}/${reference.path}`);
  if (!contents.includes(reference.marker))
    throw new Error(
      `parity closure ${side} ${dimension} marker is absent: ${reference.path} :: ${reference.marker}`,
    );
  resolved.push({ dimension, path: reference.path, side });
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
  const stackDivergence = parseStackDivergence(candidate.stackDivergence, id);
  const closure =
    candidate.closure === undefined
      ? undefined
      : parseParityClosure(candidate.closure, id, scopeLimitations, stackDivergence.kind);
  if (verified && closure === undefined)
    throw new Error(`Verified parity record ${id} requires complete parity closure evidence.`);
  if (!verified && closure !== undefined)
    throw new Error(`Open parity record ${id} may not declare parity closure evidence.`);
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
    ...(closure === undefined ? {} : { closure }),
    scopeLimitations,
    stackDivergence,
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

/** Selects classified parity closure differences. @param record - Parsed record. @returns B/X evidence records. */
function selectClassifiedDivergences(record: ParityMappingRecord): readonly unknown[] {
  return record.closure?.divergences ?? [];
}

/** Selects records with explicit ownership parity evidence. @param record - Parsed record. @returns Ownership parity state. */
function hasOwnershipParity(record: ParityMappingRecord): boolean {
  return record.verified && record.closure?.ownership.status === "pass";
}

/** Selects records with relevant serialization closure. @param record - Parsed record. @returns Serialization parity state. */
function hasSerializationParity(record: ParityMappingRecord): boolean {
  return record.verified && record.closure?.serialization.status !== undefined;
}

/** Selects records with executable differential closure. @param record - Parsed record. @returns Differential parity state. */
function hasDifferentialParity(record: ParityMappingRecord): boolean {
  return record.verified && record.closure?.differential.status === "pass";
}

/** Reports whether one implemented record is fully attested. @param record - Parsed record. @returns Complete parity state. */
function isParityReady(record: ParityMappingRecord): boolean {
  return (
    !record.implemented ||
    (record.contractParity &&
      record.behaviorParity &&
      record.defaultParity &&
      record.verified &&
      record.closure !== undefined)
  );
}

/** Selects implemented records with any open parity dimension. @param record - Parsed record. @returns Whether parity remains unresolved. */
function isUnresolvedParity(record: ParityMappingRecord): boolean {
  return record.implemented && !isParityReady(record);
}
