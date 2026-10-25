/** @fileoverview Represented OutputDevice::GetDefaultFont metadata and its genuine no-device OnlyOne branch; physical font substitution and unrepresented Font fields remain separate. */
import { Font } from "../font/font";
import { GetDefaultFontFlags } from "../../rendercontext/GetDefaultFontFlags";
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
import type { FontCharMap } from "../font/fontcharmap";

/** Consumed OutputDevice::HasGlyphs loop over the actual face map, retaining native UTF16-unit iteration and failure offsets. @param map - Current physical face map, absent when unavailable. @param value - Requested text. @param index - First UTF16 offset. @param length - Requested length or minus one. @returns First missing offset or minus one. */
export function hasGlyphsInFontCharMap(
  map: FontCharMap | undefined,
  value: string,
  index = 0,
  length = -1,
): number {
  if (index >= value.length) return index;
  const end = length === -1 ? value.length : Math.min(value.length, index + length);
  if (map === undefined || map.IsDefaultMap()) return index;
  for (let i = index; index < end; ++i, ++index)
    if (!map.HasChar(value.charCodeAt(i))) return index;
  return -1;
}
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

/** Uses original no-output-device candidate selection and UI-font fallback. Existing browser callers retain their OnlyOne default;native NONE callers keep the complete candidate string. CSS device substitution remains a renderer responsibility. @param type - Native role. @param locale - Resolved prepared locale. @param threadEncoding - Platform encoding. @param flags - Original native selection bits at this consumed read site. @returns Logical default metadata. */
export function getDefaultFontWithoutDevice(
  type: DefaultFontType,
  locale: LocaleConstReference,
  threadEncoding: rtl_TextEncoding,
  flags: GetDefaultFontFlags = GetDefaultFontFlags.OnlyOne,
): Font {
  let candidates = getConfiguredDefaultFont(locale, type);
  if (candidates.isEmpty()) {
    candidates.dispose();
    // Original GetDefaultFont -> getUserInterfaceFont read site. For this shipped
    // immutable resource,the original getDefaultFont(UI_SANS) lookup always finds
    // its real en fallback;no missing-provider or translated settings facade.
    candidates = getConfiguredDefaultFont(locale, DefaultFontType.UI_SANS);
  }
  try {
    const names = text(candidates);
    return createDefaultFontMetadata(
      (flags & GetDefaultFontFlags.OnlyOne) !== 0 ? (names.split(";")[0] as string) : names,
      type,
      threadEncoding,
    );
  } finally {
    candidates.dispose();
  }
}
