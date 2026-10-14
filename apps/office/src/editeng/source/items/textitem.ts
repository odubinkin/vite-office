/**
 * @fileoverview Reimplements bounded EditEngine character items from pinned `editeng/source/items/textitem.cxx`.
 */

import { SfxBoolItem, SfxEnumItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontItalic as NativeFontItalic } from "../../../tools/inc/fontenum";
import {
  FontSlant,
  cppu_detail_getUnoType_FontSlant,
} from "../../../offapi/com/sun/star/awt/FontSlant";
import { ConvertFontSlant } from "../../../vcl/inc/unohelp";
import { Any2Bool } from "../../../svl/inc/poolitem";
import { FontRelief } from "../../../vcl/inc/fntstyle";
import { MID_RELIEF, MID_ITALIC, MID_POSTURE } from "../../inc/memberids";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";

/** Pooled font-family item following LibreOffice's SvxFontItem value boundary. */
export class SvxFontItem extends SfxPoolItem {
  /** Creates a font-family item. @param familyName - Serialized CSS/LibreOffice family name. @param which - Script-specific WhichId. @param resolvedFamilyName - Device-resolved presentation family. @param genericFamily - ODF generic family. @returns Nothing. */
  public constructor(
    private readonly familyName: string,
    which: number,
    private readonly resolvedFamilyName = familyName,
    private readonly genericFamily?: string,
  ) {
    super(which);
    if (familyName.trim().length === 0) throw new Error("SvxFontItem family name is invalid.");
    if (resolvedFamilyName.trim().length === 0)
      throw new Error("SvxFontItem resolved family name is invalid.");
  }

  /** Returns the family name. @returns Font family. */
  public GetFamilyName(): string {
    return this.familyName;
  }
  /** Returns the device-resolved family used only for presentation. @returns Resolved family name. */
  public GetResolvedFamilyName(): string {
    return this.resolvedFamilyName;
  }
  /** Returns the ODF generic family used by VCL when the named face is unavailable. @returns Generic family. */
  public GetGenericFamily(): string | undefined {
    return this.genericFamily;
  }
  /** Creates an independent item. @returns Cloned item. */
  public Clone(): SvxFontItem {
    return new SvxFontItem(
      this.familyName,
      this.Which(),
      this.resolvedFamilyName,
      this.genericFamily,
    );
  }
  /** Compares item identity and value. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFontItem &&
      other.Which() === this.Which() &&
      other.familyName === this.familyName &&
      other.genericFamily === this.genericFamily
    );
  }
  /** Serializes the item. @returns Snapshot. */
  public override QueryValue(): string {
    return this.familyName;
  }
}

/** Pooled script-specific font height stored in twips. */
export class SvxFontHeightItem extends SfxPoolItem {
  /** Creates a font-height item. @param height - Absolute height in twips. @param which - Script-specific WhichId. @returns Nothing. */
  public constructor(
    private readonly height: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(height) || height <= 0)
      throw new Error("SvxFontHeightItem value is invalid.");
  }

  /** Returns the absolute height in twips. @returns Font height. */
  public GetHeight(): number {
    return this.height;
  }

  /** Creates an independent height item. @returns Cloned item. */
  public Clone(): SvxFontHeightItem {
    return new SvxFontHeightItem(this.height, this.Which());
  }

  /** Compares item identity and height. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFontHeightItem &&
      other.Which() === this.Which() &&
      other.height === this.height
    );
  }

  /** Serializes the twip height. @returns Height. */
  public override QueryValue(): number {
    return this.height;
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

/** Existing browser names are aliases to the single original tools FontItalic enum. */
export const FontItalic = {
  NONE: NativeFontItalic.ITALIC_NONE,
  OBLIQUE: NativeFontItalic.ITALIC_OBLIQUE,
  NORMAL: NativeFontItalic.ITALIC_NORMAL,
  DONTKNOW: NativeFontItalic.ITALIC_DONTKNOW,
} as const;
/** Existing browser type name refers to the canonical enum. */
export type FontItalic = NativeFontItalic;

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
  public override QueryValue(): FontWeight {
    return this.weight;
  }
}

