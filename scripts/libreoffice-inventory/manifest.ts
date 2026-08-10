/**
 * @fileoverview Parses and validates the strict, minimal subset of the pinned LibreOffice baseline manifest needed by inventory tooling.
 */

import type {
  BaselineCorpus,
  BaselineManifest,
  CorpusId,
  CorpusShape,
  ValidationIssue,
} from "./contracts";
import { BaselineValidationError } from "./contracts";

const requiredCorpusIds = ["core", "dictionaries", "helpcontent2", "translations"] as const;

/**
 * Parses JSON text and returns a validated version-two baseline manifest.
 *
 * @param sourceText - UTF-8 JSON document read from the project baseline file.
 * @returns The strict inventory subset of the baseline manifest.
 * @throws {BaselineValidationError} When JSON or the expected manifest contract is invalid.
 */
export function parseBaselineManifest(sourceText: string): BaselineManifest {
  let parsed: unknown;

  try {
    parsed = JSON.parse(sourceText) as unknown;
  } catch {
    throwManifestError("json", "valid JSON", "invalid JSON");
  }

  if (!isRecord(parsed)) {
    throwManifestError("root", "object", describeValue(parsed));
  }

  const schemaVersion = parsed.schemaVersion;
  if (schemaVersion !== 2) {
    throwManifestError("schemaVersion", "2", describeValue(schemaVersion));
  }

  const manifest = {
    commit: requireString(parsed, "commit"),
    corpora: parseCorpora(parsed.corpora),
    referencePath: requireString(parsed, "referencePath"),
    repository: requireString(parsed, "repository"),
    schemaVersion: 2 as const,
    tag: requireString(parsed, "tag"),
    tagObject: requireString(parsed, "tagObject"),
  };

  validateCoreAgreement(manifest);
  return manifest;
}

/**
 * Parses and validates the complete required corpus list.
 *
 * @param candidate - Unknown manifest corpora value.
 * @returns Validated corpus declarations in manifest order.
 * @throws {BaselineValidationError} When corpus entries are missing, duplicated, or malformed.
 */
function parseCorpora(candidate: unknown): readonly BaselineCorpus[] {
  if (!Array.isArray(candidate)) {
    throwManifestError("corpora", "array", describeValue(candidate));
  }

  const corpora = candidate.map(
    /**
     * Parses one manifest corpus entry by its deterministic input index.
     *
     * @param corpus - Unknown corpus declaration from parsed JSON.
     * @param index - Zero-based position used only for malformed-entry diagnostics.
     * @returns A validated corpus declaration.
     */
    function parseCorpusAtIndex(corpus: unknown, index: number): BaselineCorpus {
      return parseCorpus(corpus, index);
    },
  );
  const ids = new Set(
    corpora.map(
      /**
       * Extracts one corpus identifier for uniqueness validation.
       *
       * @param corpus - Validated corpus declaration.
       * @returns The declaration's stable identifier.
       */
      function selectCorpusId(corpus: BaselineCorpus): CorpusId {
        return corpus.id;
      },
    ),
  );

  if (ids.size !== corpora.length) {
    throwManifestError("corpora", "unique corpus IDs", `${ids.size} unique IDs`);
  }

  for (const id of requiredCorpusIds) {
    if (!ids.has(id)) {
      throwManifestError("corpora", `required corpus ${id}`, "missing");
    }
  }

  return corpora;
}

/**
 * Parses one baseline corpus declaration.
 *
 * @param candidate - Unknown JSON value expected to describe one corpus.
 * @param index - Zero-based input position for diagnostics.
 * @returns A validated corpus declaration.
 * @throws {BaselineValidationError} When one required field is invalid.
 */
function parseCorpus(candidate: unknown, index: number): BaselineCorpus {
  if (!isRecord(candidate)) {
    throwManifestError(`corpora[${index}]`, "object", describeValue(candidate));
  }

  const corpusShape = parseCorpusShape(candidate.corpusShape);

  return {
    commit: requireString(candidate, "commit"),
    ...(corpusShape === undefined ? {} : { corpusShape }),
    id: requireCorpusId(candidate.id, index),
    referencePath: requireString(candidate, "referencePath"),
    repository: requireString(candidate, "repository"),
    tagObject: requireString(candidate, "tagObject"),
    trackedFiles: requirePositiveInteger(candidate, "trackedFiles"),
  };
}

/**
 * Parses optional corpus-specific acquisition floors.
 *
 * @param candidate - Unknown JSON value that may contain corpus shape information.
 * @returns Undefined when omitted, otherwise a validated shape object.
 * @throws {BaselineValidationError} When a supplied shape field is invalid.
 */
