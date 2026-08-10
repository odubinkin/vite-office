/**
 * @fileoverview Adapts the shared gbuild source-list parser to pinned CppunitTest exception-object declarations.
 */

import {
  extractGbuildSourceTargets,
  type GbuildSourceTarget,
  type GbuildSourceTargetKind,
} from "./gbuild-source-targets";

/** Identifies whether a CppunitTest exception-object target is literal or an unevaluated Make expression. */
export type CppunitSourceTargetKind = GbuildSourceTargetKind;

/** Describes one extensionless source target declared by a CppunitTest exception-object macro. */
export type CppunitSourceTarget = GbuildSourceTarget;

/**
 * Extracts deterministic source-target tokens from one pinned CppunitTest makefile's exception-object declarations.
 *
 * @param sourceText - Complete UTF-8 makefile text read from the pinned core checkout.
 * @returns Unique source targets ordered by test name, target kind, then code-unit target value.
 * @throws {Error} When a selected exception-object macro is malformed or unclosed.
 */
export function extractCppunitExceptionObjectTargets(
  sourceText: string,
): readonly CppunitSourceTarget[] {
  return extractGbuildSourceTargets(sourceText, "gb_CppunitTest_add_exception_objects");
}
