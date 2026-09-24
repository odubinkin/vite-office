/** @fileoverview Implements request-scoped SfxUnoAnyItem from pinned sfx2/source/view/frame.cxx. */

import { SfxPoolItem } from "../../../svl/source/items/poolitem";

/** UNO Any-valued request item used only at dispatch boundaries, matching SfxUnoAnyItem. */
export class SfxUnoAnyItem extends SfxPoolItem {
  /** Creates an Any argument item. @param which - Slot/argument identity. @param value - Caller-owned immutable boundary value. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: unknown,
  ) {
    super(which);
  }

  /** Returns the stored Any value. @returns Boundary value. */
  public GetValue(): unknown {
    return this.value;
  }

  /** Creates an independent item wrapper. @returns Cloned item. */
  public Clone(): SfxUnoAnyItem {
    return new SfxUnoAnyItem(this.Which(), this.value);
  }

  /** Mirrors upstream's non-comparable UNO Any contract. @param other - Candidate item. @returns False. */
  public equals(other: SfxPoolItem): boolean {
    void other;
    return false;
  }

  /** Exposes the UNO Any value. @returns Boundary value. */
  public QueryValue(): unknown {
    return this.value;
  }
}