function parseCorpusShape(candidate: unknown): CorpusShape | undefined {
  if (candidate === undefined) {
    return undefined;
  }

  if (!isRecord(candidate)) {
    throwManifestError("corpusShape", "object", describeValue(candidate));
  }

  const affFiles = optionalPositiveInteger(candidate, "affFiles");
  const dictionaryFiles = optionalPositiveInteger(candidate, "dictionaryFiles");
  const localeDirectories = optionalPositiveInteger(candidate, "localeDirectories");
  const poCatalogs = optionalPositiveInteger(candidate, "poCatalogs");
  const xhpTopics = optionalPositiveInteger(candidate, "xhpTopics");

  return {
    ...(affFiles === undefined ? {} : { affFiles }),
    ...(dictionaryFiles === undefined ? {} : { dictionaryFiles }),
    ...(localeDirectories === undefined ? {} : { localeDirectories }),
    ...(poCatalogs === undefined ? {} : { poCatalogs }),
    ...(xhpTopics === undefined ? {} : { xhpTopics }),
  };
}

/**
 * Ensures the top-level core identity exactly agrees with the core corpus declaration.
 *
 * @param manifest - Parsed baseline manifest whose duplicated core fields must agree.
 * @returns Nothing; inconsistent data throws a validation error.
 * @throws {BaselineValidationError} When top-level and core-corpus identity fields disagree.
 */
function validateCoreAgreement(manifest: BaselineManifest): void {
  const core = manifest.corpora.find(
    /**
     * Identifies the required core corpus declaration.
     *
     * @param corpus - Parsed corpus declaration to inspect.
     * @returns True only for the core corpus.
     */
    function isCoreCorpus(corpus: BaselineCorpus): boolean {
      return corpus.id === "core";
    },
  ) as BaselineCorpus;

  const fields = ["commit", "referencePath", "repository", "tagObject"] as const;
  for (const field of fields) {
    if (manifest[field] !== core[field]) {
      throwManifestError(`core.${field}`, manifest[field], core[field]);
    }
  }
}

/**
 * Reads a mandatory non-empty string property from a manifest object.
 *
 * @param record - Parsed JSON object containing the property.
 * @param field - Required property name.
 * @returns The validated string value.
 * @throws {BaselineValidationError} When the property is absent, non-string, or blank.
 */
function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throwManifestError(field, "non-empty string", describeValue(value));
  }

  return value;
}

/**
 * Reads a mandatory positive integer property from a manifest object.
 *
 * @param record - Parsed JSON object containing the property.
 * @param field - Required property name.
 * @returns The validated positive integer.
 * @throws {BaselineValidationError} When the property is not a positive integer.
 */
function requirePositiveInteger(record: Record<string, unknown>, field: string): number {
  const value = record[field];
  if (!isPositiveInteger(value)) {
    throwManifestError(field, "positive integer", describeValue(value));
  }

  return value;
}

/**
 * Reads an optional positive integer property from a manifest object.
 *
 * @param record - Parsed JSON object containing the property.
 * @param field - Optional property name.
 * @returns Undefined when omitted, otherwise the validated positive integer.
 * @throws {BaselineValidationError} When a supplied property is not a positive integer.
 */
function optionalPositiveInteger(
  record: Record<string, unknown>,
  field: string,
): number | undefined {
  const value = record[field];
  if (value === undefined) {
    return undefined;
  }

  if (!isPositiveInteger(value)) {
    throwManifestError(field, "positive integer", describeValue(value));
  }

  return value;
}

/**
 * Validates that a JSON value is one of the four corpus identifiers.
 *
 * @param value - Unknown candidate corpus identifier.
 * @param index - Input location used for a useful error field.
 * @returns The validated corpus identifier.
 * @throws {BaselineValidationError} When the identifier is not supported.
 */
function requireCorpusId(value: unknown, index: number): CorpusId {
  if (typeof value !== "string" || !requiredCorpusIds.includes(value as CorpusId)) {
    throwManifestError(`corpora[${index}].id`, requiredCorpusIds.join(", "), describeValue(value));
  }

  return value as CorpusId;
}

/**
 * Determines whether a value is a non-null JSON object.
 *
 * @param value - Unknown candidate value.
 * @returns True only for plain object-like records.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Determines whether a value is a positive safe integer.
 *
 * @param value - Unknown candidate numeric value.
 * @returns True only for positive safe integers.
 */
function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

/**
 * Produces a deterministic type-oriented value description for validation errors.
 *
 * @param value - Unknown value to describe without serializing arbitrary objects.
 * @returns Stable scalar or type description.
 */
function describeValue(value: unknown): string {
  return typeof value === "string" ? JSON.stringify(value) : typeof value;
}

/**
 * Throws one structured manifest validation error.
 *
 * @param field - Manifest field or invariant that failed.
 * @param expected - Required value or shape.
 * @param actual - Observed invalid value or shape.
 * @returns Never returns because it always throws.
 * @throws {BaselineValidationError} Always throws the described contract error.
 */
function throwManifestError(field: string, expected: string, actual: string): never {
  const issue: ValidationIssue = { actual, corpusId: "manifest", expected, field };
  throw new BaselineValidationError([issue]);
}
