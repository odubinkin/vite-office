/**
 * @fileoverview Reimplements bounded SwFormat attribute ownership and derivation from pinned `sw/source/core/attr/format.cxx`.
 */

import type { SfxItemSet, WhichRangesContainer } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwAttrSet, type SwAttrPool } from "./swatrset";

/** Base class for identity-bearing Writer styles and formats. */
export class SwFormat {
  private readonly attributeSet: SwAttrSet;
  private derivedFrom: SwFormat | undefined;
  private autoFormat = true;

  /** Creates a Writer format and connects its attribute set to the derived-from parent. @param pool - Owning Writer pool. @param formatName - UI format name. @param ranges - Accepted WhichId ranges. @param derivedFrom - Optional parent format. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    private formatName: string,
    ranges: WhichRangesContainer,
    derivedFrom?: SwFormat,
  ) {
    this.attributeSet = new SwAttrSet(pool, ranges);
    this.SetDerivedFrom(derivedFrom);
  }

  /** Returns the UI format name. @returns Format name. */
  public GetName(): string {
    return this.formatName;
  }

  /** Changes the UI format name. @param name - New non-empty name. @returns Nothing. */
  public SetFormatName(name: string): void {
    if (name.trim().length === 0) throw new Error("SwFormat name must not be blank.");
    this.formatName = name;
  }

  /** Returns the owned attribute set. @returns Format attributes. */
  public GetAttrSet(): SwAttrSet {
    return this.attributeSet;
  }

  /** Returns the parent format. @returns Derived-from format, when present. */
  public DerivedFrom(): SwFormat | undefined {
    return this.derivedFrom;
  }

  /** Changes the parent format and attribute-set inheritance. @param derivedFrom - New parent format. @returns True when changed. */
  public SetDerivedFrom(derivedFrom?: SwFormat): boolean {
    if (derivedFrom === this) throw new Error("SwFormat cannot derive from itself.");
    if (
      derivedFrom !== undefined &&
      derivedFrom.GetAttrSet().GetPool() !== this.attributeSet.GetPool()
    )
      throw new Error("SwFormat parent belongs to another pool.");
    if (this.derivedFrom === derivedFrom) return false;
    this.derivedFrom = derivedFrom;
    this.attributeSet.SetParent(derivedFrom?.GetAttrSet());
    return true;
  }

  /** Stores one direct format item. @param item - Format item. @returns True when changed. */
  public SetFormatAttr(item: SfxPoolItem): boolean {
    return this.attributeSet.Put(item) !== undefined;
  }

  /** Copies direct format items from another set. @param set - Source item set. @returns True when changed. */
  public SetFormatAttrSet(set: SfxItemSet): boolean {
    return this.attributeSet.PutSet(set);
  }

  /** Clears one direct format item. @param which - Cleared WhichId. @returns True when removed. */
  public ResetFormatAttr(which: number): boolean {
    return this.attributeSet.ClearItem(which) !== 0;
  }

  /** Clears every direct format item. @returns Removed item count. */
  public ResetAllFormatAttr(): number {
    return this.attributeSet.ClearItem();
  }

  /** Reports whether this is an automatic rather than named format. @returns Auto-format flag. */
  public IsAuto(): boolean {
    return this.autoFormat;
  }

  /** Changes the auto-format flag. @param autoFormat - New flag. @returns Nothing. */
  public SetAuto(autoFormat: boolean): void {
    this.autoFormat = autoFormat;
  }
}
