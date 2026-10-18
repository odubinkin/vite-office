/** @fileoverview Browser projection of represented VCL GetDefaultFont metadata for an actually matched configured family;physical fallback and unrepresented Font fields remain separate. */
import { Font } from "../source/font/font";
import { FontFamily, FontPitch } from "../../tools/inc/fontenum";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_SYMBOL,
  type rtl_TextEncoding,
} from "../../sal/inc/rtl/textenc";
import { DefaultFontType } from "../../unotools/inc/fontdefs";
import type { LocaleConstReference } from "../../udkapi/com/sun/star/lang/Locale";
import type { BrowserDefaultFontDevice } from "./default-font-device";
/** Projects only the configured/matched native branch into the existing real Font value. The platform explicitly supplies its text encoding;missing loaded families stay absent. No OutputDevice or physical-font provider is fabricated. @param device - Actual registered-family device. @param type - Native role. @param locale - Prepared locale. @param threadEncoding - Explicit platform text encoding. @returns Independent represented Font metadata or absence. */
export function getBrowserDefaultFontMetadata(
  device: BrowserDefaultFontDevice,
  type: DefaultFontType,
  locale: LocaleConstReference,
  threadEncoding: rtl_TextEncoding,
): Font | undefined {
  const family = device.getDefaultFont(type, locale);
  if (family === undefined) return undefined;
  const font = new Font();
  font.SetPitch(FontPitch.PITCH_VARIABLE);
  switch (type) {
    case DefaultFontType.SANS_UNICODE:
    case DefaultFontType.UI_SANS:
    case DefaultFontType.SANS:
    case DefaultFontType.LATIN_HEADING:
    case DefaultFontType.LATIN_SPREADSHEET:
    case DefaultFontType.LATIN_DISPLAY:
      font.SetFamily(FontFamily.FAMILY_SWISS);
      break;
    case DefaultFontType.SERIF:
    case DefaultFontType.LATIN_TEXT:
    case DefaultFontType.LATIN_PRESENTATION:
      font.SetFamily(FontFamily.FAMILY_ROMAN);
      break;
    case DefaultFontType.FIXED:
    case DefaultFontType.LATIN_FIXED:
    case DefaultFontType.UI_FIXED:
      font.SetPitch(FontPitch.PITCH_FIXED);
      font.SetFamily(FontFamily.FAMILY_MODERN);
      break;
    case DefaultFontType.SYMBOL:
      font.SetCharSet(RTL_TEXTENCODING_SYMBOL);
      break;
    case DefaultFontType.CJK_TEXT:
    case DefaultFontType.CJK_PRESENTATION:
    case DefaultFontType.CJK_SPREADSHEET:
    case DefaultFontType.CJK_HEADING:
    case DefaultFontType.CJK_DISPLAY:
    case DefaultFontType.CTL_TEXT:
    case DefaultFontType.CTL_PRESENTATION:
    case DefaultFontType.CTL_SPREADSHEET:
    case DefaultFontType.CTL_HEADING:
    case DefaultFontType.CTL_DISPLAY:
      font.SetFamily(FontFamily.FAMILY_SYSTEM);
      break;
  }
  font.SetFontHeight(12);
  if (font.GetCharSet() === RTL_TEXTENCODING_DONTKNOW) font.SetCharSet(threadEncoding);
  font.SetFamilyName(family);
  return font;
}
