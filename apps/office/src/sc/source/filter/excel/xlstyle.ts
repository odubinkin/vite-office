/** @fileoverview Original XclFontData scalar/value contracts over actual Unicode/ComplexColor and native font/API enums. Actual VCL/SVX extraction uses existing font/configuration owners; other style record/export-root owners remain unported. */
import type { ConstFont } from "../../../../vcl/source/font/font";
import { SvxFont, type ConstSvxFont } from "../../../../editeng/inc/svxfont";
import { XclTools } from "./xltools";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { COL_AUTO } from "../../../../tools/inc/color";
import {
  FontFamily as F,
  FontItalic as I,
  FontWeight as W,
  FontLineStyle as L,
  FontStrikeout as S,
} from "../../../../tools/inc/fontenum";
import { FontFamily as A } from "../../../../offapi/com/sun/star/awt/FontFamily";
import { FontSlant } from "../../../../offapi/com/sun/star/awt/FontSlant";
import { FontUnderline } from "../../../../offapi/com/sun/star/awt/FontUnderline";
import { FontStrikeout as ApiStrikeout } from "../../../../offapi/com/sun/star/awt/FontStrikeout";
import { SvxEscapement } from "../../../../editeng/inc/svxenum";
import {
  RTL_TEXTENCODING_APPLE_ROMAN,
  type rtl_TextEncoding,
} from "../../../../sal/inc/rtl/textenc";
import {
  rtl_getTextEncodingFromWindowsCharset,
  rtl_getBestWindowsCharsetFromTextEncoding,
} from "../../../../sal/textenc/tencinfo";
import { ConvertFontWeight } from "../../../../vcl/inc/unohelp";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Original owned font-data value; VM manages physical allocation. */
export class XclFontData {
  readonly maName = new OUString();
  readonly maStyle = new OUString();
  readonly maComplexColor = new ComplexColor();
  mnHeight = 0;
  mnWeight = 0;
  mnEscapem = 0;
  mnFamily = 0;
  mnCharSet = 0;
  mnUnderline = 0;
  mbItalic = false;
  mbStrikeout = false;
  mbOutline = false;
  mbShadow = false;
  /** Original default and implicit member-copy constructors. @param source - Optional actual font data. @returns Font data. */
  constructor(source?: Readonly<XclFontData>);
  /** Original VCL/SVX constructors; explicit base=true selects the erased VCL reference overload for an actual derived font. @param source - Actual font. @param color - Actual complex color. @param base - Explicit VCL reference selection. @returns Font data. */
  constructor(source: ConstFont, color: Readonly<ComplexColor>, base?: true);
  /** Original constructor dispatch preserves Clear-before-VCL and direct-SVX ordering. @param source - Actual value or font. @param color - Required font color. @param base - Erased explicit base-reference overload. @returns Font data. */
  constructor(
    source?: Readonly<XclFontData> | ConstFont,
    color?: Readonly<ComplexColor>,
    base?: true,
  ) {
    if (source === undefined) this.Clear();
    else if (source instanceof XclFontData) {
      this.maName.assign(source.maName);
      this.maStyle.assign(source.maStyle);
      this.maComplexColor.assign(source.maComplexColor);
      this.mnHeight = source.mnHeight;
      this.mnWeight = source.mnWeight;
      this.mnEscapem = source.mnEscapem;
      this.mnFamily = source.mnFamily;
      this.mnCharSet = source.mnCharSet;
      this.mnUnderline = source.mnUnderline;
      this.mbItalic = source.mbItalic;
      this.mbStrikeout = source.mbStrikeout;
      this.mbOutline = source.mbOutline;
      this.mbShadow = source.mbShadow;
    } else if (source instanceof SvxFont && base !== true)
      this.FillFromSvxFont(source, color as Readonly<ComplexColor>);
    else {
      this.Clear();
      this.FillFromVclFont(source as ConstFont, color as Readonly<ComplexColor>);
    }
  }
  /** Original font extraction preserves stored VCL getters, MS font substitution and a complete actual color copy. @param font - Actual const VCL font. @param color - Actual color. @returns Nothing. */
  FillFromVclFont(font: ConstFont, color: Readonly<ComplexColor>): void {
    const sourceName = unicode(font.GetFamilyName());
    try {
      const name = XclTools.GetXclFontName(sourceName);
      try {
        this.maName.assign(name);
      } finally {
        name.dispose();
      }
    } finally {
      sourceName.dispose();
    }
    this.maStyle.clear();
    this.SetScUnderline(font.GetUnderline());
    this.mnEscapem = 0;
    this.SetScHeight(font.GetFontSize().Height());
    this.SetScWeight(font.GetWeight());
    this.SetScFamily(font.GetFamilyType());
    this.SetFontEncoding(font.GetCharSet());
    this.SetScPosture(font.GetItalic());
    this.SetScStrikeout(font.GetStrikeout());
    this.mbOutline = font.IsOutline();
    this.mbShadow = font.IsShadow();
    this.maComplexColor.assign(color);
  }
  /** Original derived-font extraction adds escapement after base extraction. @param font - Actual SVX font. @param color - Actual color. @returns Nothing. */
  FillFromSvxFont(font: ConstSvxFont, color: Readonly<ComplexColor>): void {
    this.FillFromVclFont(font, color);
    this.SetScEscapement(font.GetEscapement());
  }
  /** Original reset uses setColor rather than resetting the complete complex-color value. @returns Nothing. */
  Clear(): void {
    this.maName.clear();
    this.maStyle.clear();
    this.maComplexColor.setColor(COL_AUTO);
    this.mnHeight = 0;
    this.mnWeight = 0;
    this.mnEscapem = 0;
    this.mnFamily = 2;
    this.mnCharSet = 0;
    this.mnUnderline = 0;
    this.mbItalic = this.mbStrikeout = this.mbOutline = this.mbShadow = false;
  }
  /** Original default member destruction. @returns Nothing. */
  Dispose(): void {
    this.maName.dispose();
    this.maStyle.dispose();
  }
  /** Original equality excludes style-name metadata. @param other - Actual value. @returns Equality. */
  equals(other: Readonly<XclFontData>): boolean {
    return (
      this.mnHeight === other.mnHeight &&
      this.mnWeight === other.mnWeight &&
      this.mnUnderline === other.mnUnderline &&
      this.maComplexColor.equals(other.maComplexColor) &&
      this.mnEscapem === other.mnEscapem &&
      this.mnFamily === other.mnFamily &&
      this.mnCharSet === other.mnCharSet &&
      this.mbItalic === other.mbItalic &&
      this.mbStrikeout === other.mbStrikeout &&
      this.mbOutline === other.mbOutline &&
      this.mbShadow === other.mbShadow &&
      this.maName.equals(other.maName)
    );
  }
  /** Original lower-nibble Windows family conversion and Mac-name fallback. @param encoding - Default source encoding. @returns Native family. */
  GetScFamily(encoding: rtl_TextEncoding): F {
    switch (this.mnFamily & 15) {
      case 1:
        return F.FAMILY_ROMAN;
      case 2:
        return F.FAMILY_SWISS;
      case 3:
        return F.FAMILY_MODERN;
      case 4:
        return F.FAMILY_SCRIPT;
      case 5:
        return F.FAMILY_DECORATIVE;
      default:
        return encoding === RTL_TEXTENCODING_APPLE_ROMAN &&
          ["geneva", "chicago"].includes(
            text(this.maName).replace(
              /[A-Z]/g,
              /** Original ASCII-only lower. @param unit - Letter. @returns Lowercase. */ (unit) =>
                unit.toLowerCase(),
            ),
          )
          ? F.FAMILY_SWISS
          : F.FAMILY_DONTKNOW;
    }
  }
  /** Original Windows charset conversion. @returns Native encoding. */
  GetFontEncoding(): rtl_TextEncoding {
    return rtl_getTextEncodingFromWindowsCharset(this.mnCharSet);
  }
  /** Original Boolean posture. @returns Native posture. */
  GetScPosture(): I {
    return this.mbItalic ? I.ITALIC_NORMAL : I.ITALIC_NONE;
  }
  /** Original ordered weight thresholds. @returns Native weight. */
  GetScWeight(): W {
    if (!this.mnWeight) return W.WEIGHT_DONTKNOW;
    for (const [threshold, weight] of [
      [150, W.WEIGHT_THIN],
      [250, W.WEIGHT_ULTRALIGHT],
      [325, W.WEIGHT_LIGHT],
      [375, W.WEIGHT_SEMILIGHT],
      [450, W.WEIGHT_NORMAL],
      [550, W.WEIGHT_MEDIUM],
      [650, W.WEIGHT_SEMIBOLD],
      [750, W.WEIGHT_BOLD],
      [850, W.WEIGHT_ULTRABOLD],
    ] as const)
      if (this.mnWeight < threshold) return weight;
    return W.WEIGHT_BLACK;
  }
  /** Original accounting underlines lose their accounting distinction. @returns Native line style. */
  GetScUnderline(): L {
    return this.mnUnderline === 1 || this.mnUnderline === 0x21
      ? L.LINESTYLE_SINGLE
      : this.mnUnderline === 2 || this.mnUnderline === 0x22
        ? L.LINESTYLE_DOUBLE
        : L.LINESTYLE_NONE;
  }
  /** Original escapement discriminator. @returns Native position. */
  GetScEscapement(): SvxEscapement {
    return this.mnEscapem === 1
      ? SvxEscapement.Superscript
      : this.mnEscapem === 2
        ? SvxEscapement.Subscript
        : SvxEscapement.Off;
  }
  /** Original Boolean strikeout projection. @returns Native style. */
  GetScStrikeout(): S {
    return this.mbStrikeout ? S.STRIKEOUT_SINGLE : S.STRIKEOUT_NONE;
  }
  /** Original upper-only cap followed by unsigned16 conversion. @param value - Signed32 twips. @returns Nothing. */
  SetScHeight(value: number): void {
    this.mnHeight = Math.min(value | 0, 32767) & 0xffff;
  }
  /** Original native-family to Windows-family conversion. @param value - Native family. @returns Nothing. */
  SetScFamily(value: F): void {
    this.mnFamily = [0, 5, 3, 1, 4, 2, 2][value] ?? 0;
  }
  /** Original Windows charset selection. @param value - Native encoding. @returns Nothing. */
  SetFontEncoding(value: rtl_TextEncoding): void {
    this.mnCharSet = rtl_getBestWindowsCharsetFromTextEncoding(value);
  }
  /** Original italic/oblique Boolean conversion. @param value - Native posture. @returns Nothing. */
  SetScPosture(value: I): void {
    this.mbItalic = value === I.ITALIC_OBLIQUE || value === I.ITALIC_NORMAL;
  }
  /** Original enum-to-weight conversion with normal fallback. @param value - Native weight. @returns Nothing. */
  SetScWeight(value: W): void {
    this.mnWeight = [0, 100, 200, 300, 350, 400, 500, 600, 700, 800, 900][value] ?? 400;
  }
  /** Original double-wave and all other underlines collapse to double/single. @param value - Native underline. @returns Nothing. */
  SetScUnderline(value: L): void {
    this.mnUnderline =
      value === L.LINESTYLE_NONE || value === L.LINESTYLE_DONTKNOW
        ? 0
        : value === L.LINESTYLE_DOUBLE || value === L.LINESTYLE_DOUBLEWAVE
          ? 2
          : 1;
  }
  /** Original signed16 position conversion. @param value - Native escapement. @returns Nothing. */
  SetScEscapement(value: number): void {
    value = (value << 16) >> 16;
    this.mnEscapem = value > 0 ? 1 : value < 0 ? 2 : 0;
  }
  /** Original five striking styles become one Boolean. @param value - Native strikeout. @returns Nothing. */
  SetScStrikeout(value: S): void {
    this.mbStrikeout = [
      S.STRIKEOUT_SINGLE,
      S.STRIKEOUT_DOUBLE,
      S.STRIKEOUT_BOLD,
      S.STRIKEOUT_SLASH,
      S.STRIKEOUT_X,
    ].includes(value);
  }
  /** Original float result conversion. @returns API point size. */
  GetApiHeight(): number {
    return Math.fround(this.mnHeight * (1 / 20));
  }
  /** Original API family switch compares the stored byte with VCL family constants, unlike GetScFamily. @returns API family. */
  GetApiFamily(): number {
    return this.mnFamily >= F.FAMILY_DECORATIVE && this.mnFamily <= F.FAMILY_SYSTEM
      ? this.mnFamily
      : A.DONTKNOW;
  }
  /** Original signed16 encoding value. @returns API encoding. */
  GetApiFontEncoding(): number {
    return (this.GetFontEncoding() << 16) >> 16;
  }
  /** Original Boolean API slant. @returns API posture. */
  GetApiPosture(): FontSlant {
    return this.mbItalic ? FontSlant.ITALIC : FontSlant.NONE;
  }
  /** Original VCL conversion. @returns API weight. */
  GetApiWeight(): number {
    return ConvertFontWeight(this.GetScWeight(), "FontWeight");
  }
  /** Original API underline conversion. @returns API underline. */
  GetApiUnderline(): number {
    return this.GetScUnderline() === L.LINESTYLE_SINGLE
      ? FontUnderline.SINGLE
      : this.GetScUnderline() === L.LINESTYLE_DOUBLE
        ? FontUnderline.DOUBLE
        : FontUnderline.NONE;
  }
  /** Original fixed API escapement percentages. @returns API escapement. */
  GetApiEscapement(): number {
    return this.mnEscapem === 1 ? 33 : this.mnEscapem === 2 ? -33 : 0;
  }
  /** Original Boolean API strikeout. @returns API strikeout. */
  GetApiStrikeout(): number {
    return this.mbStrikeout ? ApiStrikeout.SINGLE : ApiStrikeout.NONE;
  }
  /** Original float argument and rounded upper-capped unsigned16 result; negative input remains source-specific. @param value - API points. @returns Nothing. */
  SetApiHeight(value: number): void {
    this.mnHeight = Math.trunc(Math.min(Math.fround(value) * 20 + 0.5, 32767)) & 0xffff;
  }
  /** Original direct VCL-enum family byte assignment, preserving its difference from SetScFamily. @param value - API family. @returns Nothing. */
  SetApiFamily(value: number): void {
    value = (value << 16) >> 16;
    this.mnFamily = value >= A.DECORATIVE && value <= A.SYSTEM ? value : F.FAMILY_DONTKNOW;
  }
  /** Original forward/reverse italic/oblique become one Boolean. @param value - API slant. @returns Nothing. */
  SetApiPosture(value: FontSlant): void {
    this.mbItalic = [
      FontSlant.OBLIQUE,
      FontSlant.ITALIC,
      FontSlant.REVERSE_OBLIQUE,
      FontSlant.REVERSE_ITALIC,
    ].includes(value);
  }
  /** Original float-to-native weight conversion. @param value - API weight. @returns Nothing. */
  SetApiWeight(value: number): void {
    this.SetScWeight(ConvertFontWeight(value, "float"));
  }
  /** Original API underline conversion. @param value - API underline. @returns Nothing. */
  SetApiUnderline(value: number): void {
    this.SetScUnderline(((value << 16) >> 16) as L);
  }
  /** Original API position conversion. @param value - API percentage. @returns Nothing. */
  SetApiEscapement(value: number): void {
    this.SetScEscapement(value);
  }
  /** Original every non-none/non-unknown API strikeout becomes true. @param value - API strikeout. @returns Nothing. */
  SetApiStrikeout(value: number): void {
    value = (value << 16) >> 16;
    this.mbStrikeout = value !== ApiStrikeout.NONE && value !== ApiStrikeout.DONTKNOW;
  }
}
