/** @fileoverview Native ordered replacement rules from SwRewriter.cxx; logical UTF-16 strings preserve literal replacement text without a second formatter. */
import { SwUndoArg } from "../../../inc/SwRewriter";
/** Original value-owned replacement rule vector. */
export class SwRewriter {
  private readonly mRules: [SwUndoArg, string][] = [];
  /** Original default and implicit value-copy construction. @param source - Optional actual source rule vector. @returns Independent rule owner. */
  constructor(source?: SwRewriter) {
    if (source)
      for (const [what, replacement] of source.mRules) this.mRules.push([what, replacement]);
  }
  /** Original existing-key replacement keeps its vector position; new keys append. @param what - Original argument identity. @param replacement - Literal logical text. @returns Nothing. */
  AddRule(what: SwUndoArg, replacement: string): void {
    const index = this.mRules.findIndex(
      /** Finds the original rule key. @param rule - Value-owned rule. @returns Whether identical. */ (
        rule,
      ) => rule[0] === what,
    );
    if (index < 0) this.mRules.push([what, replacement]);
    else this.mRules[index] = [what, replacement];
  }
  /** Original ordered replaceAll permits cascading rules and treats dollar signs literally. @param value - Original logical text. @returns New immutable logical text. */
  Apply(value: string): string {
    let result = value;
    for (const [what, replacement] of this.mRules)
      result = result.replaceAll(
        SwRewriter.GetPlaceHolder(what),
        /** JS callback preserves source literal dollar/backtick replacement semantics. @returns Literal replacement. */ () =>
          replacement,
      );
    return result;
  }
  /** Original switch retains its argument-one fallback for an unknown identity. @param what - Source enum value. @returns Native placeholder. */
  static GetPlaceHolder(what: SwUndoArg): string {
    switch (what) {
      case SwUndoArg.UndoArg2:
        return "$2";
      case SwUndoArg.UndoArg3:
        return "$3";
      case SwUndoArg.UndoArg1:
      default:
        return "$1";
    }
  }
}
