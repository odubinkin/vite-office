/**
 * @fileoverview Reimplements bounded SfxItemSet delta storage, parent lookup, and item state from pinned `svl/source/items/itemset.cxx`.
 */

import type { SfxItemPool } from "./itempool";
import {
  DISABLED_POOL_ITEM,
  INVALID_POOL_ITEM,
  IsDisabledItem,
  IsInvalidItem,
  type SfxPoolItem,
} from "./poolitem";

/** Matches LibreOffice's externally significant SfxItemState numeric values. */
export enum SfxItemState {
  UNKNOWN = 0,
  DISABLED = 0x0001,
  INVALID = 0x0010,
  DEFAULT = 0x0020,
  SET = 0x0040,
}

/** Inclusive WhichId range accepted by an item set. */
export type WhichRange = readonly [first: number, last: number];

/** Ordered collection of inclusive WhichId ranges. */
export type WhichRangesContainer = readonly WhichRange[];

/** Stores only explicit item deltas and resolves inherited/default values on demand. */
export class SfxItemSet {
  private readonly poolItemMap = new Map<number, SfxPoolItem>();
  private parent: SfxItemSet | undefined;

  /** Creates an item set for one pool and bounded WhichId ranges. @param pool - Owning item pool. @param ranges - Accepted WhichId ranges. @param parent - Optional inherited item set. @returns Nothing. */
  public constructor(
    private readonly pool: SfxItemPool,
    private readonly ranges: WhichRangesContainer,
    parent?: SfxItemSet,
  ) {
    validateRanges(ranges);
    this.SetParent(parent);
  }

  /** Returns the owning pool. @returns Item pool. */
  public GetPool(): SfxItemPool {
    return this.pool;
  }

  /** Returns the accepted WhichId ranges. @returns Inclusive ranges. */
  public GetRanges(): WhichRangesContainer {
    return this.ranges;
  }

  /** Changes the inherited item set. @param parent - New parent or undefined. @returns Nothing. */
  public SetParent(parent: SfxItemSet | undefined): void {
    this.parent = parent;
  }

  /** Returns the inherited item set. @returns Parent set, when present. */
  public GetParent(): SfxItemSet | undefined {
    return this.parent;
  }

  /** Returns the number of direct value and state entries. @returns Direct entry count. */
  public Count(): number {
    return this.poolItemMap.size;
  }

  /** Compares native direct items and optional pool/parent identity, without comparing ranges or inherited content. @param other - Compared set. @param comparePool - Whether pool and parent identities participate. @returns Whether equal. */
  public Equals(other: SfxItemSet, comparePool: boolean): boolean {
    if (this === other) return true;
    if (comparePool && this.parent !== other.parent) return false;
    if (comparePool && this.pool !== other.pool) return false;
    if (this.Count() !== other.Count()) return false;
    if (this.Count() === 0) return true;
    for (const [which, item] of this.poolItemMap) {
      const state = this.GetItemState(which, false);
      if (state !== other.GetItemState(which, false)) return false;
      if (
        state === SfxItemState.SET &&
        !item.equals(other.GetItemIfSet(which, false) as SfxPoolItem)
      )
        return false;
    }
    return true;
  }

  /** Returns explicit SET values in ascending WhichId order for browser projections. @returns Direct value items. */
  public entries(): readonly SfxPoolItem[] {
    return [...this.poolItemMap.values()]
      .filter(
        /** Excludes state sentinels from the value projection. @param item - Stored entry. @returns Whether SET. */
        (item) => !IsInvalidItem(item) && !IsDisabledItem(item),
      )
      .sort(
        /** Orders direct items by WhichId. @param left - First item. @param right - Second item. @returns Signed WhichId order. */
        function compareWhich(left, right): number {
          return left.Which() - right.Which();
        },
      );
  }

  /** Returns one item's direct, inherited, or default state. @param which - Queried WhichId. @param searchInParent - Whether inherited sets participate. @returns Item state. */
  public GetItemState(which: number, searchInParent = true): SfxItemState {
    return this.GetItemStateWithFallback(SfxItemState.UNKNOWN, which, searchInParent);
  }

