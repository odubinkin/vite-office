/**
 * @fileoverview Verifies Cppunit registration parsing across ordinary and multiline fixture macro forms.
 */

import { describe, expect, it } from "vitest";

import { extractCppunitRegistrations } from "./cppunit-registrations";

describe("extractCppunitRegistrations" /**
 * Groups supported registration parsing and no-match behavior.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineCppunitRegistrationTests(): void {
  it("extracts ordinary and multiline fixture registrations with exact source lines" /**
   * Verifies parser normalization handles whitespace while retaining macro family and fixture provenance.
   *
   * @returns Nothing; assertions validate canonical parsed registrations.
   */, function extractsRegistrations(): void {
    expect(
      extractCppunitRegistrations(`
      CPPUNIT_TEST(firstTest);
      CPPUNIT_TEST_FIXTURE(Fixture::Nested, secondTest)
      CPPUNIT_TEST_FIXTURE(Fixture,
                           thirdTest)
    `),
    ).toEqual([
      { fixtureName: null, kind: "CPPUNIT_TEST", line: 2, testName: "firstTest" },
      {
        fixtureName: "Fixture::Nested",
        kind: "CPPUNIT_TEST_FIXTURE",
        line: 3,
        testName: "secondTest",
      },
      { fixtureName: "Fixture", kind: "CPPUNIT_TEST_FIXTURE", line: 4, testName: "thirdTest" },
    ]);
  });

  it("returns no registrations for unrelated C++ text" /**
   * Verifies absent supported macros do not manufacture inferred test registrations.
   *
   * @returns Nothing; assertion validates empty-input behavior.
   */, function returnsNoRegistrations(): void {
    expect(extractCppunitRegistrations("int main() { return 0; }")).toEqual([]);
  });
});
