/** @fileoverview Native represented font metadata,paint,alignment and stored size over immutable JS values;configuration,rendering and device resolution remain pending. */
import {
  FontFamily,
  FontPitch,
  FontWeight,
  FontItalic,
  TextAlign,
  FontLineStyle,
  FontStrikeout,
  FontEmphasisMark,
} from "../../../tools/inc/fontenum";
import { FontRelief } from "../../inc/fntstyle";
import { RTL_TEXTENCODING_DONTKNOW, type rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";

import { Color, COL_TRANSPARENT } from "../../../tools/inc/color";
import { Size, type ReadonlySize } from "../../../tools/inc/gen";

/** Represented ImplFont fields retain their original defaults; no native lifetime machinery. */
interface FontMetadata {
  readonly familyName: string;
  readonly styleName: string;
  readonly family: FontFamily;
  readonly pitch: FontPitch;
  readonly charSet: rtl_TextEncoding;
  readonly weight: FontWeight;
  readonly italic: FontItalic;
  readonly color: Readonly<Color>;
  readonly fillColor: Readonly<Color>;
  readonly transparent: boolean;
  readonly alignment: TextAlign;
  readonly fontSize: ReadonlySize;
  readonly outline: boolean;
  readonly shadow: boolean;
  readonly underline: FontLineStyle;
  readonly overline: FontLineStyle;
  readonly strikeout: FontStrikeout;
  readonly relief: FontRelief;
  readonly emphasisMark: FontEmphasisMark;
}
const globalDefault: Readonly<FontMetadata> = Object.freeze({
  familyName: "",
  styleName: "",
  family: FontFamily.FAMILY_DONTKNOW,
  pitch: FontPitch.PITCH_DONTKNOW,
  charSet: RTL_TEXTENCODING_DONTKNOW,
  weight: FontWeight.WEIGHT_DONTKNOW,
  italic: FontItalic.ITALIC_NONE,
  color: Object.freeze(new Color(COL_TRANSPARENT)),
  fillColor: Object.freeze(new Color(COL_TRANSPARENT)),
  transparent: true,
  alignment: TextAlign.ALIGN_TOP,
  fontSize: Object.freeze(new Size()),
  outline: false,
  shadow: false,
  underline: FontLineStyle.LINESTYLE_NONE,
  overline: FontLineStyle.LINESTYLE_NONE,
  strikeout: FontStrikeout.STRIKEOUT_NONE,
  relief: FontRelief.NONE,
  emphasisMark: FontEmphasisMark.NONE,
});
/** Const reference excludes every represented native mutator. */
export type ConstFont = Omit<Font, Extract<keyof Font, `Set${string}`> | "assign">;
/** Shared VCL value owner; unrepresented native attributes and MaybeAskConfig are not approximated. */
export class Font {
  private mpImplFont: Readonly<FontMetadata>;
  /** Shares immutable default/copied metadata until this handle changes. @param font - Optional source. @returns Nothing. */
  public constructor(font?: ConstFont) {
    this.mpImplFont = font === undefined ? globalDefault : (font as Font).mpImplFont;
  }
  /** Original copy assignment shares immutable font data while retaining the recipient handle. @param font - Actual const source. @returns Recipient. */
  public assign(font: ConstFont): this {
    this.mpImplFont = (font as Font).mpImplFont;
    return this;
  }
  /** Native const family name. @returns Family name. */
  public GetFamilyName(): string {
    return this.mpImplFont.familyName;
  }
  /** Native guarded assignment. @param name - Family name. @returns Nothing. */
  public SetFamilyName(name: string): void {
    if (this.GetFamilyName() !== name)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, familyName: name });
  }
  /** Native const style name. @returns Style name. */
  public GetStyleName(): string {
    return this.mpImplFont.styleName;
  }
  /** Native guarded style assignment. @param name - Style name. @returns Nothing. */
  public SetStyleName(name: string): void {
    if (this.GetStyleName() !== name)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, styleName: name });
  }
  /** Native stored family accessor; does not call AskConfig. @returns Family. */
  public GetFamilyType(): FontFamily {
    return this.mpImplFont.family;
  }
  /** Native const reference accessor of the same stored enum. @returns Family. */
  public GetFontFamily(): FontFamily {
    return this.mpImplFont.family;
  }
  /** Native guarded family assignment. @param family - Family. @returns Nothing. */
  public SetFamily(family: FontFamily): void {
    if (this.GetFamilyType() !== family)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, family });
  }
  /** Native stored pitch accessor; does not call AskConfig. @returns Pitch. */
  public GetPitch(): FontPitch {
    return this.mpImplFont.pitch;
  }
  /** Native guarded pitch assignment. @param pitch - Pitch. @returns Nothing. */
  public SetPitch(pitch: FontPitch): void {
    if (this.GetPitch() !== pitch) this.mpImplFont = Object.freeze({ ...this.mpImplFont, pitch });
  }
  /** Native stored encoding. @returns Encoding. */
  public GetCharSet(): rtl_TextEncoding {
    return this.mpImplFont.charSet;
  }
  /** Native guarded encoding assignment. @param charSet - Encoding. @returns Nothing. */
  public SetCharSet(charSet: rtl_TextEncoding): void {
    if (this.GetCharSet() !== charSet)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, charSet });
  }
  /** Native stored weight accessor; configuration lookup belongs to MaybeAskConfig, not this const operation. @returns Stored weight. */
  public GetWeight(): FontWeight {
    return this.mpImplFont.weight;
  }
  /** Native guarded weight assignment. @param weight - Original weight enum. @returns Nothing. */
  public SetWeight(weight: FontWeight): void {
    if (this.GetWeight() !== weight)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, weight });
  }
  /** Native stored italic accessor without configuration lookup. @returns Stored italic. */
  public GetItalic(): FontItalic {
    return this.mpImplFont.italic;
  }
  /** Native guarded italic assignment. @param italic - Original italic enum. @returns Nothing. */
  public SetItalic(italic: FontItalic): void {
    if (this.GetItalic() !== italic)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, italic });
  }
  /** Original stored outline flag. @returns Outline. */
  public IsOutline(): boolean {
    return this.mpImplFont.outline;
  }
  /** Original guarded outline assignment. @param outline - Flag. @returns Nothing. */
  public SetOutline(outline: boolean): void {
    if (this.IsOutline() !== outline)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, outline });
  }
  /** Original stored shadow flag. @returns Shadow. */
  public IsShadow(): boolean {
    return this.mpImplFont.shadow;
  }
  /** Original guarded shadow assignment. @param shadow - Flag. @returns Nothing. */
  public SetShadow(shadow: boolean): void {
    if (this.IsShadow() !== shadow) this.mpImplFont = Object.freeze({ ...this.mpImplFont, shadow });
  }
  /** Original stored underline enum. @returns Underline. */
  public GetUnderline(): FontLineStyle {
    return this.mpImplFont.underline;
  }
  /** Original guarded underline assignment. @param underline - Style. @returns Nothing. */
  public SetUnderline(underline: FontLineStyle): void {
    if (this.GetUnderline() !== underline)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, underline });
  }
  /** Original stored overline enum. @returns Overline. */
  public GetOverline(): FontLineStyle {
    return this.mpImplFont.overline;
  }
  /** Original guarded overline assignment. @param overline - Style. @returns Nothing. */
  public SetOverline(overline: FontLineStyle): void {
    if (this.GetOverline() !== overline)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, overline });
  }
  /** Original stored strikeout enum. @returns Strikeout. */
  public GetStrikeout(): FontStrikeout {
    return this.mpImplFont.strikeout;
  }
  /** Original guarded strikeout assignment. @param strikeout - Style. @returns Nothing. */
  public SetStrikeout(strikeout: FontStrikeout): void {
    if (this.GetStrikeout() !== strikeout)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, strikeout });
  }
  /** Original stored relief enum. @returns Relief. */
  public GetRelief(): FontRelief {
    return this.mpImplFont.relief;
  }
  /** Original guarded relief assignment. @param relief - Relief. @returns Nothing. */
  public SetRelief(relief: FontRelief): void {
    if (this.GetRelief() !== relief)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, relief });
  }
  /** Original stored emphasis flags. @returns Emphasis. */
  public GetEmphasisMark(): FontEmphasisMark {
    return this.mpImplFont.emphasisMark;
  }
  /** Original guarded emphasis assignment. @param emphasisMark - Flags. @returns Nothing. */
  public SetEmphasisMark(emphasisMark: FontEmphasisMark): void {
    if (this.GetEmphasisMark() !== emphasisMark)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, emphasisMark });
  }
  /** Original cow_wrapper comparison admits shared state or equal values despite this method name;reuse represented Font equality without implementing C++ ownership. @param other - Font. @returns Equal represented value. */
  public IsSameInstance(other: ConstFont): boolean {
    return Font.prototype.Equals.call(this, other);
  }
  /** Native borrowed const color value,valid until owner mutation. @returns Color. */
  public GetColor(): Readonly<Color> {
    return this.mpImplFont.color;
  }
  /** Native guarded color assignment copies the input value. @param color - Native color. @returns Nothing. */
  public SetColor(color: Readonly<Color>): void {
    if (!this.GetColor().equals(color))
      this.mpImplFont = Object.freeze({
        ...this.mpImplFont,
        color: Object.freeze(new Color(color)),
      });
  }
  /** Native borrowed const fill color,valid until owner mutation. @returns Fill. */
  public GetFillColor(): Readonly<Color> {
    return this.mpImplFont.fillColor;
  }
  /** Native transparent-fill side effect occurs only when the color changes;opaque fill does not force transparency false. @param color - Fill color. @returns Nothing. */
  public SetFillColor(color: Readonly<Color>): void {
    if (!this.GetFillColor().equals(color))
      this.mpImplFont = Object.freeze({
        ...this.mpImplFont,
        fillColor: Object.freeze(new Color(color)),
        transparent: color.IsTransparent() ? true : this.mpImplFont.transparent,
      });
  }
  /** Native transparency state is independent of fill color. @returns Transparency. */
  public IsTransparent(): boolean {
    return this.mpImplFont.transparent;
  }
  /** Native guarded transparency assignment. @param transparent - Flag. @returns Nothing. */
  public SetTransparent(transparent: boolean): void {
    if (this.IsTransparent() !== transparent)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, transparent });
  }
  /** Native stored alignment,without device resolution. @returns Alignment. */
  public GetAlignment(): TextAlign {
    return this.mpImplFont.alignment;
  }
  /** Native guarded alignment assignment. @param alignment - Alignment. @returns Nothing. */
  public SetAlignment(alignment: TextAlign): void {
    if (this.GetAlignment() !== alignment)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, alignment });
  }
  /** Native stored size value,borrowed until owner mutation. @returns Size. */
  public GetFontSize(): ReadonlySize {
    return this.mpImplFont.fontSize;
  }
  /** Native average size aliases the same stored value;renderer calculated-width cache remains unimplemented. @returns Size. */
  public GetAverageFontSize(): ReadonlySize {
    return this.mpImplFont.fontSize;
  }
  /** Native guarded size assignment copies geometry. No device-dependent cache is introduced. @param size - Actual size. @returns Nothing. */
  public SetFontSize(size: ReadonlySize): void {
    if (
      this.GetFontSize().Width() !== size.Width() ||
      this.GetFontSize().Height() !== size.Height()
    )
      this.mpImplFont = Object.freeze({
        ...this.mpImplFont,
        fontSize: Object.freeze(new Size(size)),
      });
  }
  /** Native height query. @returns Stored height. */
  public GetFontHeight(): number {
    return this.mpImplFont.fontSize.Height();
  }
  /** Native height-only assignment keeps average width. @param height - Height. @returns Nothing. */
  public SetFontHeight(height: number): void {
    this.SetFontSize(new Size(this.mpImplFont.fontSize.Width(), height));
  }
  /** Native stored average width. @returns Width. */
  public GetAverageFontWidth(): number {
    return this.mpImplFont.fontSize.Width();
  }
  /** Native width-only assignment keeps height. @param width - Width. @returns Nothing. */
  public SetAverageFontWidth(width: number): void {
    this.SetFontSize(new Size(width, this.mpImplFont.fontSize.Height()));
  }
  /** Native comparison excludes only color/fill;all other represented font fields participate. Full unrepresented font attributes remain pending. @param other - Native font. @returns Equal represented noncolor value. */
  public EqualIgnoreColor(other: ConstFont): boolean {
    return (
      this.GetWeight() === other.GetWeight() &&
      this.GetItalic() === other.GetItalic() &&
      this.IsOutline() === other.IsOutline() &&
      this.IsShadow() === other.IsShadow() &&
      this.GetUnderline() === other.GetUnderline() &&
      this.GetOverline() === other.GetOverline() &&
      this.GetStrikeout() === other.GetStrikeout() &&
      this.GetRelief() === other.GetRelief() &&
      this.GetEmphasisMark() === other.GetEmphasisMark() &&
      this.GetFamilyType() === other.GetFamilyType() &&
      this.GetPitch() === other.GetPitch() &&
      this.GetCharSet() === other.GetCharSet() &&
      this.GetFamilyName() === other.GetFamilyName() &&
      this.GetStyleName() === other.GetStyleName() &&
      this.GetAlignment() === other.GetAlignment() &&
      this.IsTransparent() === other.IsTransparent() &&
      this.GetFontSize().Width() === other.GetFontSize().Width() &&
      this.GetFontSize().Height() === other.GetFontSize().Height()
    );
  }
  /** Native represented value equality includes color and fill after the noncolor comparison. @param other - Native font. @returns Equality. */
  public Equals(other: ConstFont): boolean {
    return (
      this.EqualIgnoreColor(other) &&
      this.GetColor().equals(other.GetColor()) &&
      this.GetFillColor().equals(other.GetFillColor())
    );
  }
}
