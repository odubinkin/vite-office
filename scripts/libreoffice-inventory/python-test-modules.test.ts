/**
 * @fileoverview Verifies deterministic PythonTest source-directory and module token extraction from gbuild add-modules declarations.
 */

import { describe, expect, it } from "vitest";

import { extractPythonTestModuleTargets } from "./python-test-modules";

/** Provides PythonTest module declarations covering ordering, deduplication, continuation lines, and a nested Make expression. */
const populatedFixture = `$(eval $(call gb_PythonTest_add_modules,alpha,$(SRCDIR)/alpha/qa/python, \\
    zeta \\
    alpha \\
))
$(eval $(call gb_PythonTest_add_modules,alpha,$(SRCDIR)/alpha/qa/python, \\
    alpha \\
))
$(eval $(call gb_PythonTest_add_modules,beta,$(SRCDIR)/beta/qa/python, \\
    $(if $(ENABLE_BETA),conditional) \\
))`;

describe("extractPythonTestModuleTargets" /**
 * Groups canonical Python module extraction and guarded directory/argument failure cases.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function definePythonModuleParserTests(): void {
  it("extracts ordered module records with their exact SRCDIR-relative directories" /**
   * Verifies duplicate literals collapse while unevaluated module expressions remain explicit.
   *
   * @returns Nothing; assertions validate canonical Python module output.
   */, function extractsModuleTargets(): void {
    expect(extractPythonTestModuleTargets(populatedFixture)).toEqual([
      {
        declaredModule: "alpha",
        sourceDirectory: "alpha/qa/python",
        targetKind: "literal",
        testName: "alpha",
      },
      {
        declaredModule: "zeta",
        sourceDirectory: "alpha/qa/python",
        targetKind: "literal",
        testName: "alpha",
      },
      {
        declaredModule: "$(if $(ENABLE_BETA),conditional)",
        sourceDirectory: "beta/qa/python",
        targetKind: "expression",
        testName: "beta",
      },
    ]);
  });

  it("returns no records when the makefile has no PythonTest module declarations" /**
   * Verifies unrelated makefile content does not manufacture module evidence.
   *
   * @returns Nothing; assertion validates empty parser output.
   */, function returnsNoRecordsForUnrelatedText(): void {
    expect(extractPythonTestModuleTargets("# unrelated makefile\n")).toEqual([]);
  });

  it("rejects malformed declarations, unsupported directories, and unclosed macros" /**
   * Verifies parser failures stay explicit instead of silently resolving arbitrary Make syntax.
   *
   * @returns Nothing; assertions validate guarded parser failure behavior.
   */, function rejectsInvalidPythonDeclarations(): void {
    expectInvalidDeclaration("$(eval $(call gb_PythonTest_add_modules,alpha,$(SRCDIR)/alpha,))");
    expectInvalidDeclaration("$(eval $(call gb_PythonTest_add_modules,alpha,/tmp, module))");
    expectInvalidDeclaration(
      "$(eval $(call gb_PythonTest_add_modules,alpha,$(SRCDIR)/$(DYNAMIC), module))",
    );
    expectInvalidDeclaration(
      "$(eval $(call gb_PythonTest_add_modules,alpha,$(SRCDIR)/alpha,module)",
    );
  });
});

/**
 * Expects one invalid PythonTest makefile declaration to throw a parser error.
 *
 * @param sourceText - Invalid PythonTest makefile text to parse.
 * @returns Nothing; assertion validates rejection.
 */
function expectInvalidDeclaration(sourceText: string): void {
  expect(
    /**
     * Invokes the Python module parser under an expected error assertion.
     *
     * @returns Parsing result that never returns for invalid input.
     */
    function extractInvalidPythonDeclaration(): unknown {
      return extractPythonTestModuleTargets(sourceText);
    },
  ).toThrowError();
}