/** Original posture enum item with native bool and FontSlant member transport. */
export class SvxPostureItem extends SfxEnumItem<FontItalic> {
  /** Original value/Which and implicit copy; JS scalar validation is an explicit checked host boundary over native nonnegative enum range. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: FontItalic, which: number] | [source: Readonly<SvxPostureItem>]) {
    if (args.length === 1) super(args[0]);
    else {
      assertEnumValue(args[0], 0, 0x7fffffff, "SvxPostureItem");
      super(args[1], args[0]);
    }
  }
  /** Original NONE default factory. @returns Item. */
  public static CreateDefault(): SvxPostureItem {
    return new SvxPostureItem(NativeFontItalic.ITALIC_NONE, 0);
  }
  /** Original enum getter. @returns Italic enum. */
  public GetPosture(): FontItalic {
    return this.GetValue();
  }
  /** Original bool support. @returns True. */
  public override HasBoolValue(): boolean {
    return true;
  }
  /** Original threshold includes DONTKNOW and initialized unknown higher values. @returns Whether at least OBLIQUE. */
  public override GetBoolValue(): boolean {
    return this.GetValue() >= NativeFontItalic.ITALIC_OBLIQUE;
  }
  /** Original bool setter selects NORMAL or NONE. @param value - Bool. @returns Nothing. */
  public override SetBoolValue(value: boolean): void {
    this.SetValue(value ? NativeFontItalic.ITALIC_NORMAL : NativeFontItalic.ITALIC_NONE);
  }
  /** Original copy Clone retains Which. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxPostureItem {
    void pool;
    return new SvxPostureItem(this);
  }
  /** Existing browser scalar enum projection. @returns Numeric enum. */
  public override QueryValue(): FontItalic;
  /** Original bool/FontSlant Any query. @param output - Actual Any. @param member - Native member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unknown-member success leaves output unchanged. @param output - Optional Any. @param member - Native member. @returns Native success or browser scalar. */
  public override QueryValue(output?: Any, member = 0): boolean | FontItalic {
    if (output === undefined) return this.GetValue();
    switch (member & 0xff & ~0x80) {
      case MID_ITALIC:
        output.insert([this.GetBoolValue()], "bool");
        break;
      case MID_POSTURE:
        output.insert(
          [ConvertFontSlant(this.GetValue(), "FontItalic")],
          cppu_detail_getUnoType_FontSlant,
        );
        break;
    }
    return true;
  }
  /** Original bool fallback or exact enum then signed32 fallback, with unchanged native failure and unknown-member success. @param input - Actual Any or scalar. @param member - Native member. @returns Success. */
  public override PutValue(input: unknown, member = 0): boolean {
    switch (member & 0xff & ~0x80) {
      case MID_ITALIC:
        this.SetBoolValue(Any2Bool(input));
        break;
      case MID_POSTURE: {
        const value: [number] = [0];
        if (input instanceof Any) {
          if (
            !input.extract(value, cppu_detail_getUnoType_FontSlant) &&
            !input.extract(value, "sal_Int32")
          )
            return false;
        } else {
          if (
            typeof input !== "number" ||
            !Number.isInteger(input) ||
            input < -2147483648 ||
            input > 2147483647
          )
            return false;
          value[0] = input;
        }
        this.SetValue(ConvertFontSlant(value[0] as FontSlant, "FontSlant"));
        break;
      }
    }
    return true;
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
  public override QueryValue(): FontLineStyle {
    return this.style;
  }
}

/** Validates a finite contiguous enum value. @param value - Candidate. @param first - First value. @param last - Last value. @param owner - Error owner. @returns Nothing. */
function assertEnumValue(value: number, first: number, last: number, owner: string): void {
  if (!Number.isInteger(value) || value < first || value > last)
    throw new Error(`${owner} value is invalid.`);
}

/** Original font boolean value owner. */
export class SvxContourItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy constructor. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxContourItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original zero-Which false factory. @returns Item. */
  public static override CreateDefault(): SvxContourItem {
    return new SvxContourItem(false, 0);
  }
  /** Original independent copy Clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxContourItem {
    void pool;
    return new SvxContourItem(this);
  }
}

/** Original font boolean value owner. */
export class SvxShadowedItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy constructor. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxShadowedItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original zero-Which false factory. @returns Item. */
  public static override CreateDefault(): SvxShadowedItem {
    return new SvxShadowedItem(false, 0);
  }
  /** Original independent copy Clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxShadowedItem {
    void pool;
    return new SvxShadowedItem(this);
  }
}

/** Original font boolean value owner. */
export class SvxWordLineModeItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy constructor. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxWordLineModeItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original zero-Which false factory. @returns Item. */
  public static override CreateDefault(): SvxWordLineModeItem {
    return new SvxWordLineModeItem(false, 0);
  }
  /** Original independent copy Clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxWordLineModeItem {
    void pool;
    return new SvxWordLineModeItem(this);
  }
}

/** Original font relief value and signed16 Any member transport. */
export class SvxCharReliefItem extends SfxEnumItem<FontRelief> {
  /** Original value/Which and implicit-copy constructor. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: FontRelief, which: number] | [source: Readonly<SvxCharReliefItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original zero-Which NONE factory. @returns Item. */
  public static CreateDefault(): SvxCharReliefItem {
    return new SvxCharReliefItem(FontRelief.NONE, 0);
  }
  /** Original independent copy Clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxCharReliefItem {
    void pool;
    return new SvxCharReliefItem(this);
  }
  /** Existing scalar browser projection. @returns Enum payload. */
  public override QueryValue(): number;
  /** Original member-selected signed16 Any query. @param output - Actual destination. @param member - Member identifier. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unknown-member failure leaves Any unchanged. @param output - Optional Any. @param member - Native member. @returns Success or scalar payload. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    if (output === undefined) return this.GetEnumValue();
    if ((member & 0xff & ~0x80) !== MID_RELIEF) return false;
    output.insert([(this.GetValue() << 16) >> 16], "sal_Int16");
    return true;
  }
  /** Original signed16 extraction and0through2check after member selection. @param input - Actual Any or signed16 browser scalar. @param member - Native member. @returns Success. */
  public override PutValue(input: unknown, member = 0): boolean {
    if ((member & 0xff & ~0x80) !== MID_RELIEF) return false;
    const value: [number] = [-1];
    if (input instanceof Any) {
      input.extract(value, "sal_Int16");
    } else if (
      typeof input === "number" &&
      Number.isInteger(input) &&
      input >= -32768 &&
      input <= 32767
    )
      value[0] = input;
    if (value[0] < 0 || value[0] > FontRelief.Engraved) return false;
    this.SetValue(value[0]);
    return true;
  }
}
