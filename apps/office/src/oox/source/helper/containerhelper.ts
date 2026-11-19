/** @fileoverview Original ValueRangeSet insertion from containerhelper.cxx. Source lower-bound, adjacency and intersection ordering is retained verbatim in value semantics, including its suspected adjacency defect. */
import { ValueRange } from "../../inc/helper/containerhelper";
/** Original vector owner; no sorted-set replacement or range normalization is introduced. */
export class ValueRangeSet {
  private readonly maRanges: ValueRange[] = [];
  /** Original implicit copy owns independent range values. @param source - Optional original set. @returns Set. */
  constructor(source?: ValueRangeSet) {
    if (source !== undefined)
      for (const range of source.maRanges) this.maRanges.push(new ValueRange(range));
  }
  /** Original lower_bound with end-vs-start comparison and source merge/insert order. Signed overflow and subsequent lower_bound on an unsorted vector remain unqualified native domains. @param range - Actual borrowed range. @returns Nothing. */
  insert(range: Readonly<ValueRange>): void {
    let first = 0,
      count = this.maRanges.length;
    while (count > 0) {
      const step = Math.trunc(count / 2),
        middle = first + step;
      if ((this.maRanges[middle] as ValueRange).mnLast < range.mnFirst) {
        first = middle + 1;
        count -= step + 1;
      } else count = step;
    }
    let index = first;
    if (index !== this.maRanges.length && (this.maRanges[index] as ValueRange).contains(range))
      return;
    if (index !== 0 && (this.maRanges[index - 1] as ValueRange).mnLast + 1 === range.mnFirst)
      --index;
    if (index !== this.maRanges.length && (this.maRanges[index] as ValueRange).intersects(range)) {
      const current = this.maRanges[index] as ValueRange;
      current.mnFirst = Math.min(current.mnFirst, range.mnFirst);
      let next = index + 1;
      while (next !== this.maRanges.length && (this.maRanges[next] as ValueRange).intersects(range))
        ++next;
      current.mnLast = Math.max((this.maRanges[next - 1] as ValueRange).mnLast, range.mnLast);
      this.maRanges.splice(index + 1, next - index - 1);
    } else this.maRanges.splice(index, 0, new ValueRange(range));
  }
  /** Original borrowed const vector; callers must not mutate it or rely on native iterator stability after insertion. @returns Current ranges. */
  getRanges(): readonly Readonly<ValueRange>[] {
    return this.maRanges;
  }
}
