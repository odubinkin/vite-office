/**
 * @fileoverview Supplies shared JSON, evidence, ordering, and exception helpers for parity inventory parsing.
 */

/** Browser-runtime exception metadata shared by mapping evidence. */
export interface SupportException {
  readonly approvedBy: string;
  readonly disposition: "not-implementable";
  readonly reason: "browser-runtime-inapplicable" | "browser-runtime-supersedes";
  readonly rationale: string;
}

/** Exact marker reference used by the shared resolver. */
export interface SupportReference {
  readonly exception?: SupportException;
  readonly marker: string;
  readonly path: string;
}

/** Three evidence categories required on each mapping side. */
export interface SupportEvidence {
  readonly docs: readonly SupportReference[];
  readonly implementation: readonly SupportReference[];
  readonly tests: readonly SupportReference[];
}

/** Resolved reference shape appended to the parent report. */
export interface SupportResolvedEvidence {
  readonly kind: "docs" | "implementation" | "source" | "tests";
  readonly path: string;
  readonly side: "local" | "upstream";
}

/** Parses source text as a JSON object. @param sourceText - JSON source. @param location - Diagnostic location. @returns Parsed object. */
export function parseObject(sourceText: string, location: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(sourceText) as unknown;
    if (!isRecord(parsed)) throw new Error(`${location} must be an object.`);
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("must be an object.")) throw error;
    throw new Error(`${location} must be valid JSON.`, { cause: error });
  }
}

/** Requires a non-empty string field. @param record - Parsed object. @param field - Field name. @returns Non-empty string. */
export function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`Parity mapping ${field} must be a non-empty string.`);
  return value;
}

/** Requires one explicit boolean without coercion. @param record - Parsed object. @param field - Field name. @returns Boolean value. */
export function requireBoolean(record: Record<string, unknown>, field: string): boolean {
  const value = record[field];
  if (typeof value !== "boolean")
    throw new Error(`Parity mapping ${field} must be an explicit boolean.`);
  return value;
}

/** Reads an optional non-blank string. @param record - Parsed object. @param field - Field name. @returns String or undefined. */
export function optionalString(record: Record<string, unknown>, field: string): string | undefined {
  const value = record[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`Parity mapping ${field} must be a non-empty string when supplied.`);
  return value;
}

/** Requires an array of non-empty strings. @param record - Parsed object. @param field - Field name. @returns String array. */
export function requireStringArray(
  record: Record<string, unknown>,
  field: string,
): readonly string[] {
  const value = record[field];
  if (
    !Array.isArray(value) ||
    value.some(
      /** Checks one candidate array item. @param item - Candidate value. @returns Whether the item is invalid. */
      function isInvalidString(item): boolean {
        return typeof item !== "string" || item.trim().length === 0;
      },
    )
  ) {
    throw new Error(`Parity mapping ${field} must be an array of non-empty strings.`);
  }
  return value;
}

/** Narrows an unknown JSON value to an object record. @param value - Candidate value. @returns Whether the value is an object record. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Rejects duplicate or non-ordered identifiers. @param records - Ordered records. @returns Nothing after validation. */
export function assertOrderedUniqueRecords(
  records: readonly Readonly<{ capabilityId: string; id: string }>[],
): void {
  for (let index = 1; index < records.length; index += 1) {
    const previous = records[index - 1];
    const current = records[index];
    /* v8 ignore next 2 -- loop bounds prove both indexed records exist. */
    if (previous === undefined || current === undefined)
      throw new Error("Parity mapping record ordering could not be determined.");
    if (previous.id >= current.id)
      throw new Error("Parity mapping records must have unique lexicographically ordered IDs.");
    if (previous.capabilityId >= current.capabilityId)
      throw new Error("Parity records must have unique ordered capability IDs.");
  }
}

/** Parses one evidence group. @param candidate - Candidate group. @param location - Diagnostic location. @param allowMissingImplementationAndTests - Whether implementation/tests may be empty. @param allowTestExceptions - Whether test exceptions are permitted. @returns Parsed evidence. */
export function parseEvidence(
  candidate: unknown,
  location: string,
  allowMissingImplementationAndTests: boolean,
  allowTestExceptions = false,
): SupportEvidence {
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

/** Parses one exact marker reference. @param candidate - Candidate reference. @param location - Diagnostic location. @returns Parsed reference. */
export function parseSingleReference(candidate: unknown, location: string): SupportReference {
  if (!isRecord(candidate)) throw new Error(`${location} must be an object.`);
  if (candidate.exception !== undefined)
    throw new Error(`${location} may not replace executable assertion evidence with an exception.`);
  return { marker: requireString(candidate, "marker"), path: requireString(candidate, "path") };
}

/** Parses one approved browser exception. @param candidate - Candidate exception. @param location - Diagnostic location. @returns Parsed exception. */
export function parseException(candidate: unknown, location: string): SupportException {
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

/** Resolves one side's evidence references. @param evidence - Evidence group. @param side - Mapping side. @param root - Evidence root. @param readEvidence - Text reader. @param resolvedEvidence - Result accumulator. @returns Completion after resolution. */
export async function validateSide(
  evidence: SupportEvidence,
  side: "local" | "upstream",
  root: string,
  readEvidence: (path: string) => Promise<string>,
  resolvedEvidence: SupportResolvedEvidence[],
): Promise<void> {
  for (const kind of ["implementation", "tests", "docs"] as const) {
    for (const reference of evidence[kind]) {
      const contents = await readEvidence(`${root}/${reference.path}`);
      if (!contents.includes(reference.marker))
        throw new Error(
          `Parity ${side} ${kind} marker is absent: ${reference.path} :: ${reference.marker}`,
        );
      resolvedEvidence.push({ kind, path: reference.path, side });
    }
  }
}

/** Parses references. @param candidate - Candidate array. @param location - Diagnostic location. @param allowEmpty - Whether empty is allowed. @param allowExceptions - Whether exceptions are allowed. @returns Parsed references. */
function parseReferences(
  candidate: unknown,
  location: string,
  allowEmpty: boolean,
  allowExceptions = false,
): readonly SupportReference[] {
  if (!Array.isArray(candidate) || (!allowEmpty && candidate.length === 0))
    throw new Error(`${location} must be a non-empty array.`);
  return candidate.map(
    /** Parses one reference. @param reference - Candidate reference. @param index - Array index. @returns Parsed reference. */
    function parseReference(reference, index): SupportReference {
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
