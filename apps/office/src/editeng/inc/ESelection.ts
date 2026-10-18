/** @fileoverview Original EditEngine selection value from include/editeng/ESelection.hxx. */
import { EPaM, EE_PARA_MAX, EE_TEXTPOS_MAX } from "./EPaM";

/** Two paragraph/index values; assignment copies values while field references remain stable. */
export class ESelection {
  private readonly startValue = new EPaM();
  private readonly endValue = new EPaM();

  /** Original mutable start member. @returns Borrowed position value. */
  public get start(): EPaM {
    return this.startValue;
  }
  /** Original start member value assignment. @param position - Copied position. @returns Nothing. */
  public set start(position: EPaM) {
    this.startValue.assign(position);
  }
  /** Original mutable end member. @returns Borrowed position value. */
  public get end(): EPaM {
    return this.endValue;
  }
  /** Original end member value assignment. @param position - Copied position. @returns Nothing. */
  public set end(position: EPaM) {
    this.endValue.assign(position);
  }

  /** Original default, cursor, explicit EPaM, four-coordinate and implicit copy constructors. @param args - Original value-constructor arguments. @returns Selection value. */
  public constructor(
    ...args:
      | []
      | [position: EPaM]
      | [source: ESelection]
      | [paragraph: number, index: number]
      | [startPara: number, startPos: number, endPara: number, endPos: number]
  ) {
    const first = args[0];
    if (first instanceof ESelection) this.assign(first);
    else if (first instanceof EPaM) {
      this.start = first;
      this.end = first;
    } else if (first !== undefined) {
      this.start = new EPaM(first, args[1] as number);
      this.end = args.length === 4 ? new EPaM(args[2] as number, args[3] as number) : this.start;
    }
  }
  /** Original whole-text sentinel range. @returns Fresh selection. */
  public static All(): ESelection {
    return new ESelection(0, 0, EE_PARA_MAX, EE_TEXTPOS_MAX);
  }
  /** Original collapsed end marker. @returns Fresh cursor. */
  public static AtEnd(): ESelection {
    return new ESelection(EE_PARA_MAX, EE_TEXTPOS_MAX);
  }
  /** Original implicit memberwise value assignment. @param source - Copied selection. @returns This selection. */
  public assign(source: ESelection): this {
    this.start = source.start;
    this.end = source.end;
    return this;
  }
  /** Original ordered-endpoint predicate. @returns Whether end is not before start. */
  public IsAdjusted(): boolean {
    return !this.end.lessThan(this.start);
  }
  /** Original value swap when endpoints are reversed; borrowed fields keep their identity. @returns Nothing. */
  public Adjust(): void {
    if (!this.IsAdjusted()) {
      const position = new EPaM(this.start);
      this.start = this.end;
      this.end = position;
    }
  }
  /** Original copy of start into end, without aliasing the two members. @returns Nothing. */
  public CollapseToStart(): void {
    this.end = this.start;
  }
  /** Original copy of end into start, without aliasing the two members. @returns Nothing. */
  public CollapseToEnd(): void {
    this.start = this.end;
  }
  /** Original defaulted memberwise equality, without normalizing direction. @param other - Compared selection. @returns Whether both endpoint values equal. */
  public equals(other: ESelection): boolean {
    return this.start.equals(other.start) && this.end.equals(other.end);
  }
  /** Original strict disjoint-interval order; both operands must be adjusted as asserted in native debug builds. @param other - Adjusted selection. @returns Whether this end precedes the other start. */
  public lessThan(other: ESelection): boolean {
    return this.end.lessThan(other.start);
  }
  /** Original reversed strict disjoint-interval comparison. @param other - Adjusted selection. @returns Whether the other end precedes this start. */
  public greaterThan(other: ESelection): boolean {
    return other.lessThan(this);
  }
  /** Original non-collapsed endpoint predicate. @returns Whether any range exists. */
  public HasRange(): boolean {
    return !this.start.equals(this.end);
  }
  /** Original diagnostic stream content without a native ostream binding. @returns Selection description. */
  public toString(): string {
    return `ESelection(${this.start.nPara},${this.start.nIndex},${this.end.nPara},${this.end.nIndex})`;
  }
}
