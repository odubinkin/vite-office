/** @fileoverview Ports the registered-item AttrSetHandleHelper copy/commit boundary from pinned sw/source/core/docnode/node.cxx. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { SwAttrSet } from "../attr/swatrset";

/** Represents the native attribute handle passed by reference through mutation and callbacks. */
export interface SwAttrSetHandle {
  value: SwAttrSet | undefined;
}

/** Preserves retained sets by copying before mutation and replacing the handle only on change. */
export const AttrSetHandleHelper = {
  /** Copies and stores registered items with native broadcast deltas. @param handle - Allocated node handle. @param itemOrSet - Source item or set. @param oldSet - Old-state receiver. @param newSet - New-state receiver. @returns Whether storage changed. */
  Put_BC(
    handle: SwAttrSetHandle,
    itemOrSet: SfxPoolItem | SfxItemSet,
    oldSet: SwAttrSet,
    newSet: SwAttrSet,
  ): boolean {
    const next = (handle.value as SwAttrSet).CloneAsValue();
    const changed = next.Put_BC(itemOrSet, oldSet, newSet);
    if (changed) GetNewAutoStyle(handle, next);
    return changed;
  },

  /** Copies and clears a single item or inclusive range with native deltas. @param handle - Allocated node handle. @param first - First WhichId or zero. @param last - Optional range end. @param oldSet - Old-state receiver. @param newSet - New-state receiver. @returns Removed entry count. */
  ClearItem_BC(
    handle: SwAttrSetHandle,
    first: number,
    last: number | undefined,
    oldSet: SwAttrSet,
    newSet: SwAttrSet,
  ): number {
    const next = (handle.value as SwAttrSet).CloneAsValue();
    const removed =
      last === undefined
        ? next.ClearItem_BC(first, oldSet, newSet)
        : next.ClearItem_BC(first, last, oldSet, newSet);
    if (removed !== 0) GetNewAutoStyle(handle, next);
    return removed;
  },
};

/** Commits a fresh handle through the current browser style-access adapter; native pool deduplication remains unimplemented. @param handle - Node-owned handle. @param next - Independent changed set. @returns Nothing. */
function GetNewAutoStyle(handle: SwAttrSetHandle, next: SwAttrSet): void {
  handle.value = next;
}