  /** Returns an explicitly set item, optionally searching parents. @param which - Queried WhichId. @param searchInParent - Whether parents participate. @returns Set item or undefined. */
  public GetItemIfSet(which: number, searchInParent = true): SfxPoolItem | undefined {
    const local = this.poolItemMap.get(which);
    if (local !== undefined)
      return IsInvalidItem(local) || IsDisabledItem(local) ? undefined : local;
    return searchInParent ? this.parent?.GetItemIfSet(which, true) : undefined;
  }

  /** Returns a direct, inherited, or pool-default item. @param which - Queried WhichId. @param searchInParent - Whether parents participate. @returns Effective item. */
  public Get(which: number, searchInParent = true): SfxPoolItem {
    const local = this.poolItemMap.get(which);
    if (IsInvalidItem(local)) return this.pool.GetUserOrPoolDefaultItem(which);
    if (local !== undefined) return local;
    if (searchInParent && this.parent !== undefined) return this.parent.Get(which, true);
    return this.pool.GetUserOrPoolDefaultItem(which);
  }

  /** Stores an independent accepted item delta when its value changes. @param item - Source item. @returns Stored item, or undefined for an equal or out-of-range no-op. */
  public Put(item: SfxPoolItem): SfxPoolItem | undefined {
    if (IsDisabledItem(item)) return undefined;
    if (!this.containsWhich(item.Which())) return undefined;
    const current = this.poolItemMap.get(item.Which());
    if (
      current !== undefined &&
      !IsInvalidItem(current) &&
      !IsDisabledItem(current) &&
      current.equals(item)
    )
      return undefined;
    const stored = item.Clone() as SfxPoolItem;
    this.Changed(current, stored);
    this.poolItemMap.set(stored.Which(), stored);
    return stored;
  }

  /** Copies SET items, ignores DISABLED and handles INVALID as the pinned Put overload does. @param source - Source item set. @param invalidAsDefault - Whether INVALID clears a direct target value instead of copying the invalid state. @returns True when a SET value changes or a default-mode clear removes an entry. */
  public PutSet(source: SfxItemSet, invalidAsDefault = true): boolean {
    let changed = false;
    for (const [which, item] of source.poolItemMap) {
      if (IsDisabledItem(item)) continue;
      if (IsInvalidItem(item)) {
        if (invalidAsDefault) changed = this.ClearItem(which) !== 0 || changed;
        else this.InvalidateItem(which);
      } else changed = this.Put(item) !== undefined || changed;
    }
    return changed;
  }

  /** Clears one direct item or every direct item for WhichId zero. @param which - Item identity, or zero for all. @returns Removed item count. */
  public ClearItem(which = 0): number {
    if (which === 0) {
      const count = this.poolItemMap.size;
      for (const item of this.poolItemMap.values()) this.Changed(item, undefined);
      this.poolItemMap.clear();
      return count;
    }
    const item = this.poolItemMap.get(which);
    if (item === undefined) return 0;
    this.Changed(item, undefined);
    this.poolItemMap.delete(which);
    return 1;
  }

  /** Marks one accepted WhichId invalid, matching INVALID_POOL_ITEM state. @param which - Item identity. @returns Nothing. */
  public InvalidateItem(which: number): void {
    this.DisableOrInvalidateItem_ForWhichID(false, which);
  }

  /** Marks one accepted WhichId disabled, matching DISABLED_POOL_ITEM state. @param which - Item identity. @returns Nothing. */
  public DisableItem(which: number): void {
    this.DisableOrInvalidateItem_ForWhichID(true, which);
  }

  /** Removes all local identities present in another native set, including INVALID and DISABLED entries. @param set - Identity source. @returns Nothing. */
  public Differentiate(set: SfxItemSet): void {
    if (this.Count() === 0 || set.Count() === 0) return;
    if (this === set) {
      this.ClearItem();
      return;
    }
    for (const which of set.poolItemMap.keys()) this.ClearItem(which);
  }

