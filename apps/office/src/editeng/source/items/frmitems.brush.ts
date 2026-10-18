/** @fileoverview Original SvxBrushItem non-graphic color constructor/value/member family. Graphic loaders/constructors/positions/links and XComplexColor transport remain unported; no fake Graphic provider, memory manager or localized presentation. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any2Bool } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Color, COL_TRANSPARENT, insertColor, extractColor } from "../../../tools/inc/color";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { ShadingPattern } from "../../../offapi/com/sun/star/drawing/ShadingPattern";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import {
  MID_BACK_COLOR,
  MID_BACK_COLOR_R_G_B,
  MID_BACK_COLOR_TRANSPARENCY,
  MID_GRAPHIC_POSITION,
  MID_GRAPHIC,
  MID_GRAPHIC_TRANSPARENT,
  MID_GRAPHIC_URL,
  MID_GRAPHIC_FILTER,
  MID_GRAPHIC_TRANSPARENCY,
  MID_SHADING_VALUE,
  MID_BACKGROUND_COMPLEX_COLOR,
} from "../../inc/memberids";
/** Original graphic persistence version declaration; no binary codec is claimed. */
export const BRUSH_GRAPHIC_VERSION = 1;
/** Original position values; actual graphic constructor family remains separate. */
export enum SvxGraphicPosition {
  GPOS_NONE,
  GPOS_LT,
  GPOS_MT,
  GPOS_RT,
  GPOS_LM,
  GPOS_MM,
  GPOS_RM,
  GPOS_LB,
  GPOS_MB,
  GPOS_RB,
  GPOS_AREA,
  GPOS_TILED,
}
/** Original private percent conversion deliberately reserves0xff. @param percent - Native integral percentage. @returns Signed8 transparency. */
function lcl_PercentToTransparency(percent: number): number {
  return percent ? (Math.trunc((50 + 0xfe * percent) / 100) << 24) >> 24 : 0;
}
/** Original pooled brush color values; reachable instances use the non-graphic GPOS_NONE family. */
export class SvxBrushItem extends SfxPoolItem {
  private readonly maColor = new Color(COL_TRANSPARENT);
  private readonly maComplexColor = new ComplexColor();
  private readonly maFilterColor = new Color(COL_TRANSPARENT);
  private mnShadingValue: number = ShadingPattern.CLEAR;
  private mnGraphicTransparency = 0;
  /** Original Which-only/Color/Color+ComplexColor and copy forms. Source graphics overloads are not fabricated. @param args - Supported original constructor family. @returns Brush. */
  constructor(
    ...args:
      | [which: number]
      | [color: Readonly<Color>, which: number]
      | [color: Readonly<Color>, complex: Readonly<ComplexColor>, which: number]
      | [source: SvxBrushItem]
  ) {
    const first = args[0];
    super(
      typeof first === "number"
        ? first
        : first instanceof SvxBrushItem
          ? first.Which()
          : (args[args.length - 1] as number),
    );
    if (first instanceof SvxBrushItem) {
      this.maColor.assign(first.maColor);
      this.maComplexColor.assign(first.maComplexColor);
      this.maFilterColor.assign(first.maFilterColor);
      this.mnShadingValue = first.mnShadingValue;
      this.mnGraphicTransparency = first.mnGraphicTransparency;
    } else if (typeof first !== "number") {
      this.maColor.assign(first);
      if (args.length === 3) this.maComplexColor.assign(args[1] as Readonly<ComplexColor>);
    }
  }
  /** Original transparent Which0 factory. @returns Brush. */
  public static CreateDefault(): SvxBrushItem {
    return new SvxBrushItem(0);
  }
  /** Original independent copy clone, without invoking the side-effecting complex getter. @param pool - Unused pool. @returns Independent brush. */
  public override Clone(pool?: SfxItemPool): SvxBrushItem {
    void pool;
    return new SvxBrushItem(this);
  }
  /** Original non-graphic comparison includes full represented payload and omits Which. Graphic links are irrelevant in the native GPOS_NONE branch. @param other - Candidate. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxBrushItem &&
      this.maColor.equals(other.maColor) &&
      this.maComplexColor.equals(other.maComplexColor) &&
      this.maFilterColor.equals(other.maFilterColor) &&
      this.mnGraphicTransparency === other.mnGraphicTransparency &&
      this.mnShadingValue === other.mnShadingValue
    );
  }
  /** Original hash availability. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original reachable GPOS_NONE field fold through existing logical hash primitives; not a persisted native binary hash. @returns Logical unsigned64 hash. */
  public hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.maColor.toInt32());
    hash_combine(seed, this.maComplexColor.getHash());
    hash_combine(seed, this.maFilterColor.toInt32());
    hash_combine(seed, SvxGraphicPosition.GPOS_NONE);
    hash_combine(seed, this.mnGraphicTransparency);
    hash_combine(seed, this.mnShadingValue);
    return seed[0];
  }
  /** Original non-graphic color-use branch, testing full transparency. @returns Whether color is used. */
  public isUsed(): boolean {
    return !this.maColor.IsFullyTransparent();
  }
  /** Original mutable/const overloads share the same owned value. @returns Actual color. */
  public GetColor(): Color {
    return this.maColor;
  }
  /** Original full color assignment. @param color - Source. @returns Nothing. */
  public SetColor(color: Readonly<Color>): void {
    this.maColor.assign(color);
  }
  /** Original const getter mutates final color before returning its stable value. @returns Owned complex value. */
  public getComplexColor(): Readonly<ComplexColor> {
    this.maComplexColor.setFinalColor(this.GetColor());
    return this.maComplexColor;
  }
  /** Original full complex value assignment. @param color - Source. @returns Nothing. */
  public setComplexColor(color: Readonly<ComplexColor>): void {
    this.maComplexColor.assign(color);
  }
  /** Original filter color getter. @returns Owned constant color. */
  public GetFiltColor(): Readonly<Color> {
    return this.maFilterColor;
  }
  /** Original filter color assignment. @param color - Source. @returns Nothing. */
  public SetFiltColor(color: Readonly<Color>): void {
    this.maFilterColor.assign(color);
  }
  /** Original shading numeric value. @returns Value. */
  public GetShadingValue(): number {
    return this.mnShadingValue;
  }
  /** Original signed8 graphic-percentage state, without a fabricated graphic object. @returns Value. */
  public getGraphicTransparency(): number {
    return this.mnGraphicTransparency;
  }
  /** Original signed8 setter; graphic application is absent in this supported no-graphic family. @param value - Signed8 source value. @returns Nothing. */
  public setGraphicTransparency(value: number): void {
    value = (value << 24) >> 24;
    if (value !== this.mnGraphicTransparency) this.mnGraphicTransparency = value;
  }
  /** Original rounded integer conversion and signed8 result. @param transparency - Valid native int32 domain without signed multiplication overflow. @returns Percentage. */
  public static TransparencyToPercent(transparency: number): number {
    return (Math.trunc((transparency * 100 + 127) / 254) << 24) >> 24;
  }
  /** Original supported typed member queries; no extra browser snapshot projection is invented. Missing actual provider selectors returnfalse. @param output - Actual Any, absent only at the inherited unsupported browser boundary. @param member - Unsigned8 selector. @returns Success or inherited absent projection. */
  public override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    switch (member & 0xff & ~0x80) {
      case MID_BACK_COLOR:
        insertColor(output, this.maColor);
        break;
      case MID_BACK_COLOR_R_G_B:
        insertColor(output, this.maColor.GetRGBColor());
        break;
      case MID_BACK_COLOR_TRANSPARENCY:
        output.insert(
          [SvxBrushItem.TransparencyToPercent(255 - this.maColor.GetAlpha())],
          "sal_Int8",
        );
        break;
      case MID_GRAPHIC_TRANSPARENT:
        output.insert([this.maColor.GetAlpha() === 0], "bool");
        break;
      case MID_GRAPHIC_TRANSPARENCY:
        output.insert([this.mnGraphicTransparency], "sal_Int8");
        break;
      case MID_SHADING_VALUE:
        output.insert([this.mnShadingValue], "sal_Int32");
        break;
      case MID_GRAPHIC_POSITION:
      case MID_GRAPHIC:
      case MID_GRAPHIC_URL:
      case MID_GRAPHIC_FILTER:
      case MID_BACKGROUND_COMPLEX_COLOR:
        return false;
    }
    return true;
  }
  /** Original color/scalar member writes, including failed graphic-percentage extraction defaulting to0. @param input - Actual Any or existing bool binding. @param member - Native unsigned8 selector. @returns Success. */
  public override PutValue(input: unknown, member: number): boolean {
    const key = member & 0xff & ~0x80;
    switch (key) {
      case MID_BACK_COLOR:
      case MID_BACK_COLOR_R_G_B: {
        const color = new Color();
        if (!(input instanceof Any) || !extractColor(input, color)) return false;
        if (key === MID_BACK_COLOR_R_G_B) color.SetAlpha(this.maColor.GetAlpha());
        this.maColor.assign(color);
        break;
      }
      case MID_BACK_COLOR_TRANSPARENCY: {
        const value: [number] = [0];
        if (
          !(input instanceof Any) ||
          !input.extract(value, "sal_Int32") ||
          value[0] < 0 ||
          value[0] > 100
        )
          return false;
        this.maColor.SetAlpha(255 - lcl_PercentToTransparency(value[0]));
        break;
      }
      case MID_GRAPHIC_TRANSPARENT:
        this.maColor.SetAlpha(Any2Bool(input) ? 0 : 255);
        break;
      case MID_GRAPHIC_TRANSPARENCY: {
        const value: [number] = [0];
        if (input instanceof Any) input.extract(value, "sal_Int32");
        if (value[0] >= 0 && value[0] <= 100) this.mnGraphicTransparency = (value[0] << 24) >> 24;
        break;
      }
      case MID_SHADING_VALUE: {
        const value: [number] = [0];
        if (!(input instanceof Any) || !input.extract(value, "sal_Int32")) return false;
        this.mnShadingValue = value[0];
        break;
      }
      case MID_GRAPHIC_POSITION:
      case MID_GRAPHIC:
      case MID_GRAPHIC_URL:
      case MID_GRAPHIC_FILTER:
      case MID_BACKGROUND_COMPLEX_COLOR:
        return false;
    }
    return true;
  }
}
