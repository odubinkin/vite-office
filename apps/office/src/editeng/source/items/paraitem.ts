/**
 * @fileoverview Reimplements the bounded SvxAdjustItem paragraph-alignment value from pinned `editeng/source/items/paraitem.cxx`.
 */

import { SfxPoolItem } from "../../../svl/source/items/poolitem";

/** Matches the pinned SvxAdjust enumeration order. */
export enum SvxAdjust {
  Left,
  Right,
  Block,
  Center,
  BlockLine,
  ParaStart,
  ParaEnd,
  End,
}

/** Stores one paragraph adjustment item. */
export class SvxAdjustItem extends SfxPoolItem {
  /** Creates a paragraph adjustment item. @param adjust - Paragraph adjustment value. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly adjust: SvxAdjust,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(adjust) || adjust < SvxAdjust.Left || adjust >= SvxAdjust.End)
      throw new Error("SvxAdjustItem value is invalid.");
  }

  /** Returns the paragraph adjustment value. @returns SvxAdjust value. */
  public GetAdjust(): SvxAdjust {
    return this.adjust;
  }

  /** Creates an independent adjustment item. @returns Cloned item. */
  public Clone(): SvxAdjustItem {
    return new SvxAdjustItem(this.adjust, this.Which());
  }

  /** Compares adjustment item identity and value. @param other - Candidate item. @returns True for an equal adjustment item. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxAdjustItem &&
      other.Which() === this.Which() &&
      other.adjust === this.adjust
    );
  }

  /** Creates a persisted adjustment item record. @returns Item snapshot. */
  public QueryValue(): SvxAdjust {
    return this.adjust;
  }
}

/** Stores Writer's direct text-left margin in twips, matching the bounded `SvxTextLeftMarginItem` role. */
export class SvxTextLeftMarginItem extends SfxPoolItem {
  /** Creates a left-margin item. @param textLeft - Direct text-left margin in twips. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly textLeft: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(textLeft) || textLeft < 0)
      throw new Error("SvxTextLeftMarginItem value is invalid.");
  }

  /** Returns the resolved direct text-left margin in twips. @returns Margin. */
  public ResolveTextLeft(): number {
    return this.textLeft;
  }

  /** Creates an independent left-margin item. @returns Cloned item. */
  public Clone(): SvxTextLeftMarginItem {
    return new SvxTextLeftMarginItem(this.textLeft, this.Which());
  }

  /** Compares item identity and margin value. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxTextLeftMarginItem &&
      other.Which() === this.Which() &&
      other.textLeft === this.textLeft
    );
  }

  /** Returns the persistence-safe twip margin. @returns Margin. */
  public QueryValue(): number {
    return this.textLeft;
  }
}
