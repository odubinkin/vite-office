/**
 * @fileoverview Reimplements bounded SfxItemSet delta storage, parent lookup, and item state from pinned `svl/source/items/itemset.cxx`.
 */

import { implCreateItemEntry, implCleanupItemEntry, bindHolderValue } from "./globalpool";
export { implCreateItemEntry, implCleanupItemEntry } from "./globalpool";
import { SfxItemPool } from "./itempool";
import {
  DISABLED_POOL_ITEM,
  INVALID_POOL_ITEM,
  IsDisabledItem,
  IsInvalidItem,
  SfxPoolItem,
} from "./poolitem";

/** Matches LibreOffice's externally significant SfxItemState numeric values. */
export enum SfxItemState {
  UNKNOWN = 0,
  DISABLED = 0x0001,
  INVALID = 0x0010,
  DEFAULT = 0x0020,
  SET = 0x0040,
}

import type { WhichRangesContainer } from "../../inc/whichranges";
export type { WhichRange, WhichRangesContainer } from "../../inc/whichranges";

/** Original pool/item association with native logical item reference counts and explicit destructor binding. Global instance caching and surrogate registration remain unported. */
export class SfxPoolItemHolder {
  private m_pPool: SfxItemPool | null = null;
  private m_pItem: SfxPoolItem | null = null;
  /** Original empty, pool/item and implicit-copy forms. Caller-owned transient items are copied; copied shareable values retain logical identity. @param args - Native constructor form. @returns Holder. */
  constructor(
    ...args:
      | []
      | [pool: SfxItemPool, item: SfxPoolItem | null, passingOwnership?: boolean]
      | [source: SfxPoolItemHolder]
  ) {
    if (args.length === 0) return;
    if (args[0] instanceof SfxPoolItemHolder) {
      const source = args[0];
      this.m_pPool = source.m_pPool;
      this.m_pItem = bindHolderValue(source.m_pPool as SfxItemPool, source.m_pItem, true, false);
    } else {
      this.m_pPool = args[0];
      this.m_pItem = implCreateItemEntry(
        this.m_pPool,
        args[1] as SfxPoolItem | null,
        args[2] === true,
      );
    }
  }
  /** Original borrowed pool; a present pool is the caller precondition. @returns Actual pool. */
  getPool(): SfxItemPool {
    return this.m_pPool as SfxItemPool;
  }
  /** Original borrowed logical item reference. @returns Actual item or null. */
  getItem(): SfxPoolItem | null {
    return this.m_pItem;
  }
  /** Original logical holder copy assignment, retaining pool/item identity for shareable values. @param source - Native source. @returns This holder. */
  assign(source: SfxPoolItemHolder): this {
    if (this === source || this.equals(source)) return this;
    implCleanupItemEntry(this.m_pItem);
    this.m_pPool = source.m_pPool;
    this.m_pItem = bindHolderValue(source.m_pPool as SfxItemPool, source.m_pItem, true, false);
    return this;
  }
  /** Original holder destructor releases its owned item entry. @returns Nothing. */
  Dispose(): void {
    implCleanupItemEntry(this.m_pItem);
    this.m_pItem = null;
    this.m_pPool = null;
  }
  /** Original pool plus item identity comparison; no payload-based pointer interning is fabricated. @param other - Other holder. @returns Equality. */
  equals(other: SfxPoolItemHolder): boolean {
    return this.m_pPool === other.m_pPool && this.m_pItem === other.m_pItem;
  }
  /** Original explicit presence predicate. @returns Item presence. */
  is(): boolean {
    return this.m_pItem !== null;
  }
  /** Original operator! binding. @returns Item absence. */
  not(): boolean {
    return this.m_pItem === null;
  }
  /** Original item identity or zero for null. @returns Which. */
  Which(): number {
    return this.m_pItem === null ? 0 : this.m_pItem.Which();
  }
}

/** Stores only explicit item deltas and resolves inherited/default values on demand. */
export class SfxItemSet {
  private readonly poolItemMap = new Map<number, SfxPoolItem>();
  private parent: SfxItemSet | undefined;

  private readonly pool: SfxItemPool;
  private ranges: WhichRangesContainer;
  /** Original pool-only, explicit pool/ranges and base copy constructors. Copying slices derived source sets, without invoking virtual Clone. @param args - Pool/ranges/optional browser parent or actual const source. @returns Item set. */
  public constructor(
    ...args:
      | [pool: SfxItemPool, ranges: WhichRangesContainer, parent?: SfxItemSet | undefined]
      | [source: SfxItemSet]
      | [pool: SfxItemPool]
  ) {
    const source = args[0];
    if (source instanceof SfxItemSet) {
      this.pool = source.pool;
      this.ranges = source.ranges;
      this.parent = source.parent;
      if (this.ranges.length !== 0) source.CopyItemsTo(this);
    } else {
      this.pool = source;
      this.ranges =
        args.length === 1 ? source.GetMergedIdRanges() : (args[1] as WhichRangesContainer);
      validateRanges(this.ranges);
      this.SetParent(args[2]);
    }
  }

