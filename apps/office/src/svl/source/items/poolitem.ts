/**
 * @fileoverview Reimplements the bounded SfxPoolItem base contract from pinned `svl/source/items/poolitem.cxx`.
 */

/** JSON-compatible persisted value of one pooled item. */
export type SfxPoolItemValue =
  | boolean
  | number
  | string
  | readonly SfxPoolItemValue[]
  | { readonly [key: string]: SfxPoolItemValue };

/** JSON-compatible persisted form of one pooled item. */
export interface SfxPoolItemSnapshot {
  /** Persisted item value. */
  readonly value: SfxPoolItemValue;
  /** Writer/SVL WhichId. */
  readonly which: number;
}

/** Base value object stored by SfxItemPool and SfxItemSet. */
export abstract class SfxPoolItem {
  /** Creates one item for a concrete WhichId or zero-valued request return. @param which - Bounded Writer/SVL item identity. @returns Nothing. */
  protected constructor(private readonly which: number) {
    if (!Number.isInteger(which) || which < 0 || which > 32767)
      throw new Error("SfxPoolItem WhichId is invalid.");
  }

  /** Returns this item's WhichId. @returns Item identity, including zero for request values. */
  public Which(): number {
    return this.which;
  }

  /** Creates an independent item with the same type and value. @returns Cloned item. */
  public abstract Clone(): SfxPoolItem;

  /** Compares item class, WhichId, and concrete value. @param other - Candidate item. @returns True for equal items. */
  public abstract equals(other: SfxPoolItem): boolean;

  /** Exposes the UNO-compatible value used by filter and persistence boundaries. @returns Item value. */
  public abstract QueryValue(): unknown;
}
