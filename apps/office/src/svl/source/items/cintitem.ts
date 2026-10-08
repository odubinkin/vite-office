/** @fileoverview Implements bounded CntUInt16Item value ownership from pinned svl/source/items/cintitem.cxx. */

import { SfxPoolItem } from "./poolitem";

/** Native unsigned32 scalar base; UNO exposes the same bits through a signed32 value. */
export class CntUInt32Item extends SfxPoolItem {
  /** Creates an unsigned32 item. @param which - Item identity. @param value - Unsigned scalar. @returns Nothing. */
  public constructor(
    which: number,
    private value: number,
  ) {
    super(which);
    this.SetValue(value);
  }
  /** Reads the original unsigned scalar. @returns Unsigned32 value. */
  public GetValue(): number {
    return this.value;
  }
  /** Assigns an owned native scalar. @param value - Unsigned32 value. @returns Nothing. */
  public SetValue(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 0xffffffff)
      throw new Error("CntUInt32Item value is outside the unsigned 32-bit range.");
    this.value = value;
  }
  /** Clones the independent scalar. @returns Owned item. */
  public Clone(): CntUInt32Item {
    return new CntUInt32Item(this.Which(), this.value);
  }
  /** Compares concrete type, identity and scalar. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof CntUInt32Item &&
      other.constructor === this.constructor &&
      other.Which() === this.Which() &&
      other.value === this.value
    );
  }
  /** Exposes native signed32 UNO bits. @returns Signed scalar. */
  public QueryValue(): number {
    return this.value | 0;
  }
  /** Accepts a signed32 UNO scalar and preserves its unsigned bits. @param value - UNO scalar. @returns Whether accepted. */
  public PutValue(value: unknown): boolean {
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < -2147483648 ||
      value > 2147483647
    )
      return false;
    this.value = value >>> 0;
    return true;
  }
}

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
