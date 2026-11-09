/** @fileoverview Original ICU UnicodeSet inversion-list membership for compiled scalar sets. */
const UNICODESET_HIGH = 0x110000;

/** Immutable scalar set whose inversion list comes from the native constructor. */
export class UnicodeSet {
  private readonly list: readonly number[];

  /** Adopts an immutable list of original inclusive/exclusive range bounds. @param ranges - Sorted pairs of bounds. @returns Immutable set owner. */
  constructor(ranges: readonly number[]) {
    this.list =
      ranges[ranges.length - 1] === UNICODESET_HIGH ? ranges : [...ranges, UNICODESET_HIGH];
  }

  /** Original inversion-list membership query. @param c - Scalar or sentinel. @returns Membership. */
  contains(c: number): boolean {
    return c < UNICODESET_HIGH && (this.findCodePoint(c) & 1) !== 0;
  }

  /** Finds the first bound strictly greater than the scalar. @param c - Original code point. @returns Inversion-list index. */
  private findCodePoint(c: number): number {
    const list = this.list;
    if (c < (list[0] as number)) return 0;
    let lo = 0;
    let hi = list.length - 1;
    if (lo >= hi || c >= (list[hi - 1] as number)) return hi;
    for (;;) {
      const i = (lo + hi) >> 1;
      if (i === lo) break;
      if (c < (list[i] as number)) hi = i;
      else lo = i;
    }
    return hi;
  }
}
