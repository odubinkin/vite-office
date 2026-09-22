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

/** Stores Writer's first-line indent in twips. */
export class SvxFirstLineIndentItem extends SfxPoolItem {
  /** Creates an indent item. @param value - Signed twip indent. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(value)) throw new Error("SvxFirstLineIndentItem value is invalid.");
  }
  /** Returns the signed first-line indent. @returns Twips. */
  public ResolveTextFirstLineOffset(): number {
    return this.value;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxFirstLineIndentItem {
    return new SvxFirstLineIndentItem(this.value, this.Which());
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFirstLineIndentItem &&
      other.Which() === this.Which() &&
      other.value === this.value
    );
  }
  /** Serializes the indent. @returns Twips. */
  public QueryValue(): number {
    return this.value;
  }
}

/** Stores Writer's right paragraph margin in twips. */
export class SvxRightMarginItem extends SfxPoolItem {
  /** Creates a margin item. @param value - Non-negative twip margin. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(value) || value < 0)
      throw new Error("SvxRightMarginItem value is invalid.");
  }
  /** Returns the right margin. @returns Twips. */
  public ResolveRight(): number {
    return this.value;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxRightMarginItem {
    return new SvxRightMarginItem(this.value, this.Which());
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxRightMarginItem &&
      other.Which() === this.Which() &&
      other.value === this.value
    );
  }
  /** Serializes the margin. @returns Twips. */
  public QueryValue(): number {
    return this.value;
  }
}

/** Stores upper and lower paragraph spacing in twips. */
export class SvxULSpaceItem extends SfxPoolItem {
  /** Creates a spacing item. @param upper - Space above. @param lower - Space below. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly upper: number,
    private readonly lower: number,
    which: number,
  ) {
    super(which);
    if (
      ![upper, lower].every(
        /** Validates one spacing component. @param value - Twip value. @returns Whether valid. */ (
          value,
        ) => Number.isInteger(value) && value >= 0,
      )
    )
      throw new Error("SvxULSpaceItem value is invalid.");
  }
  /** Returns space above. @returns Twips. */
  public GetUpper(): number {
    return this.upper;
  }
  /** Returns space below. @returns Twips. */
  public GetLower(): number {
    return this.lower;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxULSpaceItem {
    return new SvxULSpaceItem(this.upper, this.lower, this.Which());
  }
  /** Compares identity and values. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxULSpaceItem &&
      other.Which() === this.Which() &&
      other.upper === this.upper &&
      other.lower === this.lower
    );
  }
  /** Serializes spacing. @returns Upper/lower tuple. */
  public QueryValue(): readonly [number, number] {
    return [this.upper, this.lower];
  }
}

/** Stores proportional line spacing for the bounded style projection. */
export class SvxLineSpacingItem extends SfxPoolItem {
  /** Creates line spacing. @param percent - Proportional height. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly percent: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(percent) || percent < 0)
      throw new Error("SvxLineSpacingItem value is invalid.");
  }
  /** Returns proportional line height. @returns Percent. */
  public GetPropLineSpace(): number {
    return this.percent;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxLineSpacingItem {
    return new SvxLineSpacingItem(this.percent, this.Which());
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxLineSpacingItem &&
      other.Which() === this.Which() &&
      other.percent === this.percent
    );
  }
  /** Serializes line spacing. @returns Percent. */
  public QueryValue(): number {
    return this.percent;
  }
}
