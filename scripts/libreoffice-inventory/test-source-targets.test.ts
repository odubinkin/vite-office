/**
 * @fileoverview Verifies deterministic CppunitTest source-target parsing across literal paths, compiler flags, and unevaluated Make expressions.
 */

import { describe, expect, it } from "vitest";

import { extractCppunitExceptionObjectTargets } from "./test-source-targets";

/** Provides multi-line gbuild exception-object declarations covering all supported target forms. */
const populatedFixture = `$(eval $(call gb_CppunitTest_add_exception_objects,alpha, \\
    zeta/test/Second \\
    alpha/test/First \\
))
$(eval $(call gb_CppunitTest_add_exception_objects,alpha, \\
    alpha/test/First, $(CXXFLAGS_INTRINSICS_AVX2) \\
))
$(eval $(call gb_CppunitTest_add_exception_objects,beta, \\
    $(if $(DISABLE_DYNLOADING),,sal/qa/osl/module/osl_Module) \\
))`;

describe("extractCppunitExceptionObjectTargets" /**
 * Groups canonical parsing, ordering, and malformed declaration cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineSourceTargetTests(): void {
  it("extracts literal source targets while omitting compiler-flag arguments" /**
   * Verifies repeated declarations deduplicate and literal records retain Cppunit provenance.
   *
   * @returns Nothing; assertions validate canonical source-target output.
   */, function extractsLiteralTargets(): void {
    expect(extractCppunitExceptionObjectTargets(populatedFixture)).toEqual([
      { declaredTarget: "alpha/test/First", targetKind: "literal", testName: "alpha" },
      { declaredTarget: "zeta/test/Second", targetKind: "literal", testName: "alpha" },
      {
        declaredTarget: "$(if $(DISABLE_DYNLOADING),,sal/qa/osl/module/osl_Module)",
        targetKind: "expression",
        testName: "beta",
      },
    ]);
  });

  it("returns no records when the makefile has no exception-object declarations" /**
   * Verifies empty input does not manufacture source evidence.
   *
   * @returns Nothing; assertion validates empty source-target output.
   */, function returnsNoRecordsForUnrelatedText(): void {
    expect(extractCppunitExceptionObjectTargets("# unrelated makefile\n")).toEqual([]);
  });

  it("rejects malformed or unclosed exception-object declarations" /**
   * Verifies extractor failures remain explicit instead of silently producing partial provenance.
   *
   * @returns Nothing; assertions validate malformed declaration handling.
   */, function rejectsMalformedDeclarations(): void {
    expectMalformedDeclaration(
      "$(eval $(call gb_CppunitTest_add_exception_objects,, source/path))",
    );
    expectMalformedDeclaration("$(eval $(call gb_CppunitTest_add_exception_objects,alpha,))");
    expectMalformedDeclaration(
      "$(eval $(call gb_CppunitTest_add_exception_objects,alpha, source/path)",
    );
  });
});

/**
 * Expects one malformed exception-object declaration to throw a parser error.
 *
 * @param sourceText - Invalid makefile text to parse.
 * @returns Nothing; assertion validates rejection.
 */
function expectMalformedDeclaration(sourceText: string): void {
  expect(
    /**
     * Invokes the parser under an expected error assertion.
     *
     * @returns Parsing result that never returns for malformed input.
     */
    function extractMalformedDeclaration(): unknown {
      return extractCppunitExceptionObjectTargets(sourceText);
    },
  ).toThrowError();
}
