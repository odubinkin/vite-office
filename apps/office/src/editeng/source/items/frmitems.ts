/**
 * @fileoverview Reimplements bounded paragraph margin, first-line indent, and spacing items from pinned `editeng/source/items/frmitems.cxx`.
 */

import { SfxPoolItem } from "../../../svl/source/items/poolitem";

/** Owns the two-dimensional native size item from sizeitem.hxx and frmitems.cxx. */
export class SvxSizeItem extends SfxPoolItem {
  /** Creates an independent twip size. @param which - Native item identity. @param size - Authored dimensions. @returns Nothing. */
  public constructor(
    which: number,
    private size = { width: 0, height: 0 },
  ) {
    super(which);
    this.size = { ...size };
  }
  /** Reads the independent native dimensions. @returns Twip dimensions. */
  public GetSize(): Readonly<{ width: number; height: number }> {
    return { ...this.size };
  }
  /** Replaces native dimensions. @param size - Twip dimensions. @returns Nothing. */
  public SetSize(size: Readonly<{ width: number; height: number }>): void {
    this.size = { ...size };
  }
  /** Reads native width. @returns Twips. */
  public GetWidth(): number {
    return this.size.width;
  }
  /** Reads native height. @returns Twips. */
  public GetHeight(): number {
    return this.size.height;
  }
  /** Replaces native width. @param width - Twips. @returns Nothing. */
  public SetWidth(width: number): void {
    this.size.width = width;
  }
  /** Replaces native height. @param height - Twips. @returns Nothing. */
  public SetHeight(height: number): void {
    this.size.height = height;
  }
  /** Copies actual size and item identity. @returns Independent item. */
  public Clone(): SvxSizeItem {
    return new SvxSizeItem(this.Which(), this.GetSize());
  }
  /** Compares native identity and both dimensions. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxSizeItem &&
      other.Which() === this.Which() &&
      other.GetWidth() === this.GetWidth() &&
      other.GetHeight() === this.GetHeight()
    );
  }
  /** Exposes the supported default native size value without twip conversion. @returns Native dimensions. */
  public QueryValue(): Readonly<{ Width: number; Height: number }> {
    return { Width: this.GetWidth(), Height: this.GetHeight() };
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
    if (!Number.isInteger(textLeft)) throw new Error("SvxTextLeftMarginItem value is invalid.");
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
  /** Creates an indent item. @param value - Signed twip indent. @param which - Item identity. @param autoFirst - Whether Writer computes indent from font height. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
    private readonly autoFirst = false,
  ) {
    super(which);
    if (!Number.isInteger(value)) throw new Error("SvxFirstLineIndentItem value is invalid.");
  }
  /** Returns the signed first-line indent. @returns Twips. */
  public ResolveTextFirstLineOffset(): number {
    return this.value;
  }
  /** Returns upstream automatic first-line mode. @returns Whether font height controls the indent. */
  public IsAutoFirst(): boolean {
    return this.autoFirst;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxFirstLineIndentItem {
    return new SvxFirstLineIndentItem(this.value, this.Which(), this.autoFirst);
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFirstLineIndentItem &&
      other.Which() === this.Which() &&
      other.value === this.value &&
      other.autoFirst === this.autoFirst
    );
  }
  /** Serializes the indent. @returns Twips. */
  public QueryValue(): number | readonly [number, 1] {
    return this.autoFirst ? [this.value, 1] : this.value;
  }
}

/** Stores Writer's right paragraph margin in twips. */
export class SvxRightMarginItem extends SfxPoolItem {
  /** Creates a margin item. @param value - Signed twip margin. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(value)) throw new Error("SvxRightMarginItem value is invalid.");
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
