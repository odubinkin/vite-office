/** @fileoverview Original owning TextPortionList and TextPortionList.cxx positional algorithms. */
import { TextPortion } from "./TextPortion";
/** Original unique-owner sequence; contained values use ordinary managed storage. */
export class TextPortionList {
  private readonly maPortions: TextPortion[] = [];
  /** Original vector clear. @returns Nothing. */
  Reset(): void {
    this.maPortions.length = 0;
  }
  /** Original suffix erase in its defined source index domain. @param from - First removed index. @returns Nothing. */
  DeleteFromPortion(from: number): void {
    this.maPortions.splice(from);
  }
  /** Original count. @returns Count. */
  Count(): number {
    return this.maPortions.length;
  }
  /** Original operator[] borrowed value. @param position - Valid source index. @returns Actual owner. */
  at(position: number): TextPortion {
    return this.maPortions[position] as TextPortion;
  }
  /** Original unique-owner append. @param portion - Transferred value. @returns Nothing. */
  Append(portion: TextPortion): void {
    this.maPortions.push(portion);
  }
  /** Original unique-owner insert. @param position - Valid source insertion index. @param portion - Transferred value. @returns Nothing. */
  Insert(position: number, portion: TextPortion): void {
    this.maPortions.splice(position, 0, portion);
  }
  /** Original owner erase. @param position - Valid source index. @returns Nothing. */
  Remove(position: number): void {
    this.maPortions.splice(position, 1);
  }
  /** Original raw pointer lookup and SAL_MAX_INT32 not-found marker. @param portion - Borrowed identity. @returns Source index or sentinel. */
  GetPos(portion: TextPortion): number {
    const index = this.maPortions.indexOf(portion);
    return index < 0 ? 0x7fffffff : index;
  }
  /** Original boundary preference and failed-search output preservation. @param position - Raw character position. @param start - Source mutable portion-start lvalue. @param preferStarting - Prefer a portion beginning at a boundary. @returns Index, or original last index on failure. */
  FindPortion(position: number, start: [number], preferStarting = false): number {
    let current = 0;
    for (let index = 0; index < this.maPortions.length; index++) {
      const portion = this.at(index);
      current += portion.GetLen();
      if (
        current >= position &&
        (current !== position || !preferStarting || index === this.maPortions.length - 1)
      ) {
        start[0] = current - portion.GetLen();
        return index;
      }
    }
    return this.maPortions.length - 1;
  }
  /** Original cumulative start before a valid portion. @param portion - Original portion index. @returns Raw position. */
  GetStartPos(portion: number): number {
    let start = 0;
    for (let i = 0; i < portion; i++) start += this.at(i).GetLen();
    return start;
  }
  /** Original one-empty-portion predicate; a zero-element list is not empty by this definition. @returns Source predicate. */
  isEmpty(): boolean {
    return this.Count() === 1 && this.at(0).GetLen() === 0;
  }
  /** Original ordered vector iteration. @returns Borrowed iterator. */
  [Symbol.iterator](): IterableIterator<TextPortion> {
    return this.maPortions.values();
  }
}
