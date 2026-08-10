/**
 * @fileoverview Verifies deterministic UITest module-root parsing, normalization, deduplication, and rejected declaration forms.
 */

import { describe, expect, it } from "vitest";

import { extractUITestModuleRootTargets } from "./ui-test-module-roots";

describe("extractUITestModuleRootTargets" /**
 * Groups supported UITest module-root parsing and unsupported declaration rejection.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineUITestModuleRootTests(): void {
  it("extracts literal and expression module roots with normalized trailing slashes and deterministic deduplication" /**
   * Verifies no module root is silently duplicated or reordered by source formatting.
   *
   * @returns Nothing; assertions validate canonical parsed records.
   */, function extractsCanonicalTargets(): void {
    expect(
      extractUITestModuleRootTargets(`
        $(eval $(call gb_UITest_add_modules,beta,$(SRCDIR)/beta/qa/uitest,\\
          dialogs/ nested/module/ $(if $(FLAG),conditional/) dialogs/ \\
        ))
      `),
    ).toEqual([
      {
        declaredModuleRoot: "$(if $(FLAG),conditional/)",
        sourceDirectory: "beta/qa/uitest",
        targetKind: "expression",
        testName: "beta",
      },
      {
        declaredModuleRoot: "dialogs",
        sourceDirectory: "beta/qa/uitest",
        targetKind: "literal",
        testName: "beta",
      },
      {
        declaredModuleRoot: "nested/module",
        sourceDirectory: "beta/qa/uitest",
        targetKind: "literal",
        testName: "beta",
      },
    ]);
  });

  it("returns no targets for absent macros and rejects malformed, non-source-root, dynamic, empty, and unclosed declarations" /**
   * Verifies parser failure is explicit instead of guessing how to evaluate unsupported Make syntax.
   *
   * @returns Nothing; assertions validate rejected declaration forms.
   */, function rejectsUnsupportedDeclarations(): void {
    expect(extractUITestModuleRootTargets("all:; @true")).toEqual([]);
    expectParseError("$(eval $(call gb_UITest_add_modules,alpha,$(SRCDIR)/alpha))");
    expectParseError("$(eval $(call gb_UITest_add_modules,alpha,/tmp,dialogs/))");
    expectParseError("$(eval $(call gb_UITest_add_modules,alpha,$(SRCDIR)/$(AREA),dialogs/))");
    expectParseError("$(eval $(call gb_UITest_add_modules,alpha,$(SRCDIR)/alpha,/))");
    expectParseError("$(eval $(call gb_UITest_add_modules,alpha,$(SRCDIR)/alpha,dialogs/");
  });
});

/**
 * Expects one unsupported UITest makefile declaration to throw an explicit parser error.
 *
 * @param sourceText - Complete or deliberately malformed makefile text to parse.
 * @returns Nothing; assertion validates the expected parser failure.
 */
function expectParseError(sourceText: string): void {
  expect(
    /**
     * Invokes UITest module-root parsing under an expected error assertion.
     *
     * @returns Parsed targets that never return for invalid input.
     */
    function parseInvalidSource(): unknown {
      return extractUITestModuleRootTargets(sourceText);
    },
  ).toThrowError();
}
