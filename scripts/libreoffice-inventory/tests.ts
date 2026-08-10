/**
 * @fileoverview Parses pinned LibreOffice gbuild test-constructor grep lines into canonical unmapped test records without copying upstream source content.
 */

import type { CoreTestInventory, CoreTestKind, CoreTestRecord } from "./contracts";

/** Immutable declaration counts observed from the pinned libreoffice-26.8.0.2 core test constructors. */
export const expectedCoreTestCounts: Readonly<Record<CoreTestKind, number>> = {
  CppunitTest: 415,
  JunitTest: 58,
  PythonTest: 13,
  UITest: 79,
};

const testKinds: readonly CoreTestKind[] = ["CppunitTest", "JunitTest", "PythonTest", "UITest"];

/**
 * Creates a canonical full test-constructor inventory from Git grep output grouped by constructor family.
 *
 * @param coreCommit - Immutable core commit shared by every record.
 * @param grepOutputByKind - Raw git grep -n output indexed by the four supported constructor families.
 * @returns A deterministic inventory whose counts meet the pinned baseline declaration contract.
 * @throws {Error} When a grep line is malformed, duplicated, or has an unexpected family count.
 */
export function createCoreTestInventory(
  coreCommit: string,
  grepOutputByKind: Readonly<Record<CoreTestKind, string>>,
): CoreTestInventory {
  const records = testKinds.flatMap(
    /**
     * Parses every grep line supplied for one declared constructor family.
     *
     * @param kind - Constructor family whose raw Git output is being parsed.
     * @returns Canonical records parsed from the family output.
     */
    function parseKindOutput(kind: CoreTestKind): readonly CoreTestRecord[] {
      return parseGrepOutput(coreCommit, kind, grepOutputByKind[kind]);
    },
  );
  const summary = createSummary(records);
  assertExpectedCounts(summary);
  assertUniqueRecords(records);

  return {
    coreCommit,
    corpusId: "core",
    generatedBy: "inventory:tests",
    records: [...records].sort(compareRecords),
    schemaVersion: 1,
    summary,
  };
}

/**
 * Parses all non-empty Git grep lines for one constructor family.
 *
 * @param coreCommit - Pinned core commit to attach to each record.
 * @param kind - Constructor family expected in every supplied line.
 * @param output - Raw git grep -n output for the family.
 * @returns Parsed constructor records in raw Git output order.
 * @throws {Error} When a non-empty output line is not one exact expected constructor invocation.
 */
function parseGrepOutput(
  coreCommit: string,
  kind: CoreTestKind,
  output: string,
): readonly CoreTestRecord[] {
  return output
    .split("\n")
    .filter(isConstructorInvocationLine)
    .map(
      /**
       * Parses one raw Git grep line into its strict provenance-only record.
       *
       * @param line - Non-empty git grep -n line to parse.
       * @returns One typed upstream test-constructor record.
       */
      function parseLine(line: string): CoreTestRecord {
        return parseGrepLine(coreCommit, kind, line);
      },
    );
}

/**
 * Parses one exact Git grep line containing an expected gbuild test constructor invocation.
 *
 * @param coreCommit - Pinned core commit to attach to the parsed record.
 * @param kind - Required constructor family.
 * @param grepLine - Raw path:line:source Git grep output.
 * @returns A provenance-only unmapped test record.
 * @throws {Error} When the line does not contain the exact expected constructor invocation.
 */
function parseGrepLine(coreCommit: string, kind: CoreTestKind, grepLine: string): CoreTestRecord {
  const linePattern = new RegExp(`^(.+):(\\d+):.*gb_${kind}_${kind},\\s*([^,\\s)]+)\\s*\\)`, "u");
  const match = linePattern.exec(grepLine);
  const referencePath = match?.[1];
  const lineValue = match?.[2];
  const testName = match?.[3];

  if (referencePath === undefined || lineValue === undefined || testName === undefined) {
    throw new Error(`Malformed ${kind} Git grep line: ${grepLine}`);
  }

  const line = Number(lineValue);
  if (!Number.isSafeInteger(line) || line < 1) {
    throw new Error(`Invalid ${kind} declaration line: ${lineValue}`);
  }

  return {
    commit: coreCommit,
    corpusId: "core",
    id: `LO-CORE-TEST:${kind}:${referencePath}:${line}`,
    kind,
    line,
    mappingStatus: "unmapped",
    referencePath,
    testName,
  };
}

/**
 * Produces the exact per-family test-constructor counts from parsed records.
 *
 * @param records - Parsed records in any order.
 * @returns Immutable count summary covering all supported constructor families.
 */
function createSummary(records: readonly CoreTestRecord[]): Readonly<Record<CoreTestKind, number>> {
  const summary: Record<CoreTestKind, number> = {
    CppunitTest: 0,
    JunitTest: 0,
    PythonTest: 0,
    UITest: 0,
  };

  for (const record of records) {
    summary[record.kind] += 1;
  }

  return summary;
}

/**
 * Rejects incomplete or unexpectedly expanded declaration sets against the pinned baseline contract.
 *
 * @param summary - Observed per-family test constructor counts.
 * @returns Nothing; mismatched counts throw an error.
 * @throws {Error} When one family count differs from the pinned declaration count.
 */
function assertExpectedCounts(summary: Readonly<Record<CoreTestKind, number>>): void {
  for (const kind of testKinds) {
    if (summary[kind] !== expectedCoreTestCounts[kind]) {
      throw new Error(`Unexpected ${kind} declaration count: ${summary[kind]}`);
    }
  }
}

/**
 * Rejects repeated stable record IDs so a malformed grep input cannot silently collapse provenance evidence.
 *
 * @param records - Parsed test-constructor records before canonical sorting.
 * @returns Nothing; duplicate IDs throw an error.
 * @throws {Error} When any record ID appears more than once.
 */
function assertUniqueRecords(records: readonly CoreTestRecord[]): void {
  const ids = new Set(records.map(selectRecordId));
  if (ids.size !== records.length) {
    throw new Error("Core test inventory input contains duplicate declaration records.");
  }
}

/**
 * Extracts a record ID for duplicate detection.
 *
 * @param record - Parsed test-constructor record.
 * @returns Stable declaration record ID.
 */
function selectRecordId(record: CoreTestRecord): string {
  return record.id;
}

/**
 * Determines whether one raw Git grep line invokes a supported test constructor rather than defining its gbuild macro.
 *
 * @param line - Candidate split output line.
 * @returns True only when the line contains a supported constructor followed by an argument separator.
 */
function isConstructorInvocationLine(line: string): boolean {
  return /gb_(CppunitTest|JunitTest|PythonTest|UITest)_\1,/u.test(line);
}

/**
 * Orders test records by kind, path, line, then name for byte-stable generated output.
 *
 * @param left - First test record to compare.
 * @param right - Second test record to compare.
 * @returns Negative, zero, or positive deterministic comparison result.
 */
function compareRecords(left: CoreTestRecord, right: CoreTestRecord): number {
  const leftKey = `${left.kind}\0${left.referencePath}\0${left.line}\0${left.testName}`;
  const rightKey = `${right.kind}\0${right.referencePath}\0${right.line}\0${right.testName}`;
  return leftKey < rightKey ? -1 : 1;
}
