/** @fileoverview Implements bounded CntUInt16Item value ownership from pinned svl/source/items/cintitem.cxx. */

import { SfxPoolItem } from "./poolitem";

/** Unsigned integer base for Writer outline attributes; items remain immutable in the browser pool. */
export class CntUInt16Item extends SfxPoolItem {
  /** Creates an unsigned item. @param which - Item identity. @param value - Unsigned value. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: number,
  ) {
    super(which);
    if (!Number.isInteger(value) || value < 0 || value > 65535)
      throw new Error("CntUInt16Item value is outside the unsigned 16-bit range.");
  }

  /** Returns the stored integer. @returns Unsigned value. */
  public GetValue(): number {
    return this.value;
  }

  /** Clones the owned value. @returns Independent base item. */
  public Clone(): CntUInt16Item {
    return new CntUInt16Item(this.Which(), this.value);
  }

  /** Compares item type, identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof CntUInt16Item &&
      other.constructor === this.constructor &&
      other.Which() === this.Which() &&
      other.value === this.value
    );
  }

  /** Projects the scalar through the browser item contract. @returns Unsigned value. */
  public QueryValue(): number {
    return this.value;
  }
}
