/**
 * @fileoverview Reimplements bounded EditEngine character items from pinned `editeng/source/items/textitem.cxx`.
 */

import { SfxPoolItem, type SfxPoolItemSnapshot } from "../../../svl/source/items/poolitem";

/** Pooled font-family item following LibreOffice's SvxFontItem value boundary. */
export class SvxFontItem extends SfxPoolItem {
  /** Creates a font-family item. @param familyName - CSS/LibreOffice family name. @param which - Script-specific WhichId. @returns Nothing. */
  public constructor(
    private readonly familyName: string,
    which: number,
  ) {
    super(which);
    if (familyName.trim().length === 0) throw new Error("SvxFontItem family name is invalid.");
  }

  /** Returns the family name. @returns Font family. */
  public GetFamilyName(): string {
    return this.familyName;
  }
  /** Creates an independent item. @returns Cloned item. */
  public Clone(): SvxFontItem {
    return new SvxFontItem(this.familyName, this.Which());
  }
  /** Compares item identity and value. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFontItem &&
      other.Which() === this.Which() &&
      other.familyName === this.familyName
    );
  }
  /** Serializes the item. @returns Snapshot. */
  public toSnapshot(): SfxPoolItemSnapshot {
    return { type: "SvxFontItem", value: this.familyName, which: this.Which() };
  }
}

/** Matches LibreOffice FontWeight ordering from tools/fontenum.hxx. */
export enum FontWeight {
  DONTKNOW,
  THIN,
  ULTRALIGHT,
  LIGHT,
  SEMILIGHT,
  NORMAL,
  MEDIUM,
  SEMIBOLD,
  BOLD,
  ULTRABOLD,
  BLACK,
}

/** Matches LibreOffice FontItalic ordering from tools/fontenum.hxx. */
export enum FontItalic {
  NONE,
  OBLIQUE,
  NORMAL,
  DONTKNOW,
}

/** Matches LibreOffice FontLineStyle ordering from tools/fontenum.hxx. */
export enum FontLineStyle {
  NONE,
  SINGLE,
  DOUBLE,
  DOTTED,
  DONTKNOW,
  DASH,
  LONGDASH,
  DASHDOT,
  DASHDOTDOT,
  SMALLWAVE,
  WAVE,
  DOUBLEWAVE,
  BOLD,
  BOLDDOTTED,
  BOLDDASH,
  BOLDLONGDASH,
  BOLDDASHDOT,
  BOLDDASHDOTDOT,
  BOLDWAVE,
}

/** Pooled font-weight item with LibreOffice boolean threshold semantics. */
export class SvxWeightItem extends SfxPoolItem {
  /** Creates a weight item. @param weight - Font weight. @param which - Script-specific WhichId. @returns Nothing. */
  public constructor(
    private readonly weight: FontWeight,
    which: number,
  ) {
    super(which);
    assertEnumValue(weight, FontWeight.DONTKNOW, FontWeight.BLACK, "SvxWeightItem");
  }

  /** Returns the font weight. @returns FontWeight value. */
  public GetWeight(): FontWeight {
    return this.weight;
  }

  /** Reports the boolean bold interpretation used by Writer commands. @returns True at WEIGHT_BOLD or heavier. */
  public GetBoolValue(): boolean {
    return this.weight >= FontWeight.BOLD;
  }

  /** Creates an independent item. @returns Cloned weight item. */
  public Clone(): SvxWeightItem {
    return new SvxWeightItem(this.weight, this.Which());
  }

  /** Compares type, WhichId, and weight. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxWeightItem &&
      other.Which() === this.Which() &&
      other.weight === this.weight
    );
  }

  /** Serializes the item. @returns Snapshot. */
  public toSnapshot(): SfxPoolItemSnapshot {
    return { type: "SvxWeightItem", value: this.weight, which: this.Which() };
  }
}

/** Pooled font-posture item with LibreOffice boolean semantics. */
export class SvxPostureItem extends SfxPoolItem {
  /** Creates a posture item. @param posture - Font posture. @param which - Script-specific WhichId. @returns Nothing. */
  public constructor(
    private readonly posture: FontItalic,
    which: number,
  ) {
    super(which);
    assertEnumValue(posture, FontItalic.NONE, FontItalic.DONTKNOW, "SvxPostureItem");
  }

  /** Returns the font posture. @returns FontItalic value. */
  public GetPosture(): FontItalic {
    return this.posture;
  }

  /** Reports the boolean italic interpretation. @returns True for oblique or italic values. */
  public GetBoolValue(): boolean {
    return this.posture >= FontItalic.OBLIQUE && this.posture <= FontItalic.NORMAL;
  }

  /** Creates an independent item. @returns Cloned posture item. */
  public Clone(): SvxPostureItem {
    return new SvxPostureItem(this.posture, this.Which());
  }

  /** Compares type, WhichId, and posture. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxPostureItem &&
      other.Which() === this.Which() &&
      other.posture === this.posture
    );
  }

  /** Serializes the item. @returns Snapshot. */
  public toSnapshot(): SfxPoolItemSnapshot {
    return { type: "SvxPostureItem", value: this.posture, which: this.Which() };
  }
}

/** Pooled underline item with LibreOffice line-style semantics. */
export class SvxUnderlineItem extends SfxPoolItem {
  /** Creates an underline item. @param style - Line style. @param which - Underline WhichId. @returns Nothing. */
  public constructor(
    private readonly style: FontLineStyle,
    which: number,
  ) {
    super(which);
    assertEnumValue(style, FontLineStyle.NONE, FontLineStyle.BOLDWAVE, "SvxUnderlineItem");
  }

  /** Returns the line style. @returns FontLineStyle value. */
  public GetLineStyle(): FontLineStyle {
    return this.style;
  }

  /** Reports whether any underline is active. @returns True for non-NONE styles. */
  public GetBoolValue(): boolean {
    return this.style !== FontLineStyle.NONE;
  }

  /** Creates an independent item. @returns Cloned underline item. */
  public Clone(): SvxUnderlineItem {
    return new SvxUnderlineItem(this.style, this.Which());
  }

  /** Compares type, WhichId, and line style. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxUnderlineItem &&
      other.Which() === this.Which() &&
      other.style === this.style
    );
  }

  /** Serializes the item. @returns Snapshot. */
  public toSnapshot(): SfxPoolItemSnapshot {
    return { type: "SvxUnderlineItem", value: this.style, which: this.Which() };
  }
}

/** Validates a finite contiguous enum value. @param value - Candidate. @param first - First value. @param last - Last value. @param owner - Error owner. @returns Nothing. */
function assertEnumValue(value: number, first: number, last: number, owner: string): void {
  if (!Number.isInteger(value) || value < first || value > last)
    throw new Error(`${owner} value is invalid.`);
}
