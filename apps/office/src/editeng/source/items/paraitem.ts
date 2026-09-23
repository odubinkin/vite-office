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
  /** Creates a spacing item. @param upper - Space above. @param lower - Space below. @param which - Item identity. @param contextual - Suppress adjacent spacing for identical styles. @returns Nothing. */
  public constructor(
    private readonly upper: number,
    private readonly lower: number,
    which: number,
    private readonly contextual = false,
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
  /** Reports Writer's contextual paragraph-spacing flag. @returns Whether matching styles suppress spacing. */
  public GetContext(): boolean {
    return this.contextual;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxULSpaceItem {
    return new SvxULSpaceItem(this.upper, this.lower, this.Which(), this.contextual);
  }
  /** Compares identity and values. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxULSpaceItem &&
      other.Which() === this.Which() &&
      other.upper === this.upper &&
      other.lower === this.lower &&
      other.contextual === this.contextual
    );
  }
  /** Serializes spacing. @returns Upper/lower tuple. */
  public QueryValue(): readonly [number, number] | readonly [number, number, number] {
    return this.contextual ? [this.upper, this.lower, 1] : [this.upper, this.lower];
  }
}

/** Writer line-spacing modes corresponding to proportional, fixed, minimum, and extra leading. */
export type SvxLineSpacingMode = "proportional" | "fixed" | "minimum" | "leading";

/** Stores the Writer paragraph line-spacing rule in twips or percent. */
export class SvxLineSpacingItem extends SfxPoolItem {
  /** Creates line spacing. @param value - Percent or twips according to mode. @param which - Item identity. @param mode - Writer line-spacing rule. @param fontIndependent - ODF compatibility flag. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
    private readonly mode: SvxLineSpacingMode = "proportional",
    private readonly fontIndependent = false,
  ) {
    super(which);
    if (!Number.isInteger(value) || value < 0)
      throw new Error("SvxLineSpacingItem value is invalid.");
  }
  /** Returns the Writer rule. @returns Line-spacing mode. */
  public GetMode(): SvxLineSpacingMode {
    return this.mode;
  }
  /** Returns proportional line height. @returns Percent. */
  public GetPropLineSpace(): number {
    return this.mode === "proportional" ? this.value : 0;
  }
  /** Returns the rule's raw percent or twip value. @returns Stored value. */
  public GetValue(): number {
    return this.value;
  }
  /** Reports the imported font-independent setting. @returns ODF compatibility flag. */
  public IsFontIndependent(): boolean {
    return this.fontIndependent;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxLineSpacingItem {
    return new SvxLineSpacingItem(this.value, this.Which(), this.mode, this.fontIndependent);
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxLineSpacingItem &&
      other.Which() === this.Which() &&
      other.value === this.value &&
      other.mode === this.mode &&
      other.fontIndependent === this.fontIndependent
    );
  }
  /** Serializes line spacing compatibly with existing percentage records. @returns Percent or rule tuple. */
  public QueryValue(): number | readonly [number, number, number] {
    return this.mode === "proportional" && !this.fontIndependent
      ? this.value
      : [
          ["proportional", "fixed", "minimum", "leading"].indexOf(this.mode),
          this.value,
          Number(this.fontIndependent),
        ];
  }
}
