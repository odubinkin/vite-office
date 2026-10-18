/**
 * @fileoverview Reimplements bounded EditEngine character items from pinned `editeng/source/items/textitem.cxx`.
 */
import { SfxBoolItem, SfxEnumItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontWeight } from "../../../tools/inc/fontenum";
import { FontItalic } from "../../../tools/inc/fontenum";
import {
  FontSlant,
  cppu_detail_getUnoType_FontSlant,
} from "../../../offapi/com/sun/star/awt/FontSlant";
import { ConvertFontSlant, ConvertFontWeight } from "../../../vcl/inc/unohelp";
import { Any2Bool } from "../../../svl/inc/poolitem";
import { FontRelief } from "../../../vcl/inc/fntstyle";
import { MID_RELIEF, MID_ITALIC, MID_POSTURE, MID_BOLD, MID_WEIGHT } from "../../inc/memberids";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { Color, COL_TRANSPARENT, insertColor, extractColor } from "../../../tools/inc/color";
import { FontLineStyle as F } from "../../../tools/inc/fontenum";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import {
  MID_TEXTLINED,
  MID_TL_STYLE,
  MID_TL_COLOR,
  MID_TL_HASCOLOR,
  MID_TL_COMPLEX_COLOR,
} from "../../inc/memberids";

export { SvxFontItem } from "./textitem.font";

export { SvxFontHeightItem } from "./textitem.height";

export { FontLineStyle } from "../../../tools/inc/fontenum";

