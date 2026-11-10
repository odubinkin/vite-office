/** @fileoverview Native represented font metadata,paint,alignment and stored size over immutable JS values;configuration,rendering and device resolution remain pending. */
import {
  FontFamily,
  FontPitch,
  FontWeight,
  FontWidth,
  FontItalic,
  TextAlign,
  FontLineStyle,
  FontStrikeout,
  FontEmphasisMark,
} from "../../../tools/inc/fontenum";
import { FontRelief, FontKerning } from "../../inc/fntstyle";
import { RTL_TEXTENCODING_DONTKNOW, type rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";

import { Color, COL_TRANSPARENT } from "../../../tools/inc/color";
import { Size, type ReadonlySize } from "../../../tools/inc/gen";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { LanguageType, LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";

import { Variation } from "../../inc/font/Variation";
import type { Degree10 } from "../../../tools/inc/degree";

/** Represented ImplFont fields retain their original defaults; no native lifetime machinery. */
interface FontMetadata {
  readonly orientation: Degree10;
  readonly vertical: boolean;
  readonly kerning: FontKerning;
  readonly spacing: number;
  readonly wordLine: boolean;
  readonly opticalSizing: boolean;
  readonly variations: readonly Readonly<Variation>[];
  readonly languageTag: LanguageTag;
  readonly familyName: string;
  readonly styleName: string;
  readonly family: FontFamily;
  readonly pitch: FontPitch;
  readonly charSet: rtl_TextEncoding;
  readonly weight: FontWeight;
  readonly width: FontWidth;
  readonly configLookup: boolean;
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
  orientation: 0,
  vertical: false,
  kerning: FontKerning.FontSpecific,
  spacing: 0,
  wordLine: false,
  opticalSizing: false,
  variations: Object.freeze([]),
  languageTag: new LanguageTag(LANGUAGE_DONTKNOW),
  familyName: "",
  styleName: "",
  family: FontFamily.FAMILY_DONTKNOW,
  pitch: FontPitch.PITCH_DONTKNOW,
  charSet: RTL_TEXTENCODING_DONTKNOW,
  weight: FontWeight.WEIGHT_DONTKNOW,
  width: FontWidth.WIDTH_DONTKNOW,
  configLookup: false,
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
export type ConstFont = Omit<
  Font,
  Extract<keyof Font, `Set${string}` | `Get${string}MaybeAskConfig`> | "assign"
>;
/** Shared VCL value owner with native one-shot configuration lookup over the shipped substitution resource. */
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
  /** Original stored orientation value. @returns Source member. */
  public GetOrientation(): Degree10 {
    return this.mpImplFont.orientation;
  }
  /** Original guarded orientation assignment. @param value - Original assigned value. @returns Nothing. */
  public SetOrientation(value: Degree10): void {
    value = (value << 16) >> 16;
    if (this.GetOrientation() !== value)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, orientation: value });
  }
  /** Original stored vertical value. @returns Source member. */
  public IsVertical(): boolean {
    return this.mpImplFont.vertical;
  }
  /** Original guarded vertical assignment. @param value - Original assigned value. @returns Nothing. */
  public SetVertical(value: boolean): void {
    if (this.IsVertical() !== value)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, vertical: value });
  }
  /** Original stored kerning value. @returns Source member. */
  public GetKerning(): FontKerning {
    return this.mpImplFont.kerning;
  }
  /** Original guarded kerning assignment. @param value - Original assigned value. @returns Nothing. */
  public SetKerning(value: FontKerning): void {
    if (this.GetKerning() !== value)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, kerning: value });
  }
  /** Original stored spacing value. @returns Source member. */
  public GetFixKerning(): number {
    return this.mpImplFont.spacing;
  }
  /** Original guarded spacing assignment. @param value - Original assigned value. @returns Nothing. */
  public SetFixKerning(value: number): void {
    value = (value << 16) >> 16;
    if (this.GetFixKerning() !== value)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, spacing: value });
  }
  /** Original stored wordLine value. @returns Source member. */
  public IsWordLineMode(): boolean {
    return this.mpImplFont.wordLine;
  }
  /** Original guarded wordLine assignment. @param value - Original assigned value. @returns Nothing. */
  public SetWordLineMode(value: boolean): void {
    if (this.IsWordLineMode() !== value)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, wordLine: value });
  }
  /** Original stored opticalSizing value. @returns Source member. */
  public GetOpticalSizing(): boolean {
    return this.mpImplFont.opticalSizing;
  }
  /** Original guarded opticalSizing assignment. @param value - Original assigned value. @returns Nothing. */
  public SetOpticalSizing(value: boolean): void {
    if (this.GetOpticalSizing() !== value)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, opticalSizing: value });
  }
  /** Original nonzero kerning predicate includes either flag. @returns Kerning enabled. */
  public IsKerning(): boolean {
    return this.GetKerning() !== FontKerning.NONE;
  }
  /** Original nonzero signed spacing predicate. @returns Fixed kerning enabled. */
  public IsFixKerning(): boolean {
    return this.GetFixKerning() !== 0;
  }
  /** Original borrowed ordered axis vector. @returns Represented immutable vector. */
  public GetVariations(): readonly Readonly<Variation>[] {
    return this.mpImplFont.variations;
  }
  /** Original ordered vector equality guard and aggregate value copy, including float NaN inequality. @param values - Borrowed axes. @returns Nothing. */
  public SetVariations(values: readonly Readonly<Variation>[]): void {
    if (
      this.mpImplFont.variations.length === values.length &&
      this.mpImplFont.variations.every(
        /** Original axis equality at its ordered position. @param axis - Existing axis. @param index - Position. @returns Equality. */
        (axis, index) => axis.equals(values[index] as Variation),
      )
    )
      return;
    this.mpImplFont = Object.freeze({
      ...this.mpImplFont,
      variations: Object.freeze(
        values.map(
          /** Original aggregate value copy. @param axis - Borrowed axis. @returns Owned immutable axis. */
          (axis) => Object.freeze(new Variation(axis)),
        ),
      ),
    });
  }
  /** Original unresolved language-ID query through the actual LanguageTag value. @returns Original stored ID or SYSTEM. */
  public GetLanguage(): number {
    return this.mpImplFont.languageTag.getLanguageType(false);
  }
  /** Original guarded LanguageTag reset; immutable ImplFont sharing binds native COW without changing other font values. @param language - Original language ID. @returns Nothing. */
  public SetLanguage(language: number): void {
    language = LanguageType(language);
    if (this.GetLanguage() !== language)
      this.mpImplFont = Object.freeze({
        ...this.mpImplFont,
        languageTag: new LanguageTag(language),
      });
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
  /** Original nonconst ImplFont accessor performs the one-shot configuration lookup only for an unknown family. @returns Family. */
  public GetFamilyTypeMaybeAskConfig(): FontFamily {
    if (this.mpImplFont.family === FontFamily.FAMILY_DONTKNOW) this.AskConfig();
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
  /** Original nonconst pitch accessor only asks configuration while pitch is unknown. @returns Pitch. */
  public GetPitchMaybeAskConfig(): FontPitch {
    if (this.mpImplFont.pitch === FontPitch.PITCH_DONTKNOW) this.AskConfig();
    return this.mpImplFont.pitch;
  }
  /** Original stored width accessor does not ask configuration. @returns Width. */
  public GetWidthType(): FontWidth {
    return this.mpImplFont.width;
  }
  /** Original nonconst width accessor. @returns Width after optional configuration lookup. */
  public GetWidthTypeMaybeAskConfig(): FontWidth {
    if (this.mpImplFont.width === FontWidth.WIDTH_DONTKNOW) this.AskConfig();
    return this.mpImplFont.width;
  }
  /** Original guarded width assignment; it does not reset the one-shot lookup flag. @param width - New width. @returns Nothing. */
  public SetWidthType(width: FontWidth): void {
    if (this.GetWidthType() !== width)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, width });
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
  /** Original nonconst weight accessor. @returns Weight after optional configuration lookup. */
  public GetWeightMaybeAskConfig(): FontWeight {
    if (this.mpImplFont.weight === FontWeight.WEIGHT_DONTKNOW) this.AskConfig();
    return this.mpImplFont.weight;
  }
  /** Original ImplFont::AskConfig, including metadata precedence and the lookup flag retained across later family-name changes. Immutable data replacement is this Font carrier's existing copy-on-write binding. @returns Nothing. */
  private AskConfig(): void {
    if (this.mpImplFont.configLookup) return;
    this.mpImplFont = Object.freeze({ ...this.mpImplFont, configLookup: true });
    const source = new Uint16Array(this.GetFamilyName().length);
    for (let i = 0; i < source.length; ++i) source[i] = this.GetFamilyName().charCodeAt(i);
    const normalized = GetEnglishSearchFontName(source);
    let mapName = "";
    try {
      for (let i = 0; i < normalized.getLength(); ++i)
        mapName += String.fromCharCode(normalized.getStr()[i] as number);
    } finally {
      normalized.dispose();
    }
    const shortName: [string] = [""],
      familyName: [string] = [""],
      type: [ImplFontAttrs] = [ImplFontAttrs.None],
      weight: [FontWeight] = [FontWeight.WEIGHT_DONTKNOW],
      width: [FontWidth] = [FontWidth.WIDTH_DONTKNOW];
    FontSubstConfiguration.getMapName(mapName, shortName, familyName, weight, width, type);
    const config = FontSubstConfiguration.get();
    let attributes = config.getSubstInfo(mapName);
    if (attributes === null && shortName[0] !== mapName)
      attributes = config.getSubstInfo(shortName[0]);
    if (attributes !== null) {
      if (this.GetFamilyType() === FontFamily.FAMILY_DONTKNOW)
        this.SetFamily(FamilyFromAttributes(attributes.Type));
      if (this.GetPitch() === FontPitch.PITCH_DONTKNOW && attributes.Type & ImplFontAttrs.Fixed)
        this.SetPitch(FontPitch.PITCH_FIXED);
    }
    if (this.GetFamilyType() === FontFamily.FAMILY_DONTKNOW)
      this.SetFamily(FamilyFromAttributes(type[0]));
    if (this.GetWeightMaybeAskConfig() === FontWeight.WEIGHT_DONTKNOW) this.SetWeight(weight[0]);
    if (this.GetWidthType() === FontWidth.WIDTH_DONTKNOW) this.SetWidthType(width[0]);
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
      this.GetOrientation() === other.GetOrientation() &&
      this.IsVertical() === other.IsVertical() &&
      this.GetKerning() === other.GetKerning() &&
      this.GetFixKerning() === other.GetFixKerning() &&
      this.IsWordLineMode() === other.IsWordLineMode() &&
      this.GetOpticalSizing() === other.GetOpticalSizing() &&
      this.GetVariations().length === other.GetVariations().length &&
      this.GetVariations().every(
        /** Original axis vector equality. @param axis - Left value. @param index - Position. @returns Equality. */
        (axis, index) => axis.equals(other.GetVariations()[index] as Variation),
      ) &&
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
      this.mpImplFont.languageTag.equals((other as Font).mpImplFont.languageTag) &&
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
      this.mpImplFont === (other as Font).mpImplFont ||
      (this.EqualIgnoreColor(other) &&
        this.GetColor().equals(other.GetColor()) &&
        this.GetFillColor().equals(other.GetFillColor()))
    );
  }
}

import { FontSubstConfiguration, ImplFontAttrs } from "../../../unotools/inc/fontcfg";
import { GetEnglishSearchFontName } from "../../../unotools/source/misc/fontdefs";
/** Original repeated AskConfig family-choice order, including Italic rather than the generic Script flag. @param type - Native attributes. @returns Chosen family or unknown. */
function FamilyFromAttributes(type: ImplFontAttrs): FontFamily {
  if (type & ImplFontAttrs.Serif) return FontFamily.FAMILY_ROMAN;
  if (type & ImplFontAttrs.SansSerif) return FontFamily.FAMILY_SWISS;
  if (type & ImplFontAttrs.Typewriter) return FontFamily.FAMILY_MODERN;
  if (type & ImplFontAttrs.Italic) return FontFamily.FAMILY_SCRIPT;
  if (type & ImplFontAttrs.Decorative) return FontFamily.FAMILY_DECORATIVE;
  return FontFamily.FAMILY_DONTKNOW;
}
