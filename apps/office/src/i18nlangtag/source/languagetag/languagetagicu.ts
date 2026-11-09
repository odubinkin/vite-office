/** @fileoverview Original LanguageTagIcu locale construction for the ICU service boundary. */
import { Locale } from "../../../external/icu/source/common/locid";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_ASCII_US } from "../../../sal/inc/rtl/textenc";
import { OUStringToOString } from "../../../sal/rtl/ustring-convert";
import { text } from "../isolang/isolang.tables";
import type { LanguageTag } from "../../inc/languagetag";

/** Original invariant ASCII locale transport. @param input - Locale string. @returns ICU name. */
function ascii(input: OUStringConstReference): string {
  return String.fromCharCode(...OUStringToOString(text(input), RTL_TEXTENCODING_ASCII_US));
}

/** Original ISO component branch and full BCP47 branch. @param tag - Actual LanguageTag. @returns ICU locale. */
export function getIcuLocale(tag: LanguageTag): Locale {
  if (tag.isIsoLocale()) {
    const locale = tag.getLocale();
    return locale.Country.getLength() === 0
      ? new Locale(ascii(locale.Language))
      : new Locale(ascii(locale.Language), ascii(locale.Country));
  }
  return new Locale(ascii(tag.getBcp47()));
}
