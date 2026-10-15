/** @fileoverview Original IndexedStyleSheets vector/name/family index and callback contracts. JS references own values; exact UTF16 Map keys replace native unordered buckets without a lifetime library. */
import { SfxStyleFamily, type SfxStyleSheetNameReference } from "../../inc/style";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type {
  StyleSheetPredicate,
  StyleSheetDisposer,
  StyleSheetCallback,
} from "../../inc/IndexedStyleSheets";

/** Original nested selection enum, exposed on the class as well as its module-language type binding. */
export enum SearchBehavior {
  ReturnAll,
  ReturnFirst,
}
/** Original six-family mapping; unsupported values violate the native assertion contract. @param family - Style family. @returns Original index. */
function family_to_index(family: SfxStyleFamily): number {
  switch (family) {
    case SfxStyleFamily.Char:
      return 0;
    case SfxStyleFamily.Para:
      return 1;
    case SfxStyleFamily.Frame:
      return 2;
    case SfxStyleFamily.Page:
      return 3;
    case SfxStyleFamily.Pseudo:
      return 4;
    case SfxStyleFamily.Table:
      return 5;
    default:
      throw new Error("assert(false): unsupported IndexedStyleSheets family");
  }
}
/** Native OUString equality projected into a logical UTF16 Map key. @param name - Original name. @returns Exact primitive value. */
function nameKey(name: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < name.getLength(); i++)
    result += String.fromCharCode(name.getStr()[i] as number);
  return result;
}
/** Original shared style collection; this does not construct or replace a SfxStyleSheetBase/Pool implementation. Duplicate-name range order is unordered in the native contract. */
export class IndexedStyleSheets {
  static readonly SearchBehavior = SearchBehavior;
  private readonly mStyleSheets: (SfxStyleSheetNameReference | null)[] = [];
  private readonly mPositionsByName = new Map<string, number[]>();
  private readonly mStyleSheetsByFamily: SfxStyleSheetNameReference[][] = [[], [], [], [], [], []];
  /** Adapts native unordered_multimap insertion while retaining all equivalent name positions. @param name - Logical key. @param pos - Vector position. @returns Nothing. */
  private insertName(name: OUStringConstReference, pos: number): void {
    const key = nameKey(name),
      range = this.mPositionsByName.get(key);
    if (range === undefined) this.mPositionsByName.set(key, [pos]);
    else range.push(pos);
  }
  /** Original name and family registration. @param style - Actual style reference. @param pos - Vector position. @returns Nothing. */
  private Register(style: SfxStyleSheetNameReference, pos: number): void {
    this.insertName(style.GetName(), pos);
    (
      this.mStyleSheetsByFamily[family_to_index(style.GetFamily())] as SfxStyleSheetNameReference[]
    ).push(style);
  }
  /** Original full index rebuild preserves the family vector objects. @returns Nothing. */
  Reindex(): void {
    this.mPositionsByName.clear();
    for (const family of this.mStyleSheetsByFamily) family.length = 0;
    for (let i = 0; i < this.mStyleSheets.length; i++)
      this.Register(this.mStyleSheets[i] as SfxStyleSheetNameReference, i);
  }
  /** Original one matching pointer/name index update; does not mutate the style or rebuild families. @param style - Actual style. @param rOldName - Previous index key. @param rNewName - Replacement key. @returns Nothing. */
  ReindexOnNameChange(
    style: SfxStyleSheetNameReference,
    rOldName: OUStringConstReference,
    rNewName: OUStringConstReference,
  ): void {
    const key = nameKey(rOldName),
      range = this.mPositionsByName.get(key);
    if (range === undefined) return;
    for (let i = 0; i < range.length; i++) {
      const pos = range[i] as number;
      if (this.mStyleSheets[pos] === style) {
        range.splice(i, 1);
        if (range.length === 0) this.mPositionsByName.delete(key);
        this.insertName(rNewName, pos);
        break;
      }
    }
  }
  /** Original pointer duplicate guard depends on the current indexed name. @param style - Actual style. @returns Nothing. */
  AddStyleSheet(style: SfxStyleSheetNameReference): void {
    if (!this.HasStyleSheet(style)) {
      this.mStyleSheets.push(style);
      this.Register(style, this.mStyleSheets.length - 1);
    }
  }
  /** Original current-name and pointer removal, rebuilding all subsequent positions. @param style - Actual style. @returns Whether removed. */
  RemoveStyleSheet(style: SfxStyleSheetNameReference): boolean {
    for (const pos of this.FindPositionsByName(style.GetName())) {
      if (this.mStyleSheets[pos] === style) {
        this.mStyleSheets.splice(pos, 1);
        this.Reindex();
        return true;
      }
    }
    return false;
  }
  /** Original current-name and pointer membership. @param style - Actual style. @returns Whether indexed. */
  HasStyleSheet(style: SfxStyleSheetNameReference): boolean {
    for (const pos of this.FindPositionsByName(style.GetName()))
      if (this.mStyleSheets[pos] === style) return true;
    return false;
  }
  /** Original vector size, including null slots while Clear callbacks execute. @returns Count. */
  GetNumberOfStyleSheets(): number {
    return this.mStyleSheets.length;
  }
  /** Original predicate count in vector order. @param predicate - Original virtual callback contract. @returns Matching count. */
  GetNumberOfStyleSheetsWithPredicate(predicate: StyleSheetPredicate): number {
    let count = 0;
    for (const style of this.mStyleSheets)
      if (predicate.Check(style as SfxStyleSheetNameReference)) count++;
    return count;
  }
  /** Original signed position test followed by checked vector access; a negative value throws, an index at/above end returns null. @param pos - Signed position. @returns Style or null. */
  GetStyleSheetByPosition(pos: number): SfxStyleSheetNameReference | null {
    if (pos < this.mStyleSheets.length) {
      if (pos < 0) throw new RangeError("IndexedStyleSheets vector position out of range");
      return this.mStyleSheets[pos] as SfxStyleSheetNameReference | null;
    }
    return null;
  }
  /** Original identity scan and exact missing-style diagnostic. @param style - Actual style. @returns Vector position. */
  FindStyleSheetPosition(style: SfxStyleSheetNameReference): number {
    const pos = this.mStyleSheets.indexOf(style);
    if (pos === -1)
      throw new Error("IndexedStyleSheets::FindStylePosition Looked for style not in index");
    return pos;
  }
  /** Original by-value position vector for an exact name, with unspecified native duplicate ordering. @param name - Original name. @returns Independent position list. */
  FindPositionsByName(name: OUStringConstReference): number[] {
    return [...(this.mPositionsByName.get(nameKey(name)) ?? [])];
  }
  /** Original name range plus predicate and ReturnFirst break. @param name - Original key. @param predicate - Check operation. @param behavior - Original ReturnAll default. @returns Matching positions. */
  FindPositionsByNameAndPredicate(
    name: OUStringConstReference,
    predicate: StyleSheetPredicate,
    behavior = SearchBehavior.ReturnAll,
  ): number[] {
    const result: number[] = [];
    for (const pos of this.FindPositionsByName(name)) {
      if (predicate.Check(this.mStyleSheets[pos] as SfxStyleSheetNameReference)) {
        result.push(pos);
        if (behavior === SearchBehavior.ReturnFirst) break;
      }
    }
    return result;
  }
  /** Original vector-order predicate position scan. @param predicate - Check operation. @returns Matching positions. */
  FindPositionsByPredicate(predicate: StyleSheetPredicate): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.mStyleSheets.length; i++)
      if (predicate.Check(this.mStyleSheets[i] as SfxStyleSheetNameReference)) result.push(i);
    return result;
  }
  /** Original ordered virtual callbacks. @param callback - Actual callback. @returns Nothing. */
  ApplyToAllStyleSheets(callback: StyleSheetCallback): void {
    for (const style of this.mStyleSheets) callback.DoIt(style as SfxStyleSheetNameReference);
  }
  /** Original callback then reference-clear order. Family vectors are deliberately not cleared here (CALC146); JS GC owns physical lifetime. @param cleanup - Observable cleanup/broadcast callback. @returns Nothing. */
  Clear(cleanup: StyleSheetDisposer): void {
    for (let i = 0; i < this.mStyleSheets.length; i++) {
      cleanup.Dispose(this.mStyleSheets[i] as SfxStyleSheetNameReference);
      this.mStyleSheets[i] = null;
    }
    this.mStyleSheets.length = 0;
    this.mPositionsByName.clear();
  }
  /** Original nth predicate match from an existing vector position, returning end position on miss. The source caller supplies startAt in [0,size]. @param n - Zero-based matching ordinal. @param predicate - Actual check. @param startAt - Valid starting position. @returns Pointer and absolute position. */
  GetNthStyleSheetThatMatchesPredicate(
    n: number,
    predicate: StyleSheetPredicate,
    startAt = 0,
  ): [SfxStyleSheetNameReference | null, number] {
    let matching = 0,
      pos = startAt;
    for (; pos < this.mStyleSheets.length; pos++) {
      const style = this.mStyleSheets[pos] as SfxStyleSheetNameReference;
      if (predicate.Check(style)) {
        if (matching === n) return [style, pos];
        matching++;
      }
    }
    return [null, pos];
  }
  /** Original borrowed live family vector, with the same six-family assertion contract. @param family - Original family. @returns Stable const vector view. */
  GetStyleSheetsByFamily(family: SfxStyleFamily): readonly SfxStyleSheetNameReference[] {
    return this.mStyleSheetsByFamily[family_to_index(family)] as SfxStyleSheetNameReference[];
  }
}
