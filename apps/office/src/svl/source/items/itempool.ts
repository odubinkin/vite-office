/**
 * @fileoverview Reimplements the bounded default-item registry and item restoration responsibilities from pinned `svl/source/items/itempool.cxx`.
 */

import type { SfxPoolItem, SfxPoolItemSnapshot } from "./poolitem";

/** Restores a concrete pooled item from its persisted primitive value. */
export type SfxPoolItemFactory = (value: boolean | number | string) => SfxPoolItem;

/** Owns defaults and factories for the bounded WhichId space. */
export class SfxItemPool {
  private readonly defaults = new Map<number, SfxPoolItem>();
  private readonly factories = new Map<number, SfxPoolItemFactory>();

  /** Registers one pool default and its snapshot factory. @param item - Default item. @param factory - Concrete restore function. @returns Nothing. */
  public RegisterDefaultItem(item: SfxPoolItem, factory: SfxPoolItemFactory): void {
    if (this.defaults.has(item.Which())) throw new Error(`Duplicate pool default: ${item.Which()}`);
    this.defaults.set(item.Which(), item.Clone());
    this.factories.set(item.Which(), factory);
  }

  /** Returns the immutable default for one WhichId. @param which - Registered item identity. @returns Pool default item. */
  public GetUserOrPoolDefaultItem(which: number): SfxPoolItem {
    const item = this.defaults.get(which);
    if (item === undefined) throw new Error(`Unknown pool default: ${which}`);
    return item;
  }

  /** Restores a concrete item through the factory registered for its WhichId. @param snapshot - Persisted item record. @returns Restored item. */
  public CreateItem(snapshot: SfxPoolItemSnapshot): SfxPoolItem {
    const factory = this.factories.get(snapshot.which);
    if (factory === undefined) throw new Error(`Unknown pooled item snapshot: ${snapshot.which}`);
    const item = factory(snapshot.value);
    if (item.Which() !== snapshot.which)
      throw new Error("Pooled item factory changed the WhichId.");
    return item;
  }

  /** Reports whether a WhichId has a registered pool default. @param which - Candidate item identity. @returns True when registered. */
  public IsWhich(which: number): boolean {
    return this.defaults.has(which);
  }
}
