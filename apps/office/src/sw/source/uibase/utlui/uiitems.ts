/** @fileoverview Implements borrowed SwPtrItem identity and cloning from pinned uiitems.hxx/uiitems.cxx. */
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
/** Borrows an existing native owner; the item never copies or owns its graph. */
export class SwPtrItem extends SfxPoolItem {
  /** Captures a native pointer. @param which - Native identity. @param value - Borrowed owner or null. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: object | null,
  ) {
    super(which);
  }
  /** Returns the original borrowed owner. @returns Same pointer. */
  public GetValue(): object | null {
    return this.value;
  }
  /** Copies the item while borrowing the same owner. @returns Independent item. */
  public Clone(): SwPtrItem {
    return new SwPtrItem(this.Which(), this.value);
  }
  /** Compares native identity and pointer equality. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwPtrItem && other.Which() === this.Which() && other.value === this.value
    );
  }
  /** Preserves the native base failed UNO value query. @returns No exported pointer payload. */
  public QueryValue(): undefined {
    return undefined;
  }
}