  /** Returns the owning pool. @returns Item pool. */
  public GetPool(): SfxItemPool {
    return this.pool;
  }

  /** Returns the accepted WhichId ranges. @returns Inclusive ranges. */
  public GetRanges(): WhichRangesContainer {
    return this.ranges;
  }

  /** Original range expansion preserves all existing values and state sentinels. @param from - Inclusive native lower bound. @param to - Inclusive native upper bound. @returns Nothing. */
  public MergeRange(from: number, to: number): void {
    let allIncluded = this.ranges.length !== 0;
    for (let which = from; allIncluded && which <= to; which++)
      if (!this.containsWhich(which)) allIncluded = false;
    if (allIncluded) return;
    this.ranges = MergeRange(this.ranges, from, to);
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
    for (const which of this.poolItemMap.keys()) {
      const state = this.GetItemState(which, false);
      if (state !== other.GetItemState(which, false)) return false;
      if (!SfxPoolItem.areSame(this.GetItemIfSet(which, false), other.GetItemIfSet(which, false)))
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

  /** Original slot-aware optional lookup; defaults are returned only when parent searching is enabled. @param id - Slot or Which identity. @param searchInParent - Native deep/default lookup flag. @returns Set/default item or undefined for unknown, invalid, disabled or shallow default state. */
  public GetItem(id: number, searchInParent = true): SfxPoolItem | undefined {
    const which = this.pool.GetWhichIDFromSlotID(id);
    const state = this.GetItemState(which, searchInParent);
    if (searchInParent && state === SfxItemState.DEFAULT && SfxItemPool.IsWhich(which))
      return this.pool.GetUserOrPoolDefaultItem(which);
    return state === SfxItemState.SET ? this.GetItemIfSet(which, searchInParent) : undefined;
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
    return this.PutImpl(item, false);
  }

  /** Original const-reference target-Which insertion;the source item is never mutated. Native ownership overloads remain separate. @param item - Borrowed source. @param targetWhich - Target identity or zero for unchanged identity. @returns Stored value or no-op. */
  public PutAsTargetWhich(item: SfxPoolItem, targetWhich: number): SfxPoolItem | undefined {
    if (targetWhich === 0 || targetWhich === item.Which()) return this.PutImpl(item, false);
    const clone = item.Clone(this.GetPool()) as SfxPoolItem;
    clone.SetWhich(targetWhich);
    return this.PutImpl(clone, true);
  }

  /** Original insertion ownership argument over actual JS value adoption. @param item - Input. @param passingOwnership - Adopt an already cloned value. @returns Actual stored item or no-op. */
  private PutImpl(item: SfxPoolItem, passingOwnership: boolean): SfxPoolItem | undefined {
    if (IsDisabledItem(item) || !this.containsWhich(item.Which())) {
      if (passingOwnership) item.Dispose();
      return undefined;
    }
    const current = this.poolItemMap.get(item.Which());
    if (SfxPoolItem.areSame(current, item)) {
      if (passingOwnership) item.Dispose();
      return undefined;
    }
    const stored = implCreateItemEntry(this.pool, item, passingOwnership) as SfxPoolItem;
    this.Changed(current, stored);
    implCleanupItemEntry(current);
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

  /** Original shallow merge iterates destination ranges and treats absent source entries as defaults. @param source - Set in the same native pool. @returns Nothing. */
  public MergeValues(source: SfxItemSet): void {
    if (this.pool !== source.pool) throw new Error("MergeValues with different Pools");
    for (const [first, last] of this.ranges)
      for (let which = first; which <= last; which++)
        this.MergeItem_Impl(which, source.poolItemMap.get(which), false);
  }

  /** Original single-item merge ignores disabled input and destination-unknown identities. @param item - Borrowed value or native state sentinel. @returns Nothing. */
  public MergeValue(item: SfxPoolItem): void {
    if (IsDisabledItem(item)) return;
    if (this.containsWhich(item.Which())) this.MergeItem_Impl(item.Which(), item, true);
  }

  /** Original MergeValue(s) decision table,including default-valued explicit items and native invalid sentinels. @param which - Destination-known identity. @param source - Direct source entry or default absence. @param ignoreDefaults - Original single-item mode. @returns Nothing. */
  private MergeItem_Impl(
    which: number,
    source: SfxPoolItem | undefined,
    ignoreDefaults: boolean,
  ): void {
    const old = this.poolItemMap.get(which);
    if (old === undefined) {
      let next: SfxPoolItem | undefined;
      if (source !== undefined && IsInvalidItem(source)) next = INVALID_POOL_ITEM;
      else if (
        source !== undefined &&
        !ignoreDefaults &&
        !this.pool.GetUserOrPoolDefaultItem(which).equals(source)
      )
        next = INVALID_POOL_ITEM;
      else if (source !== undefined && ignoreDefaults)
        next = implCreateItemEntry(this.pool, source, false) as SfxPoolItem;
      if (next !== undefined) {
        this.poolItemMap.set(which, next);
      }
      return;
    }
    if (IsInvalidItem(old)) return;
    let change = false;
    if (source === undefined) {
      if (!ignoreDefaults && !old.equals(this.pool.GetUserOrPoolDefaultItem(which))) change = true;
    } else if (IsInvalidItem(source)) {
      if (!ignoreDefaults || !old.equals(this.pool.GetUserOrPoolDefaultItem(which))) change = true;
    } else if (!old.equals(source)) change = true;
    if (change) {
      this.ClearSingleItem_PrepareRemove(old);
      this.poolItemMap.set(which, INVALID_POOL_ITEM);
    }
  }

  /** Original replacing Set operation; clears first even for self-set, then copies declared-range effective SET values or shallow direct states. @param source - Source set. @param deep - Include effective parent SET values. @returns Whether insertion/Put changed a value, independently of the initial clear. */
  public Set(source: SfxItemSet, deep = true): boolean {
    if (this.Count() !== 0) this.ClearItem();
    if (!deep) return this.PutSet(source, false);
    let changed = false;
    for (const [first, last] of this.ranges)
      for (let which = first; which <= last; which += 1) {
        if (!source.containsWhich(which)) continue;
        if (source.GetItemState(which, true) !== SfxItemState.SET) continue;
        const item = source.GetItemIfSet(which, true) as SfxPoolItem;
        changed = this.Put(item) !== undefined || changed;
      }
    return changed;
  }

  /** Clears one direct item or every direct item for WhichId zero. @param which - Item identity, or zero for all. @returns Removed item count. */
  public ClearItem(which = 0): number {
    if (which === 0) {
      const count = this.poolItemMap.size;
      for (const item of this.poolItemMap.values()) {
        this.Changed(item, undefined);
        implCleanupItemEntry(item);
      }
      this.poolItemMap.clear();
      return count;
    }
    const item = this.poolItemMap.get(which);
    if (item === undefined) return 0;
    this.Changed(item, undefined);
    implCleanupItemEntry(item);
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

  /** Original nonvirtual value clone, valid only on actual base sets. The existing Clone body implements the same pool/parent/state cases. @param includeItems - Copy direct values and native same-pool states. @param pool - Optional destination pool. @returns Independent actual base set. */
  public CloneAsValue(includeItems = true, pool = this.pool): SfxItemSet {
    if (this.constructor !== SfxItemSet)
      throw new Error("SfxItemSet::CloneAsValue requires an actual base SfxItemSet.");
    return this.Clone(includeItems, pool);
  }

  /** Receives old and new entries before storage changes, as in the native virtual hook. @param oldItem - Previous direct entry. @param newItem - Replacement entry. @returns Nothing. */
  protected Changed(oldItem: SfxPoolItem | undefined, newItem: SfxPoolItem | undefined): void {
    void oldItem;
    void newItem;
  }

  /** Logical SfxItemSet destructor releases direct entries without virtual Changed notifications. @returns Nothing. */
  public Dispose(): void {
    for (const item of this.poolItemMap.values()) implCleanupItemEntry(item);
    this.poolItemMap.clear();
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

  /** Native old-entry notification and cleanup before removing/replacing its map slot. @param item - Borrowed old entry. @returns Nothing. */
  private ClearSingleItem_PrepareRemove(item: SfxPoolItem): void {
    this.Changed(item, undefined);
    implCleanupItemEntry(item);
  }

  /** Stores a sentinel using the pinned shared state transition. @param disable - Whether DISABLED rather than INVALID is requested. @param which - Item identity. @returns Nothing. */
  private DisableOrInvalidateItem_ForWhichID(disable: boolean, which: number): void {
    const sentinel = disable ? DISABLED_POOL_ITEM : INVALID_POOL_ITEM;
    const current = this.poolItemMap.get(which);
    if (current !== undefined) {
      if (current === sentinel) return;
      this.ClearSingleItem_PrepareRemove(current);
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

/** Native WhichRangesContainer::MergeRange value operation. Sorted range tuples replace native owning pair storage. The first native needMerge conjunct is always true for sorted valid pairs, so only its second conjunct is evaluated. @param ranges - Original sorted value. @param from - Native uint16 lower bound. @param to - Native uint16 upper bound. @returns Independent merged value. */
export function MergeRange(
  ranges: WhichRangesContainer,
  from: number,
  to: number,
): WhichRangesContainer {
  from &= 0xffff;
  to &= 0xffff;
  if (from === 0 || from > to)
    throw new Error("WhichRangesContainer requires a valid nonzero range");
  if (ranges.length === 0) return [[from, to]];
  const result: [number, number][] = [];
  let added = false;
  for (const pair of ranges) {
    if (!added && pair[0] >= from) {
      result.push([from, to]);
      added = true;
    }
    result.push([pair[0], pair[1]]);
  }
  if (!added) result.push([from, to]);
  let i = 0;
  while (i + 1 < result.length) {
    const current = result[i] as [number, number],
      next = result[i + 1] as [number, number];
    if (next[0] - 1 <= current[1]) {
      current[1] = Math.max(current[1], next[1]);
      result.splice(i + 1, 1);
    } else i++;
  }
  return result;
}
