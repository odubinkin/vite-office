/** @fileoverview Implements SfxStringItem from pinned svl/source/items/stritem.cxx. */

import { SfxPoolItem } from "./poolitem";

/** String-valued SfxPoolItem counterpart. */
export class SfxStringItem extends SfxPoolItem {
  /** Creates a string item. @param which - Item identity. @param value - String value. @returns Nothing. */
  public constructor(
    which = 0,
    private value = "",
  ) {
    super(which);
  }

  /** Returns the stored string. @returns String item value. */
  public GetValue(): string {
    return this.value;
  }

  /** Original string assignment. @param value - New string value. @returns Nothing. */
  public SetValue(value: string): void {
    this.value = value;
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

  /** Returns the string value through the generic item contract. @returns String value. */
  public override QueryValue(): unknown {
    return this.value;
  }
}
