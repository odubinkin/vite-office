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
  private shareable = true;

  /** Reports the native item-dependent sharing policy. @returns Whether pools may share this item. */
  public isShareable(): boolean {
    return this.shareable;
  }

  /** Disables sharing for item classes with native non-shareable ownership. @returns Nothing. */
  protected setNonShareable(): void {
    this.shareable = false;
  }

  /** Creates one item for a concrete WhichId or zero-valued request return. @param which - Bounded Writer/SVL item identity. @returns Nothing. */
  protected constructor(private readonly which: number) {
    if (!Number.isInteger(which) || which < 0 || which > 32767)
      throw new Error("SfxPoolItem WhichId is invalid.");
  }

  /** Returns this item's WhichId. @returns Item identity, including zero for request values. */
  public Which(): number {
    return this.which;
  }

  /** Creates an independent item with the same type and value. @returns Cloned item, or null for a static state sentinel. */
  public abstract Clone(): SfxPoolItem | null;

  /** Compares item class, WhichId, and concrete value. @param other - Candidate item. @returns True for equal items. */
  public abstract equals(other: SfxPoolItem): boolean;

  /** Exposes the UNO-compatible value used by filter and persistence boundaries. @returns Item value. */
  public abstract QueryValue(): unknown;
}

/** Static invalid-state item owned by the pinned poolitem.cxx module. */
class InvalidItem extends SfxPoolItem {
  /** Creates the zero-WhichId static state item. @returns Nothing. */
  public constructor() {
    super(0);
  }

  /** Mirrors the sentinel's null Clone result. @returns Null. */
  public Clone(): null {
    return null;
  }

  /** Mirrors the pinned trivial sentinel equality operator. @param other - Unused candidate. @returns True. */
  public equals(other: SfxPoolItem): boolean {
    void other;
    return true;
  }

  /** Exposes no payload, matching the base failed QueryValue operation. @returns No value. */
  public QueryValue(): undefined {
    return undefined;
  }
}

/** Static disabled-state item owned by the pinned poolitem.cxx module. */
class DisabledItem extends SfxPoolItem {
  /** Creates the zero-WhichId static state item. @returns Nothing. */
  public constructor() {
    super(0);
  }

  /** Mirrors the sentinel's null Clone result. @returns Null. */
  public Clone(): null {
    return null;
  }

  /** Mirrors the pinned trivial sentinel equality operator. @param other - Unused candidate. @returns True. */
  public equals(other: SfxPoolItem): boolean {
    void other;
    return true;
  }

  /** Exposes no payload, matching the base failed QueryValue operation. @returns No value. */
  public QueryValue(): undefined {
    return undefined;
  }
}

/** The unique invalid item stored for all explicit INVALID states. */
export const INVALID_POOL_ITEM: SfxPoolItem = new InvalidItem();

/** The unique disabled item returned for all explicit DISABLED states. */
export const DISABLED_POOL_ITEM: SfxPoolItem = new DisabledItem();

/** Tests invalid sentinel pointer identity. @param item - Candidate item or absent pointer. @returns Whether invalid. */
export function IsInvalidItem(item: SfxPoolItem | null | undefined): boolean {
  return item === INVALID_POOL_ITEM;
}

/** Tests sentinel pointer identity, as the pinned inline helper does. @param item - Candidate item or absent pointer. @returns Whether disabled. */
export function IsDisabledItem(item: SfxPoolItem | null | undefined): boolean {
  return item === DISABLED_POOL_ITEM;
}
