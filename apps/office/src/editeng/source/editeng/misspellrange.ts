/** @fileoverview Original value constructors from misspellrange.cxx; size_t values use native JS BigInt, without a memory manager or binary buffer layout. */
/** Original unsigned64 size_t range value on the pinned64-bit target. */
export class MisspellRange {
  public mnStart: bigint;
  public mnEnd: bigint;
  /** Original explicit/implicit-copy value construction. @param args - Range endpoints or copied value. @returns Range. */
  constructor(...args: [start: bigint, end: bigint] | [source: Readonly<MisspellRange>]) {
    this.mnStart = BigInt.asUintN(64, args.length === 1 ? args[0].mnStart : args[0]);
    this.mnEnd = BigInt.asUintN(64, args.length === 1 ? args[0].mnEnd : args[1]);
  }
}
/** Original paragraph/range vector value. Native rvalue lifetime syntax is erased; no caller-reset operation is invented. */
export class MisspellRanges {
  public mnParagraph: number;
  public maRanges: MisspellRange[];
  /** Original explicit/implicit-copy value construction. @param args - Paragraph/ranges or copied value. @returns Paragraph ranges. */
  constructor(
    ...args:
      | [paragraph: number, ranges: readonly Readonly<MisspellRange>[]]
      | [source: Readonly<MisspellRanges>]
  ) {
    this.mnParagraph = (args.length === 1 ? args[0].mnParagraph : args[0]) | 0;
    const ranges = args.length === 1 ? args[0].maRanges : args[1];
    this.maRanges = Array.from(
      ranges,
      /** Copies one actual declared vector value. @param value - Source range. @returns Independent value. */
      (value) => new MisspellRange(value),
    );
  }
}
