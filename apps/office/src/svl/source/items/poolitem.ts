/**
 * @fileoverview Reimplements the bounded SfxPoolItem value hierarchy from pinned `svl/source/items/poolitem.cxx`.
 */

/** JSON-compatible persisted value of one pooled item. */
export type SfxPoolItemValue = boolean | number | string | readonly SfxPoolItemSnapshot[];

/** JSON-compatible persisted form of one pooled item. */
export interface SfxPoolItemSnapshot {
  /** Runtime item class discriminator. */
  readonly type: string;
  /** Persisted item value. */
  readonly value: SfxPoolItemValue;
  /** Writer/SVL WhichId. */
  readonly which: number;
}

/** Base value object stored by SfxItemPool and SfxItemSet. */
export abstract class SfxPoolItem {
  /** Creates one item for a concrete WhichId. @param which - Positive Writer/SVL item identity. @returns Nothing. */
  protected constructor(private readonly which: number) {
    if (!Number.isInteger(which) || which <= 0) throw new Error("SfxPoolItem WhichId is invalid.");
  }

  /** Returns this item's WhichId. @returns Positive item identity. */
  public Which(): number {
    return this.which;
  }

  /** Creates an independent item with the same type and value. @returns Cloned item. */
  public abstract Clone(): SfxPoolItem;

  /** Compares item class, WhichId, and concrete value. @param other - Candidate item. @returns True for equal items. */
  public abstract equals(other: SfxPoolItem): boolean;

  /** Creates a persisted item record. @returns Cycle-free item snapshot. */
  public abstract toSnapshot(): SfxPoolItemSnapshot;
}

/** String-valued SfxPoolItem counterpart. */
export class SfxStringItem extends SfxPoolItem {
  /** Creates a string item. @param which - Item identity. @param value - String value. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: string,
  ) {
    super(which);
  }

  /** Returns the stored string. @returns String item value. */
  public GetValue(): string {
    return this.value;
  }

  /** Creates an independent string item. @returns Cloned item. */
  public Clone(): SfxStringItem {
    return new SfxStringItem(this.Which(), this.value);
  }

  /** Compares string item identity and value. @param other - Candidate item. @returns True for an equal string item. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxStringItem && other.Which() === this.Which() && other.value === this.value
    );
  }

  /** Creates a persisted string item record. @returns Item snapshot. */
  public toSnapshot(): SfxPoolItemSnapshot {
    return { type: "SfxStringItem", value: this.value, which: this.Which() };
  }
}

/** Signed-16-bit SfxPoolItem counterpart used by Writer list levels. */
export class SfxInt16Item extends SfxPoolItem {
  /** Creates a signed-16-bit item. @param which - Item identity. @param value - Signed-16-bit value. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: number,
  ) {
    super(which);
    if (!Number.isInteger(value) || value < -32768 || value > 32767)
      throw new Error("SfxInt16Item value is outside the signed 16-bit range.");
  }

  /** Returns the stored integer. @returns Signed-16-bit item value. */
  public GetValue(): number {
    return this.value;
  }

  /** Creates an independent integer item. @returns Cloned item. */
  public Clone(): SfxInt16Item {
    return new SfxInt16Item(this.Which(), this.value);
  }

  /** Compares integer item identity and value. @param other - Candidate item. @returns True for an equal integer item. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxInt16Item && other.Which() === this.Which() && other.value === this.value
    );
  }

  /** Creates a persisted integer item record. @returns Item snapshot. */
  public toSnapshot(): SfxPoolItemSnapshot {
    return { type: "SfxInt16Item", value: this.value, which: this.Which() };
  }
}
