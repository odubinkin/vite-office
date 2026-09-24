/** @fileoverview Implements SfxBoolItem from pinned svl/source/items/cenumitm.cxx. */

import { SfxPoolItem } from "./poolitem";

/** Boolean SfxPoolItem used by request arguments, return values, and checked state. */
export class SfxBoolItem extends SfxPoolItem {
  /** Creates a boolean item. @param which - Item identity. @param value - Boolean value. @returns Nothing. */
  public constructor(
    which = 0,
    private readonly value = false,
  ) {
    super(which);
  }

  /** Returns the stored boolean. @returns Boolean value. */
  public GetValue(): boolean {
    return this.value;
  }

  /** Creates an independent boolean item. @returns Cloned item. */
  public Clone(): SfxBoolItem {
    return new SfxBoolItem(this.Which(), this.value);
  }

  /** Compares boolean item identity and value. @param other - Candidate item. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxBoolItem && other.Which() === this.Which() && other.value === this.value
    );
  }

  /** Returns the boolean through the generic item contract. @returns Boolean value. */
  public QueryValue(): boolean {
    return this.value;
  }
}
