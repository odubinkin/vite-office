/** @fileoverview Native item entry lifetime and logical value binding from globalpool.cxx; global ItemInstanceManager interning remains unported. */
import { SfxItemPool } from "./itempool";
import type { SfxPoolItem } from "./poolitem";
/** Original shared ItemSet/ItemPool helper entry. Native default/target-pool/copy cases and item reference counts are retained; global instance-manager value interning remains outside this owner. @param pool - Actual pool. @param item - Borrowed item or null. @param passingOwnership - Native adoption argument. @returns Associated logical value. */
export function implCreateItemEntry(
  pool: SfxItemPool,
  item: SfxPoolItem | null,
  passingOwnership: boolean,
): SfxPoolItem | null {
  return bindHolderValue(pool, item, false, passingOwnership);
}

/** Retains native allocation/reference ownership while the global instance-manager cache is unported while preserving default, request-value, target-set-pool and explicit value-copy cases. No document-membership substitute for item ownership is used. @param pool - Actual destination. @param item - Existing item or null. @param held - Copying an already held const value. @param passing - Original ownership argument, represented by ordinary JS reference adoption. @returns Associated native value. */
export function bindHolderValue(
  pool: SfxItemPool,
  item: SfxPoolItem | null,
  held: boolean,
  passing: boolean,
): SfxPoolItem | null {
  if (item === null || item.isStaticDefault()) return item;
  if (item.Which() === 0) return passing ? item : item.Clone();
  if (item.isDynamicDefault() && pool.GetPoolDefaultItem(item.Which()) === item) return item;
  if (SfxItemPool.IsSlot(item.Which())) return passing ? item : item.Clone(pool.GetMasterPool());
  const master = pool.GetMasterPool();
  if (
    item.isSetItem() &&
    (item as import("./sitem").SfxSetItem).GetItemSet().GetPool() !== master
  ) {
    const clone = item.Clone(master);
    clone?.AddRef();
    return clone;
  }
  const result = passing || (held && item.isShareable()) ? item : item.Clone(master);
  result?.AddRef();
  return result;
}

/** Original cleanup dispatch over actual held item entries. Static/dynamic defaults are borrowed, request/slot values are unique, and the final ordinary reference destroys the item. The global instance-manager cache is not represented here. @param item - Nullable held entry. @returns Nothing. */
export function implCleanupItemEntry(item: SfxPoolItem | null | undefined): void {
  if (item == null || item.isStaticDefault()) return;
  if (item.Which() === 0) {
    item.Dispose();
    return;
  }
  if (item.isDynamicDefault()) return;
  if (SfxItemPool.IsSlot(item.Which())) {
    item.Dispose();
    return;
  }
  const friend = item as unknown as { ReleaseRef(): number };
  if (item.GetRefCount() > 1) {
    friend.ReleaseRef();
    return;
  }
  friend.ReleaseRef();
  item.Dispose();
}
