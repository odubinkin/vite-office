/** @fileoverview Implements SfxInt16Item from pinned svl/source/items/intitem.cxx. */

import { SfxPoolItem } from "./poolitem";
import { CntUInt16Item, CntUInt32Item } from "./cintitem";

import type { SfxItemPool } from "./itempool";
/** Original unsigned32 subclass with default factory and implicit copying. */
export class SfxUInt32Item extends CntUInt32Item {
  /** Original zero/default/value and copy forms. @param source - Which or actual const source. @param value - Unsigned payload. @returns Item. */
  constructor(source: number | Readonly<SfxUInt32Item> = 0, value = 0) {
    if (typeof source === "number") super(source, value);
    else super(source);
  }
  /** Original zero-Which/zero-value factory. @returns Default item. */
  public static CreateDefault(): SfxUInt32Item {
    return new SfxUInt32Item();
  }
  /** Original copy-based Clone retains concrete type and Which. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SfxUInt32Item {
    void pool;
    return new SfxUInt32Item(this);
  }
}
/** Original unsigned16 subclass with default factory and implicit copying. */
export class SfxUInt16Item extends CntUInt16Item {
  /** Original zero/default/value and copy forms. @param source - Which or actual const source. @param value - Unsigned payload. @returns Item. */
  constructor(source: number | Readonly<SfxUInt16Item> = 0, value = 0) {
    if (typeof source === "number") super(source, value);
    else super(source);
  }
  /** Original zero-Which/zero-value factory. @returns Default item. */
  public static CreateDefault(): SfxUInt16Item {
    return new SfxUInt16Item();
  }
  /** Original copy-based Clone retains concrete type and Which. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SfxUInt16Item {
    void pool;
    return new SfxUInt16Item(this);
  }
}
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
  public override QueryValue(): number {
    return this.value;
  }
}