  /** Creates an independent item set, optionally without deltas or in another pool. @param includeItems - Whether direct deltas are copied. @param pool - Destination pool. @returns Cloned item set. */
  public Clone(includeItems = true, pool = this.pool): SfxItemSet {
    const clone = new SfxItemSet(
      pool,
      this.ranges,
      includeItems && pool === this.pool ? this.parent : undefined,
    );
    if (includeItems) this.CopyItemsTo(clone, pool === this.pool);
    return clone;
  }

  /** Receives old and new entries before storage changes, as in the native virtual hook. @param oldItem - Previous direct entry. @param newItem - Replacement entry. @returns Nothing. */
  protected Changed(oldItem: SfxPoolItem | undefined, newItem: SfxPoolItem | undefined): void {
    void oldItem;
    void newItem;
  }

  /** Translates the copy constructor's direct item entries independently of PutSet semantics. @param target - Fresh clone. @param includeStates - Whether INVALID/DISABLED entries belong to this clone. @returns Nothing. */
  protected CopyItemsTo(target: SfxItemSet, includeStates = true): void {
    for (const [which, item] of this.poolItemMap) {
      if (IsInvalidItem(item) || IsDisabledItem(item)) {
        if (includeStates) target.DisableOrInvalidateItem_ForWhichID(IsDisabledItem(item), which);
      } else target.Put(item);
    }
  }

  /** Reports whether this set accepts a WhichId. @param which - Candidate identity. @returns True when contained in any range. */
  private containsWhich(which: number): boolean {
    return this.ranges.some(
      /** Checks one inclusive range. @param range - Accepted range. @returns True when range contains which. */
      function containsRange(range): boolean {
        return range[0] <= which && which <= range[1];
      },
    );
  }

  /** Stores a sentinel using the pinned shared state transition. @param disable - Whether DISABLED rather than INVALID is requested. @param which - Item identity. @returns Nothing. */
  private DisableOrInvalidateItem_ForWhichID(disable: boolean, which: number): void {
    const sentinel = disable ? DISABLED_POOL_ITEM : INVALID_POOL_ITEM;
    const current = this.poolItemMap.get(which);
    if (current !== undefined) {
      if (current === sentinel) return;
      this.poolItemMap.set(which, sentinel);
    } else if (this.containsWhich(which)) this.poolItemMap.set(which, sentinel);
  }

  /** Mirrors the recursive eState accumulator used by SfxItemSet::GetItemState_Impl. @param fallback - State accumulated by the child set. @param which - Queried WhichId. @param searchInParent - Whether inherited sets participate. @returns Effective item state. */
  private GetItemStateWithFallback(
    fallback: SfxItemState,
    which: number,
    searchInParent: boolean,
  ): SfxItemState {
    const item = this.poolItemMap.get(which);
    if (IsInvalidItem(item)) return SfxItemState.INVALID;
    if (IsDisabledItem(item)) return SfxItemState.DISABLED;
    if (item !== undefined) return SfxItemState.SET;
    const localState = this.containsWhich(which) ? SfxItemState.DEFAULT : fallback;
    if (searchInParent && this.parent !== undefined)
      return this.parent.GetItemStateWithFallback(localState, which, true);
    return localState;
  }
}

/** Validates sorted, non-overlapping inclusive WhichId ranges. @param ranges - Candidate ranges. @returns Nothing. */
function validateRanges(ranges: WhichRangesContainer): void {
  let previousEnd = 0;
  ranges.forEach(
    /** Validates one range against its predecessor. @param range - Inclusive range. @returns Nothing. */
    function validateRange(range): void {
      if (
        !Number.isInteger(range[0]) ||
        !Number.isInteger(range[1]) ||
        range[0] <= previousEnd ||
        range[1] < range[0]
      )
        throw new Error("SfxItemSet WhichId ranges are invalid.");
      previousEnd = range[1];
    },
  );
}
