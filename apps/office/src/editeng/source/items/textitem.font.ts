/** @fileoverview Original SvxFontItem value fields, construction, mutation, comparison and hashing from fontitem.hxx/textitem.cxx. Existing browser immutable JS strings adapt Unicode value ownership; native Any FontDescriptor and presentation remain unported. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW, type rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
import { rtl_ustr_hashCode_WithLength } from "../../../sal/inc/rtl/ustring.h";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import { getDefaultFontWithoutDevice } from "../../../vcl/source/outdev/font";
import { DefaultFontType } from "../../../unotools/inc/fontdefs";
import { LANGUAGE_ENGLISH_US, LANGUAGE_ARABIC_SAUDI_ARABIA } from "../../../i18nlangtag/inc/lang";
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
/** Calls the actual shared SAL UTF16 hash over the same immutable string units, including embedded zeros/surrogates. @param value - Native Unicode value at this browser item boundary. @returns Native signed32 string hash. */
function stringHash(value: string): number {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return rtl_ustr_hashCode_WithLength(units, units.length);
}
/** Original five-field font attribute; output-device substitution and ODF/CSS strings are not extra attribute fields. */
export class SvxFontItem extends SfxPoolItem {
  private aFamilyName = "";
  private aStyleName = "";
  private eFamily = FontFamily.FAMILY_SWISS;
  private ePitch = FontPitch.PITCH_VARIABLE;
  private eTextEncoding: rtl_TextEncoding = RTL_TEXTENCODING_DONTKNOW;
  /** Original Which-only, full value and implicit copy forms. JS strings preserve native immutable Unicode values without a second memory owner. @param args - Selected native form. @returns Attribute. */
  constructor(
    ...args:
      | [which: number]
      | [
          family: FontFamily,
          familyName: string,
          styleName: string,
          pitch: FontPitch,
          charSet: rtl_TextEncoding,
          which: number,
        ]
      | [source: Readonly<SvxFontItem>]
  ) {
    const first = args[0];
    super(
      typeof first === "number" ? (args.length === 1 ? first : (args[5] as number)) : first.Which(),
    );
    if (typeof first !== "number") {
      this.aFamilyName = first.GetFamilyName();
      this.aStyleName = first.GetStyleName();
      this.eFamily = first.GetFamily();
      this.ePitch = first.GetPitch();
      this.eTextEncoding = first.GetCharSet();
    } else if (args.length === 6) {
      this.eFamily = first;
      this.aFamilyName = args[1];
      this.aStyleName = args[2];
      this.ePitch = args[3];
      this.eTextEncoding = args[4] & 0xffff;
    }
  }
  /** Original default creates the Which-only native constructor with zero identity. @returns Default item. */
  static CreateDefault(): SvxFontItem {
    return new SvxFontItem(0);
  }
  /** Original borrowed Unicode value. @returns Family name. */
  GetFamilyName(): string {
    return this.aFamilyName;
  }
  /** Original value assignment admits empty/whitespace Unicode values. @param value - New name. @returns Nothing. */
  SetFamilyName(value: string): void {
    if (this.aFamilyName === value) return;
    this.aFamilyName = value;
  }
  /** Original borrowed style name. @returns Style. */
  GetStyleName(): string {
    return this.aStyleName;
  }
  /** Original style assignment. @param value - New style. @returns Nothing. */
  SetStyleName(value: string): void {
    if (this.aStyleName === value) return;
    this.aStyleName = value;
  }
  /** Original family enum. @returns Family. */
  GetFamily(): FontFamily {
    return this.eFamily;
  }
  /** Original family assignment. @param value - New family. @returns Nothing. */
  SetFamily(value: FontFamily): void {
    if (this.eFamily === value) return;
    this.eFamily = value;
  }
  /** Original pitch enum. @returns Pitch. */
  GetPitch(): FontPitch {
    return this.ePitch;
  }
  /** Original pitch assignment. @param value - New pitch. @returns Nothing. */
  SetPitch(value: FontPitch): void {
    if (this.ePitch === value) return;
    this.ePitch = value;
  }
  /** Original unsigned16 encoding identifier. @returns Encoding. */
  GetCharSet(): rtl_TextEncoding {
    return this.eTextEncoding;
  }
  /** Original sal_uInt16 argument conversion and assignment. @param value - Encoding. @returns Nothing. */
  SetCharSet(value: rtl_TextEncoding): void {
    const encoding = value & 0xffff;
    if (this.eTextEncoding === encoding) return;
    this.eTextEncoding = encoding;
  }
  /** Original independent value copy retaining Which. @param pool - Unused native pool. @returns Clone. */
  override Clone(pool?: SfxItemPool): SvxFontItem {
    void pool;
    return new SvxFontItem(this);
  }
  /** Original value comparison omits Which; malformed host types fail instead of invoking native debug assertion/downcast. @param other - Candidate. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    if (this === other) return true;
    return (
      other instanceof SvxFontItem &&
      this.eFamily === other.eFamily &&
      this.aFamilyName === other.aFamilyName &&
      this.aStyleName === other.aStyleName &&
      this.ePitch === other.ePitch &&
      this.eTextEncoding === other.eTextEncoding
    );
  }
  /** Original Which/name/style/family/pitch/encoding fold, using existing shared scalar bindings. Not a persisted native size_t ABI. @returns Logical unsigned64 hash. */
  hashCode(): bigint {
    const seed: [bigint] = [0n];
    for (const value of [
      this.Which(),
      stringHash(this.aFamilyName),
      stringHash(this.aStyleName),
      this.eFamily,
      this.ePitch,
      this.eTextEncoding,
    ])
      hash_combine(seed, value);
    return seed[0];
  }
  /** Complete browser persistence projection of actual state; native Any descriptor transport is separately pending. @returns Every native font value field. */
  override QueryValue(): {
    familyName: string;
    styleName: string;
    family: FontFamily;
    pitch: FontPitch;
    charSet: rtl_TextEncoding;
  } {
    return {
      familyName: this.aFamilyName,
      styleName: this.aStyleName,
      family: this.eFamily,
      pitch: this.ePitch,
      charSet: this.eTextEncoding,
    };
  }
}

/** Original ordered GetDefaultFonts item updates at the current actual VCL no-device/OnlyOne metadata boundary. Renderer substitution/AskConfig and the platform thread-encoding service remain unported;the browser boundary uses UTF8. @param latin - Actual Latin item. @param asian - Actual Asian item. @param complex - Actual complex-script item. @returns Nothing. */
export function GetDefaultFonts(
  latin: SvxFontItem,
  asian: SvxFontItem,
  complex: SvxFontItem,
): void {
  const source = [
    [DefaultFontType.LATIN_TEXT, LANGUAGE_ENGLISH_US, latin],
    [DefaultFontType.CJK_TEXT, LANGUAGE_ENGLISH_US, asian],
    [DefaultFontType.CTL_TEXT, LANGUAGE_ARABIC_SAUDI_ARABIA, complex],
  ] as const;
  for (const [role, language, item] of source) {
    const locale = MsLangId.Conversion.convertLanguageToLocale(language, false);
    try {
      const font = getDefaultFontWithoutDevice(role, locale, RTL_TEXTENCODING_UTF8);
      item.SetFamily(font.GetFamilyType());
      item.SetFamilyName(font.GetFamilyName());
      item.SetStyleName("");
      item.SetPitch(font.GetPitch());
      item.SetCharSet(font.GetCharSet());
    } finally {
      locale.dispose();
    }
  }
}
