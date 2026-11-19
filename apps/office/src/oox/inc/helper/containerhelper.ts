/** @fileoverview Original signed32 ValueRange and public ValueRangeSet boundary from containerhelper.hxx. Other container/template helpers remain unported. */
/** Original value range preserves endpoints without ordering or validation. */
export class ValueRange {
  mnFirst: number;
  mnLast: number;
  /** Original single/two-endpoint and implicit-copy constructors. @param first - Native value or actual source range. @param last - Optional native last value. @returns Independent range. */
  constructor(first: number | Readonly<ValueRange>, last?: number) {
    this.mnFirst = typeof first === "number" ? first | 0 : first.mnFirst;
    this.mnLast = typeof first === "number" ? (last ?? first) | 0 : first.mnLast;
  }
  /** Original endpoint equality. @param other - Actual range. @returns Equality. */
  equals(other: Readonly<ValueRange>): boolean {
    return this.mnFirst === other.mnFirst && this.mnLast === other.mnLast;
  }
  /** Original negated equality. @param other - Actual range. @returns Inequality. */
  notEquals(other: Readonly<ValueRange>): boolean {
    return !this.equals(other);
  }
  /** Original inclusive endpoint containment, including source behavior for reversed ranges. @param other - Actual range. @returns Containment. */
  contains(other: Readonly<ValueRange>): boolean {
    return this.mnFirst <= other.mnFirst && other.mnLast <= this.mnLast;
  }
  /** Original inclusive intersection, without adjacency expansion. @param other - Actual range. @returns Intersection. */
  intersects(other: Readonly<ValueRange>): boolean {
    return this.mnFirst <= other.mnLast && other.mnFirst <= this.mnLast;
  }
}
export { ValueRangeSet } from "../../source/helper/containerhelper";
