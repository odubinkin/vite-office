/** @fileoverview Native SfxItemIter over the actual item-set map, including INVALID/DISABLED entries; JS Map iterators bind native container iterators without a second item catalog. */
import { SfxItemSet, SfxItemState } from "../source/items/itemset";
import type { SfxPoolItem } from "../source/items/poolitem";

/** Original borrowed iterator; mutation invalidating the current native entry violates the caller precondition. */
export class SfxItemIter {
  private readonly items: Map<number, SfxPoolItem>;
  private readonly iterator: MapIterator<[number, SfxPoolItem]>;
  private maCurrent: IteratorResult<[number, SfxPoolItem]>;
  /** Original construction starts at the actual direct map's first entry. @param m_rSet - Borrowed native set. @returns Iterator. */
  constructor(private readonly m_rSet: SfxItemSet) {
    this.items = m_rSet["poolItemMap"];
    this.iterator = this.items.entries();
    this.maCurrent = this.iterator.next();
  }
  /** Original end predicate. @returns Whether at end. */
  IsAtEnd(): boolean {
    return this.maCurrent.done === true;
  }
  /** Original entry identity, including sentinel keys. @returns WhichId. */
  GetCurWhich(): number {
    if (this.IsAtEnd()) throw new Error("SfxItemIter is at end.");
    return (this.maCurrent.value as [number, SfxPoolItem])[0];
  }
  /** Original borrowed item, including state sentinel objects. @returns Actual item. */
  GetCurItem(): SfxPoolItem {
    const item = this.items.get(this.GetCurWhich());
    if (item === undefined) throw new Error("SfxItemIter entry was invalidated.");
    return item;
  }
  /** Original void advancement. @returns Nothing. */
  Next(): void {
    this.GetCurWhich();
    this.maCurrent = this.iterator.next();
  }
  /** Original advancement returns null at end. @returns Next item or null. */
  NextItem(): SfxPoolItem | null {
    this.Next();
    return this.IsAtEnd() ? null : this.GetCurItem();
  }
  /** Original state query writes the optional item pointer only for SET entries in the represented map. @param searchInParent - Native parent lookup flag. @param item - Optional pointer output. @returns Native state. */
  GetItemState(searchInParent = true, item?: [SfxPoolItem | undefined]): SfxItemState {
    const which = this.GetCurWhich(),
      state = this.m_rSet.GetItemState(which, searchInParent);
    if (item && state === SfxItemState.SET)
      item[0] = this.m_rSet.GetItemIfSet(which, searchInParent);
    return state;
  }
}
