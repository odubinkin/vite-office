/**
 * @fileoverview Parses exact Cppunit test-registration macro invocations into deterministic names and one-based source lines without retaining C++ test bodies.
 */

/** Identifies the supported Cppunit registration macro that declares one test case. */
export type CppunitRegistrationKind = "CPPUNIT_TEST" | "CPPUNIT_TEST_FIXTURE";

/** Describes one parsed Cppunit registration macro invocation. */
export interface CppunitRegistration {
  /** Optional C++ fixture type supplied by CPPUNIT_TEST_FIXTURE, otherwise null for CPPUNIT_TEST. */
  readonly fixtureName: string | null;
  /** Supported Cppunit registration macro name. */
  readonly kind: CppunitRegistrationKind;
  /** Exact one-based source line on which the registration macro starts. */
  readonly line: number;
  /** Registered C++ test method identifier. */
  readonly testName: string;
}

const registrationPattern =
  /\bCPPUNIT_TEST_FIXTURE\s*\(\s*([A-Za-z_]\w*(?:::[A-Za-z_]\w*)*)\s*,\s*([A-Za-z_]\w*)\s*\)|\bCPPUNIT_TEST\s*\(\s*([A-Za-z_]\w*)\s*\)/gu;

/**
 * Extracts supported Cppunit registration macro invocations from one complete pinned C++ source file.
 *
 * @param sourceText - Complete UTF-8 C++ source text from a tracked Cppunit source-target path.
 * @returns Canonically ordered registrations with exact source lines and no retained source text.
 */
export function extractCppunitRegistrations(sourceText: string): readonly CppunitRegistration[] {
  const registrations = [...sourceText.matchAll(registrationPattern)].map(createRegistration);
  return registrations.sort(compareRegistrations);
}

/**
 * Converts one supported macro regex match into a deterministic Cppunit registration record.
 *
 * @param match - Global regex match containing either fixture and method groups or one test-method group.
 * @returns One parsed registration with its source-line evidence.
 */
function createRegistration(match: RegExpMatchArray): CppunitRegistration {
  const fixtureName = match[1];
  const fixtureTestName = match[2];
  const testName = fixtureTestName ?? match[3];
  /* v8 ignore next -- matchAll supplies index/input and either regex alternative supplies a test name. */
  if (testName === undefined || match.index === undefined || match.input === undefined) {
    throw new Error("Malformed internal Cppunit registration match.");
  }
  return {
    fixtureName: fixtureName ?? null,
    kind: fixtureTestName === undefined ? "CPPUNIT_TEST" : "CPPUNIT_TEST_FIXTURE",
    line: countLineAtOffset(match.input, match.index),
    testName,
  };
}

/**
 * Counts the one-based source line that contains an offset in complete source text.
 *
 * @param sourceText - Complete source text containing the offset.
 * @param offset - Zero-based character offset within sourceText.
 * @returns One-based source line that contains offset.
 */
function countLineAtOffset(sourceText: string, offset: number): number {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (sourceText[index] === "\n") line += 1;
  }
  return line;
}

/**
 * Orders registrations by source line, macro kind, fixture name, then test method name.
 *
 * @param left - First parsed Cppunit registration.
 * @param right - Second parsed Cppunit registration.
 * @returns Negative or positive deterministic comparison result for unique records.
 */
function compareRegistrations(left: CppunitRegistration, right: CppunitRegistration): number {
  const leftKey = `${left.line}\0${left.kind}\0${left.fixtureName}\0${left.testName}`;
  const rightKey = `${right.line}\0${right.kind}\0${right.fixtureName}\0${right.testName}`;
  return leftKey < rightKey ? -1 : 1;
}
