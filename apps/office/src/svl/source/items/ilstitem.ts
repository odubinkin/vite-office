/** @fileoverview Integer sequence item from svl/source/items/ilstitem.cxx. */
import { SfxPoolItem } from "./poolitem";

/** Owns the signed 32-bit sequence used by native selection slots. */
export class SfxIntegerListItem extends SfxPoolItem {
  private readonly list: readonly number[];

  /** Copies a list into the item. @param which - Native identity. @param list - Signed values. @returns Item. */
  constructor(which = 0, list: readonly number[] = []) {
    super(which);
    if (
      list.some(
        /** Validates the native sequence scalar domain. @param value - Candidate element. @returns Whether invalid. */
        (value) => !Number.isInteger(value) || value < -0x80000000 || value > 0x7fffffff,
      )
    )
      throw new RangeError("SfxIntegerListItem values must be signed 32-bit integers.");
    this.list = Object.freeze([...list]);
  }

  /** Borrows the sequence. @returns Ordered values. */
  GetList(): readonly number[] {
    return this.list;
  }

  /** Creates an independent copy. @returns Item. */
  override Clone(): SfxIntegerListItem {
    return new SfxIntegerListItem(this.Which(), this.list);
  }

  /** Compares native item ID and sequence contents. @param other - Item. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxIntegerListItem &&
      other.Which() === this.Which() &&
      this.list.length === other.list.length &&
      this.list.every(
        /** Compares one ordered entry. @param value - Value. @param index - Entry index. @returns Equality. */
        (value, index) => value === other.list[index],
      )
    );
  }

  /** Returns the sequence through the property contract. @returns Owned sequence. */
  override QueryValue(): unknown {
    return [...this.list];
  }
}
