/** @fileoverview Original SvxBulletItem default/text value constructor,copy,font/scalar setters,equality and text presentation. GraphicObject producers/accessors and CopyValidProperties remain unported;no graphic owner or placeholder is fabricated. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxItemPresentation } from "../../../svl/inc/poolitem";
import type { MapUnit } from "../../../tools/inc/mapunit";
import { Font, type ConstFont } from "../../../vcl/source/font/font";
import { getDefaultFontWithoutDevice } from "../../../vcl/source/outdev/font";
import { GetDefaultFontFlags } from "../../../vcl/rendercontext/GetDefaultFontFlags";
import { DefaultFontType } from "../../../unotools/inc/fontdefs";
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { TextAlign } from "../../../tools/inc/fontenum";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxBulletStyle } from "../../inc/bulletitem";

/** Original default/text-bullet value slice. The actual empty graphic state is the only reachable BMP state until native graphic APIs are ported. */
export class SvxBulletItem extends SfxPoolItem {
  private readonly aFont: Font;
  private aPrevText = "";
  private aFollowText = "";
  private nStart = 1;
  private nStyle = SvxBulletStyle.N123;
  private nWidth = 1200;
  private nScale = 75;
  private cSymbol = 32;
  /** Original Which/default and copy constructors,using actual configured UI locale at the current no-device VCL read site. Native thread encoding remains the existing browser UTF8 boundary. @param source - Which or actual source item. @returns Item. */
  constructor(source: number | SvxBulletItem) {
    super(typeof source === "number" ? source : source.Which());
    if (typeof source !== "number") {
      this.aFont = new Font(source.aFont);
      this.aPrevText = source.aPrevText;
      this.aFollowText = source.aFollowText;
      this.nStart = source.nStart;
      this.nStyle = source.nStyle;
      this.nWidth = source.nWidth;
      this.nScale = source.nScale;
      this.cSymbol = source.cSymbol;
    } else {
      const locale = MsLangId.Conversion.convertLanguageToLocale(
        MsLangId.getConfiguredSystemUILanguage(),
        false,
      );
      try {
        this.aFont = getDefaultFontWithoutDevice(
          DefaultFontType.FIXED,
          locale,
          RTL_TEXTENCODING_UTF8,
          GetDefaultFontFlags.NONE,
        );
      } finally {
        locale.dispose();
      }
      this.aFont.SetAlignment(TextAlign.ALIGN_BOTTOM);
      this.aFont.SetTransparent(true);
    }
  }
  /** Original independent value clone. @param pool - Unused native pool. @returns Clone. */
  override Clone(pool?: SfxItemPool): SvxBulletItem {
    void pool;
    return new SvxBulletItem(this);
  }
  /** Original stored logical width. @returns Width. */
  GetWidth(): number {
    return this.nWidth;
  }
  /** Original stable const font-member reference. @returns Actual font. */
  GetFont(): ConstFont {
    return this.aFont;
  }
  /** Original Unicode16 assignment. @param symbol - Native character. @returns Nothing. */
  SetSymbol(symbol: number): void {
    this.cSymbol = symbol & 0xffff;
  }
  /** Original unsigned16 numbering start. @param value - Start. @returns Nothing. */
  SetStart(value: number): void {
    this.nStart = value & 0xffff;
  }
  /** Original logical-width assignment without extra validation. @param value - Native tools::Long value. @returns Nothing. */
  SetWidth(value: number): void {
    this.nWidth = value;
  }
  /** Original style assignment. @param value - Native enum. @returns Nothing. */
  SetStyle(value: SvxBulletStyle): void {
    this.nStyle = value | 0;
  }
  /** Original font value assignment preserves the recipient member reference. @param font - Actual const font. @returns Nothing. */
  SetFont(font: ConstFont): void {
    this.aFont.assign(font);
  }
  /** Original unsigned16 percentage assignment. @param value - Percentage. @returns Nothing. */
  SetScale(value: number): void {
    this.nScale = value & 0xffff;
  }
  /** Original text concatenation preserves a Unicode16 symbol,including NUL/surrogates. @returns Owned native Unicode value. */
  GetFullText(): OUString {
    return unicode(this.aPrevText + String.fromCharCode(this.cSymbol) + this.aFollowText);
  }
  /** Original payload equality for the represented default/text states;BMP's reachable empty graphic state ignores font exactly as upstream. @param other - Actual compared item. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    if (
      !(other instanceof SvxBulletItem) ||
      this.nStyle !== other.nStyle ||
      this.nScale !== other.nScale ||
      this.nWidth !== other.nWidth ||
      this.nStart !== other.nStart ||
      this.cSymbol !== other.cSymbol ||
      this.aPrevText !== other.aPrevText ||
      this.aFollowText !== other.aFollowText
    )
      return false;
    return this.nStyle === SvxBulletStyle.BMP || this.aFont.Equals(other.aFont);
  }
  /** Original full-text presentation;no translated provider is needed. @param presentation - Ignored degree. @param coreMetric - Ignored unit. @param presentationMetric - Ignored unit. @param output - Native string output. @param intl - Unused provider. @returns True. */
  GetPresentation(
    presentation: SfxItemPresentation,
    coreMetric: MapUnit,
    presentationMetric: MapUnit,
    output: OUString,
    intl: unknown,
  ): boolean {
    void presentation;
    void coreMetric;
    void presentationMetric;
    void intl;
    const value = this.GetFullText();
    try {
      output.assign(value);
    } finally {
      value.dispose();
    }
    return true;
  }
}
