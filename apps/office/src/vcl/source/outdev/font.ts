/** @fileoverview Represented OutputDevice::GetDefaultFont metadata and its genuine no-device OnlyOne branch; physical font substitution and unrepresented Font fields remain separate. */
import { Font } from "../font/font";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_SYMBOL,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
import { DefaultFontType } from "../../../unotools/inc/fontdefs";
import { getConfiguredDefaultFont } from "../../../unotools/source/config/fontcfg";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
/** Projects source metadata for a known family name; the name need not represent a physically installed face. @param family - Logical family. @param type - Native role. @param threadEncoding - Actual platform encoding. @returns Independent Font. */
export function createDefaultFontMetadata(
  family: string,
  type: DefaultFontType,
  threadEncoding: rtl_TextEncoding,
): Font {
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

/** Uses the original no-output-device OnlyOne selection of the first configured token. CSS device substitution remains a renderer responsibility. @param type - Known configured native role. @param locale - Resolved prepared locale. @param threadEncoding - Platform encoding. @returns Logical default metadata. */
export function getDefaultFontWithoutDevice(
  type: DefaultFontType,
  locale: LocaleConstReference,
  threadEncoding: rtl_TextEncoding,
): Font {
  const candidates = getConfiguredDefaultFont(locale, type);
  try {
    const names = text(candidates);
    if (!names) throw new Error("Default font role has no configured family");
    return createDefaultFontMetadata(names.split(";")[0] as string, type, threadEncoding);
  } finally {
    candidates.dispose();
  }
}
