/** @fileoverview Native wwFont FFN identity and wwFontHelper registration/vector owners. Font-table initialization/export association, binary/RTF output and DOCX embedding remain in their respective unported responsibilities. */
import { FontMapExport, rtl_TextEncodingToWinCharset } from "./writerwordglue";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import type { rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
/** Native FFN identity and original font properties. */
export class wwFont {
  readonly maWW8_FFN = new Uint8Array(6);
  readonly msFamilyNm: string;
  readonly msAltNm: string;
  readonly mbAlt: boolean;
  readonly mePitch: FontPitch;
  readonly meFamily: FontFamily;
  readonly meChrSet: rtl_TextEncoding;
  /** Original value and implicit-copy constructors. @param args - Selected native arguments. @returns Font value. */
  constructor(
    ...args:
      | [familyName: string, pitch: FontPitch, family: FontFamily, encoding: rtl_TextEncoding]
      | [source: wwFont]
  ) {
    const first = args[0];
    if (typeof first !== "string") {
      this.msFamilyNm = first.msFamilyNm;
      this.msAltNm = first.msAltNm;
      this.mbAlt = first.mbAlt;
      this.mePitch = first.mePitch;
      this.meFamily = first.meFamily;
      this.meChrSet = first.meChrSet;
      this.maWW8_FFN.set(first.maWW8_FFN);
      return;
    }
    const [familyName, mePitch, meFamily, meChrSet] = args as [
      string,
      FontPitch,
      FontFamily,
      rtl_TextEncoding,
    ];
    this.mePitch = mePitch;
    this.meFamily = meFamily;
    this.meChrSet = meChrSet & 0xffff;
    const mapped = new FontMapExport(familyName);
    this.msFamilyNm = mapped.msPrimary;
    this.msAltNm = mapped.msSecondary;
    this.mbAlt =
      !!this.msAltNm &&
      this.msAltNm !== this.msFamilyNm &&
      this.msFamilyNm.length + this.msAltNm.length + 2 <= 65;
    this.maWW8_FFN[0] = 5 + 0x22 + 2 * (1 + this.msFamilyNm.length);
    if (this.mbAlt)
      this.maWW8_FFN[0] = (this.maWW8_FFN[0] as number) + 2 * (1 + this.msAltNm.length);
    let flags = 0;
    switch (mePitch) {
      case FontPitch.PITCH_VARIABLE:
        flags |= 2;
        break;
      case FontPitch.PITCH_FIXED:
        flags |= 1;
        break;
    }
    flags |= 4;
    switch (meFamily) {
      case FontFamily.FAMILY_ROMAN:
        flags |= 1 << 4;
        break;
      case FontFamily.FAMILY_SWISS:
        flags |= 2 << 4;
        break;
      case FontFamily.FAMILY_MODERN:
        flags |= 3 << 4;
        break;
      case FontFamily.FAMILY_SCRIPT:
        flags |= 4 << 4;
        break;
      case FontFamily.FAMILY_DECORATIVE:
        flags |= 5 << 4;
        break;
    }
    this.maWW8_FFN[1] = flags;
    this.maWW8_FFN[2] = 0x90;
    this.maWW8_FFN[3] = 1;
    this.maWW8_FFN[4] = rtl_TextEncodingToWinCharset(meChrSet);
    if (this.mbAlt) this.maWW8_FFN[5] = this.msFamilyNm.length + 1;
  }
}
/** Original memcmp-then-Unicode ordering defines map identity. @param left - Left font. @param right - Right font. @returns Strict ordering. */
export function wwFontLess(left: wwFont, right: wwFont): boolean {
  let result = 0;
  for (let index = 0; index < 6; ++index) {
    result = (left.maWW8_FFN[index] as number) - (right.maWW8_FFN[index] as number);
    if (result) break;
  }
  if (!result) {
    result = left.msFamilyNm < right.msFamilyNm ? -1 : left.msFamilyNm > right.msFamilyNm ? 1 : 0;
    if (!result) result = left.msAltNm < right.msAltNm ? -1 : left.msAltNm > right.msAltNm ? 1 : 0;
  }
  return result < 0;
}
/** Native ordered font map retains insertion IDs independently of map order. */
export class wwFontHelper {
  private readonly maFonts: { font: wwFont; id: number }[] = [];
  /** Native font/item overload preserves original equivalence and sal_uInt16 ID narrowing. @param item - Actual font or shared font item. @returns Font ID. */
  GetId(item: wwFont | SvxFontItem): number {
    const font =
      item instanceof SvxFontItem
        ? new wwFont(item.GetFamilyName(), item.GetPitch(), item.GetFamily(), item.GetCharSet())
        : item;
    let index = 0;
    while (
      index < this.maFonts.length &&
      wwFontLess((this.maFonts[index] as { font: wwFont }).font, font)
    )
      ++index;
    const existing = this.maFonts[index];
    if (existing && !wwFontLess(font, existing.font)) return existing.id;
    const id = this.maFonts.length & 0xffff;
    this.maFonts.splice(index, 0, { font: new wwFont(font), id });
    return id;
  }
  /** Original vector is indexed by assigned ID, not sorted map position. @returns Borrowed registered fonts in ID order. */
  AsVector(): readonly (wwFont | null)[] {
    const fonts: (wwFont | null)[] = new Array<wwFont | null>(this.maFonts.length).fill(null);
    for (const { font, id } of this.maFonts) fonts[id] = font;
    return fonts;
  }
}
