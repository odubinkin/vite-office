/** @fileoverview Implements SfxInt16Item from pinned svl/source/items/intitem.cxx. */

import { SfxPoolItem } from "./poolitem";

/** Signed-16-bit SfxPoolItem counterpart used by Writer list levels. */
export class SfxInt16Item extends SfxPoolItem {
  /** Creates a signed-16-bit item. @param which - Item identity. @param value - Signed-16-bit value. @returns Nothing. */
  public constructor(
    which = 0,
    private readonly value = 0,
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

  /** Returns the integer value through the generic item contract. @returns Integer value. */
  public QueryValue(): number {
    return this.value;
  }
}
