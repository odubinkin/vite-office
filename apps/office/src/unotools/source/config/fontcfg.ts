/** @fileoverview Source-backed DefaultFontConfiguration::getDefaultFont field binding over the shipped VCL DefaultFonts resource. No fake configuration provider, LanguageTag class or output device. */
import resources from "./data/default-fonts.json" with { type: "json" };
import { convertToBcp47 } from "../../../i18nlangtag/source/languagetag/languagetag.conversion";
import { DefaultFontType } from "../../inc/fontdefs";
import {
  getFallbackStrings,
  decomposeCanonicalLanguageTag,
} from "../../../i18nlangtag/source/languagetag/languagetag";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
const defaultFonts: Readonly<Record<string, string>> = resources.en;
const configuration: Readonly<Record<string, Readonly<Record<string, string>>>> = resources;
/** Converts a logical shared value without its trailing terminator. @param value - Shared Unicode value. @returns UTF16 text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Original configured lookup order using the already prepared native Locale representation of a LanguageTag. ISO fields must already be canonical; qlt carries the canonical full tag. Browser/system locale parsing is a separate responsibility. @param locale - Original shared Locale value. @param type - Default-font role. @returns Independent actual OUString containing candidates, empty for an unknown role. */
export function getConfiguredDefaultFont(
  locale: LocaleConstReference,
  type: DefaultFontType,
): OUString {
  const language = text(locale.Language),
    country = text(locale.Country),
    variant = text(locale.Variant);
  const key = DefaultFontType[type] ?? "";
  const tagValue = convertToBcp47(locale);
  let tag: string;
  try {
    tag = text(tagValue);
  } finally {
    tagValue.dispose();
  }
  let result = configuration[tag]?.[key] ?? "";
  if (!result) {
    if (language !== "qlt") {
      if (country) result = configuration[language]?.[key] ?? "";
    } else {
      for (const fallback of getFallbackStrings(decomposeCanonicalLanguageTag(variant))) {
        result = configuration[fallback]?.[key] ?? "";
        if (result) break;
      }
    }
  }
  if (!result) result = defaultFonts[key] ?? "";
  const units = new Uint16Array(result.length);
  for (let i = 0; i < result.length; i++) units[i] = result.charCodeAt(i);
  return new OUString(units, units.length);
}