/** Original native weight enum and bool/float Any member transport. */
export class SvxWeightItem extends SfxEnumItem<FontWeight> {
  /** Original value/Which and copy forms; existing JS scalar validation is an explicit host boundary over native enum range. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: FontWeight, which: number] | [source: Readonly<SvxWeightItem>]) {
    if (args.length === 1) super(args[0]);
    else {
      assertEnumValue(args[0], 0, 0x7fffffff, "SvxWeightItem");
      super(args[1], args[0]);
    }
  }
  /** Original NORMAL default factory. @returns Item. */
  public static CreateDefault(): SvxWeightItem {
    return new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 0);
  }
  /** Original enum getter. @returns Weight. */
  public GetWeight(): FontWeight {
    return this.GetValue();
  }
  /** Original bool support. @returns True. */
  public override HasBoolValue(): boolean {
    return true;
  }
  /** Original bold threshold. @returns At least BOLD. */
  public override GetBoolValue(): boolean {
    return this.GetValue() >= FontWeight.WEIGHT_BOLD;
  }
  /** Original bool setter selects BOLD or NORMAL. @param value - Bool. @returns Nothing. */
  public override SetBoolValue(value: boolean): void {
    this.SetValue(value ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL);
  }
  /** Original copy Clone retains Which. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxWeightItem {
    void pool;
    return new SvxWeightItem(this);
  }
  /** Existing browser scalar enum projection. @returns Stored enum. */
  public override QueryValue(): FontWeight;
  /** Original bool/float Any query. @param output - Actual destination. @param member - Native member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unknown-member untouched success. @param output - Optional Any. @param member - Native member. @returns Success or browser enum. */
  public override QueryValue(output?: Any, member = 0): boolean | FontWeight {
    if (output === undefined) return this.GetValue();
    switch (member & 0xff & ~0x80) {
      case MID_BOLD:
        output.insert([this.GetBoolValue()], "bool");
        break;
      case MID_WEIGHT:
        output.insert([ConvertFontWeight(this.GetValue(), "FontWeight")], "float");
        break;
    }
    return true;
  }
  /** Original double then signed32 fallback followed by float cast; actual LONG source types are a subset of DOUBLE, without forcing an impossible fallback-success peer. @param input - Actual Any or browser floating scalar. @param member - Native member. @returns Success. */
  public override PutValue(input: unknown, member = 0): boolean {
    switch (member & 0xff & ~0x80) {
      case MID_BOLD:
        this.SetBoolValue(Any2Bool(input));
        break;
      case MID_WEIGHT: {
        const value: [number] = [0];
        if (input instanceof Any) {
          if (!input.extract(value, "double") && !input.extract(value, "sal_Int32")) return false;
        } else {
          if (typeof input !== "number") return false;
          value[0] = input;
        }
        this.SetValue(ConvertFontWeight(value[0], "float"));
        break;
      }
    }
    return true;
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
    return new SvxPostureItem(FontItalic.ITALIC_NONE, 0);
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
    return this.GetValue() >= FontItalic.ITALIC_OBLIQUE;
  }
  /** Original bool setter selects NORMAL or NONE. @param value - Bool. @returns Nothing. */
  public override SetBoolValue(value: boolean): void {
    this.SetValue(value ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE);
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

/** Original common underline/overline value base. */
export class SvxTextLineItem extends SfxEnumItem<F> {
  private readonly maColor = new Color(COL_TRANSPARENT);
  private readonly maComplexColor = new ComplexColor();
  /** Original value/Which and implicit-copy forms. @param args - Native selected form. @returns Item. */
  constructor(...args: [style: F, which: number] | [source: Readonly<SvxTextLineItem>]) {
    if (args.length === 1) {
      super(args[0]);
      this.maColor.assign(args[0].GetColor());
      this.maComplexColor.assign(args[0].getComplexColor());
    } else super(args[1], args[0]);
  }
  /** Original complete concrete-type/value/color/complex comparison. @param other - Candidate. @returns Payload equality, omitting Which. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      super.equals(other) &&
      this.maColor.equals((other as SvxTextLineItem).maColor) &&
      this.maComplexColor.equals((other as SvxTextLineItem).maComplexColor)
    );
  }
  /** Original copy clone retaining every value. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxTextLineItem {
    void pool;
    return new SvxTextLineItem(this);
  }
  /** Original enum cast getter. @returns Style. */
  public GetLineStyle(): F {
    return this.GetValue();
  }
  /** Original style setter. @param style - Native enum. @returns Nothing. */
  public SetLineStyle(style: F): void {
    this.SetValue(style);
  }
  /** Original bool support. @returns True. */
  public override HasBoolValue(): boolean {
    return true;
  }
  /** Original non-NONE projection. @returns Active state. */
  public override GetBoolValue(): boolean {
    return this.GetValue() !== F.LINESTYLE_NONE;
  }
  /** Original boolean assignment chooses only SINGLE/NONE. @param value - Active state. @returns Nothing. */
  public override SetBoolValue(value: boolean): void {
    this.SetValue(value ? F.LINESTYLE_SINGLE : F.LINESTYLE_NONE);
  }
  /** Original borrowed const color. @returns Owned value. */
  public GetColor(): Readonly<Color> {
    return this.maColor;
  }
  /** Original color assignment, including alpha. @param color - Source. @returns Nothing. */
  public SetColor(color: Readonly<Color>): void {
    this.maColor.assign(color);
  }
  /** Original borrowed const complex color. @returns Owned value. */
  public getComplexColor(): Readonly<ComplexColor> {
    return this.maComplexColor;
  }
  /** Original complex value assignment. @param color - Source. @returns Nothing. */
  public setComplexColor(color: Readonly<ComplexColor>): void {
    this.maComplexColor.assign(color);
  }
  /** Existing browser scalar style projection. @returns Style. */
  public override QueryValue(): F;
  /** Original supported member Any queries. Actual complex interface transport is explicitly unsupported. @param output - Actual Any. @param member - Native unsigned8 selector. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original selector normalization and unknown-member untouched success. @param output - Optional Any. @param member - Native selector. @returns Success or browser scalar. */
  public override QueryValue(output?: Any, member = 0): boolean | F {
    if (output === undefined) return this.GetLineStyle();
    switch (member & 0xff & ~0x80) {
      case MID_TEXTLINED:
        output.insert([this.GetBoolValue()], "bool");
        break;
      case MID_TL_STYLE:
        output.insert([(this.GetValue() << 16) >> 16], "sal_Int16");
        break;
      case MID_TL_COLOR:
        insertColor(output, this.maColor);
        break;
      case MID_TL_HASCOLOR:
        output.insert([this.maColor.GetAlpha() === 255], "bool");
        break;
      case MID_TL_COMPLEX_COLOR:
        return false;
    }
    return true;
  }
  /** Original supported member writes; color writes preserve the stored alpha. Actual complex-interface input remains unsupported, never interpreted as a fake plain object. @param input - Actual Any or established scalar browser binding. @param member - Native selector. @returns Success. */
  public override PutValue(input: unknown, member: number): boolean {
    switch (member & 0xff & ~0x80) {
      case MID_TEXTLINED:
        this.SetBoolValue(Any2Bool(input));
        break;
      case MID_TL_STYLE: {
        const value: [number] = [0];
        if (input instanceof Any) {
          if (!input.extract(value, "sal_Int32")) return false;
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
        this.SetValue(value[0] as F);
        break;
      }
      case MID_TL_COLOR: {
        const color = new Color();
        if (!(input instanceof Any) || !extractColor(input, color)) return false;
        const alpha = this.maColor.GetAlpha();
        this.maColor.assign(color);
        this.maColor.SetAlpha(alpha);
        break;
      }
      case MID_TL_HASCOLOR:
        this.maColor.SetAlpha(Any2Bool(input) ? 255 : 0);
        break;
      case MID_TL_COMPLEX_COLOR:
        return false;
    }
    return true;
  }
}
/** Original underline specialization. */
export class SvxUnderlineItem extends SvxTextLineItem {
  /** Original zero-Which NONE default. @returns Item. */
  public static CreateDefault(): SvxUnderlineItem {
    return new SvxUnderlineItem(F.LINESTYLE_NONE, 0);
  }
  /** Original concrete copy clone. @param pool - Unused pool. @returns Independent underline. */
  public override Clone(pool?: SfxItemPool): SvxUnderlineItem {
    void pool;
    return new SvxUnderlineItem(this);
  }
}
/** Original overline specialization. */
export class SvxOverlineItem extends SvxTextLineItem {
  /** Original zero-Which NONE default. @returns Item. */
  public static CreateDefault(): SvxOverlineItem {
    return new SvxOverlineItem(F.LINESTYLE_NONE, 0);
  }
  /** Original concrete copy clone. @param pool - Unused pool. @returns Independent overline. */
  public override Clone(pool?: SfxItemPool): SvxOverlineItem {
    void pool;
    return new SvxOverlineItem(this);
  }
}
