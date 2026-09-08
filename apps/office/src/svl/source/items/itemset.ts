/**
 * @fileoverview Reimplements bounded SfxItemSet delta storage, parent lookup, and item state from pinned `svl/source/items/itemset.cxx`.
 */

import type { SfxItemPool } from "./itempool";
import type { SfxPoolItem, SfxPoolItemSnapshot } from "./poolitem";

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
  private readonly items = new Map<number, SfxPoolItem>();
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
    if (parent !== undefined && parent.GetPool() !== this.pool)
      throw new Error("SfxItemSet parent belongs to another pool.");
    if (parent === this) throw new Error("SfxItemSet cannot inherit from itself.");
    this.parent = parent;
  }

  /** Returns the inherited item set. @returns Parent set, when present. */
  public GetParent(): SfxItemSet | undefined {
    return this.parent;
  }

  /** Returns the number of explicitly set items. @returns Direct item count. */
  public Count(): number {
    return this.items.size;
  }

  /** Returns explicit items in ascending WhichId order. @returns Direct items. */
  public entries(): readonly SfxPoolItem[] {
    return [...this.items.values()].sort(
      /** Orders direct items by WhichId. @param left - First item. @param right - Second item. @returns Signed WhichId order. */
      function compareWhich(left, right): number {
        return left.Which() - right.Which();
      },
    );
  }

  /** Returns one item's direct, inherited, or default state. @param which - Queried WhichId. @param searchInParent - Whether inherited sets participate. @returns Item state. */
  public GetItemState(which: number, searchInParent = true): SfxItemState {
    if (this.items.has(which)) return SfxItemState.SET;
    const localState = this.containsWhich(which) ? SfxItemState.DEFAULT : SfxItemState.UNKNOWN;
    if (searchInParent && this.parent !== undefined) {
      const parentState = this.parent.GetItemState(which, true);
      if (parentState === SfxItemState.SET) return parentState;
    }
    return localState;
  }

  /** Returns an explicitly set item, optionally searching parents. @param which - Queried WhichId. @param searchInParent - Whether parents participate. @returns Set item or undefined. */
  public GetItemIfSet(which: number, searchInParent = true): SfxPoolItem | undefined {
    const local = this.items.get(which);
    if (local !== undefined) return local;
    return searchInParent ? this.parent?.GetItemIfSet(which, true) : undefined;
  }

  /** Returns a direct, inherited, or pool-default item. @param which - Queried WhichId. @param searchInParent - Whether parents participate. @returns Effective item. */
  public Get(which: number, searchInParent = true): SfxPoolItem {
    return this.GetItemIfSet(which, searchInParent) ?? this.pool.GetUserOrPoolDefaultItem(which);
  }

  /** Stores an independent item delta when its value changes. @param item - Source item. @returns Stored item, or undefined for an equal no-op. */
  public Put(item: SfxPoolItem): SfxPoolItem | undefined {
    this.assertWhich(item.Which());
    const current = this.items.get(item.Which());
    if (current?.equals(item) === true) return undefined;
    const stored = item.Clone();
    this.items.set(stored.Which(), stored);
    return stored;
  }

  /** Copies every explicit delta from another set. @param source - Source item set. @returns True when at least one item changed. */
  public PutSet(source: SfxItemSet): boolean {
    let changed = false;
    source.entries().forEach(
      /** Copies one source delta. @param item - Explicit source item. @returns Nothing. */
      (item): void => {
        changed = this.Put(item) !== undefined || changed;
      },
    );
    return changed;
  }

  /** Clears one direct item or every direct item for WhichId zero. @param which - Item identity, or zero for all. @returns Removed item count. */
  public ClearItem(which = 0): number {
    if (which === 0) {
      const count = this.items.size;
      this.items.clear();
      return count;
    }
    return this.items.delete(which) ? 1 : 0;
  }

  /** Creates an independent item set, optionally without deltas or in another pool. @param includeItems - Whether direct deltas are copied. @param pool - Destination pool. @returns Cloned item set. */
  public Clone(includeItems = true, pool = this.pool): SfxItemSet {
    const clone = new SfxItemSet(pool, this.ranges, pool === this.pool ? this.parent : undefined);
    if (includeItems) clone.PutSet(this);
    return clone;
  }

  /** Serializes explicit deltas only. @returns Ordered item snapshots. */
  public toSnapshot(): readonly SfxPoolItemSnapshot[] {
    return this.entries().map(
      /** Serializes one direct item. @param item - Explicit item delta. @returns Item snapshot. */
      function serializeItem(item): SfxPoolItemSnapshot {
        return item.toSnapshot();
      },
    );
  }

  /** Restores and stores supported persisted deltas. @param snapshots - Persisted item records. @returns Nothing. */
  public restoreSnapshots(snapshots: readonly SfxPoolItemSnapshot[]): void {
    snapshots.forEach(
      /** Restores one item through the pool. @param snapshot - Persisted item record. @returns Nothing. */
      (snapshot): void => {
        this.Put(this.pool.CreateItem(snapshot));
      },
    );
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

  /** Rejects unsupported WhichIds before mutation. @param which - Candidate identity. @returns Nothing. */
  private assertWhich(which: number): void {
    if (!this.containsWhich(which)) throw new Error(`SfxItemSet does not accept WhichId: ${which}`);
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
