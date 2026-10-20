/** @fileoverview Original SearchResult.idl generated value struct over real shared Sequence<sal_Int32> owners. Directional offsets are not normalized by the struct. */
import { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
/** Borrowed generated struct fields; const sequence access is the caller contract. */
export interface SearchResultConstReference {
  readonly subRegExpressions: number;
  readonly startOffset: Sequence<[number]>;
  readonly endOffset: Sequence<[number]>;
}
/** Compiler-emitted binding of the original sequence<long>, with actual signed32 scalar-cell addresses. */
const Longs = Sequence.specialize<[number]>("sal_Int32", 4);
/** Original zero/default, full and copy value, retaining separate sequence objects and native shared handles/COW. */
export class SearchResult implements SearchResultConstReference {
  public subRegExpressions: number;
  private readonly starts: Sequence<[number]>;
  private readonly ends: Sequence<[number]>;
  /** Original generated constructors. @param args - Default, borrowed source or native IDL field order. @returns Independent struct value. */
  public constructor(
    ...args:
      | []
      | [source: SearchResultConstReference]
      | [subRegExpressions: number, startOffset: Sequence<[number]>, endOffset: Sequence<[number]>]
  ) {
    if (args.length === 0) {
      this.subRegExpressions = 0;
      this.starts = new Longs();
      this.ends = new Longs();
    } else if (args.length === 1) {
      this.subRegExpressions = args[0].subRegExpressions;
      this.starts = new Longs(args[0].startOffset);
      this.ends = new Longs(args[0].endOffset);
    } else {
      this.subRegExpressions = args[0];
      this.starts = new Longs(args[1]);
      this.ends = new Longs(args[2]);
    }
  }
  /** Native stable start sequence member. @returns Borrowed sequence owner. */
  public get startOffset(): Sequence<[number]> {
    return this.starts;
  }
  /** Native sequence value assignment. @param value - Borrowed source sequence. @returns Nothing. */
  public set startOffset(value: Sequence<[number]>) {
    this.starts.assign(value);
  }
  /** Native stable end sequence member. @returns Borrowed sequence owner. */
  public get endOffset(): Sequence<[number]> {
    return this.ends;
  }
  /** Native sequence value assignment. @param value - Borrowed source sequence. @returns Nothing. */
  public set endOffset(value: Sequence<[number]>) {
    this.ends.assign(value);
  }
  /** Original generated memberwise assignment, including self-assignment. @param source - Borrowed complete value. @returns This owner. */
  public assign(source: SearchResultConstReference): this {
    this.subRegExpressions = source.subRegExpressions;
    this.startOffset = source.startOffset;
    this.endOffset = source.endOffset;
    return this;
  }
  /** Original generated operator== in IDL field order. @param other - Borrowed complete value. @returns Exact native field equality. */
  public equals(other: SearchResultConstReference): boolean {
    return (
      this.subRegExpressions === other.subRegExpressions &&
      this.startOffset.operatorEquals(other.startOffset) &&
      this.endOffset.operatorEquals(other.endOffset)
    );
  }
  /** Original generated operator!=. @param other - Borrowed complete value. @returns Negated value equality. */
  public notEquals(other: SearchResultConstReference): boolean {
    return !this.equals(other);
  }
  /** Erases the generated struct destructor; caller ends each owned lifetime once. @returns Nothing. */
  public dispose(): void {
    this.ends.dispose();
    this.starts.dispose();
  }
}
