/** @fileoverview SearchAttrItemList from the native Find and Replace dialog. */
import { SfxItemIter } from "../../../svl/inc/itemiter";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import { IsInvalidItem, type SfxPoolItem } from "../../../svl/source/items/poolitem";

/** One attribute slot and, for an exact search, its concrete native item. */
export interface SearchAttrInfo {
  readonly slot: number;
  readonly item?: SfxPoolItem;
}

/** Owns detached search criteria by native slot identity. An absent item means any non-default value. */
export class SearchAttrItemList {
  private readonly entries: SearchAttrInfo[] = [];

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
