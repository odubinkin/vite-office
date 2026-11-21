/** @fileoverview SearchAttrItemList from the native Find and Replace dialog. */
import { SfxItemIter } from "../../../svl/inc/itemiter";
import { SfxItemState, type SfxItemSet } from "../../../svl/source/items/itemset";
import { IsInvalidItem, type SfxPoolItem } from "../../../svl/source/items/poolitem";

/** One attribute slot and, for an exact search, its concrete native item. */
export interface SearchAttrInfo {
  readonly slot: number;
  readonly item?: SfxPoolItem;
}

/** Owns detached search criteria by native slot identity. An absent item means any non-default value. */
export class SearchAttrItemList {
  private readonly entries: SearchAttrInfo[];

  /** Copies the ordered list of detached native criteria. @param source - Original list. @returns Independent list. */
  public constructor(source?: SearchAttrItemList) {
    this.entries = [...(source?.entries ?? [])];
  }

  /** Appends a native criterion. @param entry - Criterion to append. @returns Nothing. */
  public Insert(entry: SearchAttrInfo): void {
    this.entries.push(entry);
  }

  /** Substitutes the criterion at the original index. @param index - Native list position. @param entry - New criterion. @returns Nothing. */
  public Replace(index: number, entry: SearchAttrInfo): void {
    this.entries[index] = entry;
  }

  /** Finds the last matching slot, which controls the effective value. @param slot - Native slot. @returns Native list index or -1. */
  public FindLast(slot: number): number {
    for (let index = this.entries.length - 1; index >= 0; --index) {
      if (this.entries[index]?.slot === slot) return index;
    }
    return -1;
  }

  /** Removes a criterion from its native position. @param index - Entry position. @returns Nothing. */
  public Remove(index: number): void {
    this.entries.splice(index, 1);
  }

  /** Updates existing exact criteria and appends the remaining tab outputs. @param output - Mutable dialog output item set. @returns Nothing. */
  public MergeFormat(output: SfxItemSet): void {
    const pool = output.GetPool();
    for (const [index, entry] of this.entries.entries()) {
      if (entry.item === undefined) continue;
      const which = entry.item.Which();
      if (output.GetItemState(which, false) !== SfxItemState.SET) continue;
      const item = output.Get(which, false).Clone(pool);
      if (item === null) continue;
      this.Replace(index, { slot: entry.slot, item });
      output.ClearItem(which);
    }
    this.Put(output);
  }

  /** Copies direct criteria from a native item set. @param set - Source criteria. @returns Nothing. */
  public Put(set: SfxItemSet): void {
    const pool = set.GetPool();
    for (const iter = new SfxItemIter(set); !iter.IsAtEnd(); iter.Next()) {
      const item = iter.GetCurItem();
      const slot = pool.GetSlotId(iter.GetCurWhich());
      if (IsInvalidItem(item)) this.entries.push({ slot });
      else {
        const copy = item.Clone(pool);
        if (copy !== null) this.entries.push({ slot, item: copy });
      }
    }
  }

  /** Projects the list onto the search or replacement item set. @param set - Destination set. @returns Destination set. */
  public Get(set: SfxItemSet): SfxItemSet {
    for (const { slot, item } of this.entries) {
      if (item === undefined) set.InvalidateItem(set.GetPool().GetWhichIDFromSlotID(slot));
      else set.Put(item);
    }
    return set;
  }

  /** Returns all criteria in native insertion order. @returns Read-only entries. */
  public GetEntries(): readonly SearchAttrInfo[] {
    return this.entries;
  }
}
